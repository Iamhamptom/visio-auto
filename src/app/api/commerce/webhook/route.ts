/**
 * POST /api/commerce/webhook
 *
 * Yoco webhook handler for the commerce system.
 *
 * On `payment.succeeded` events, this route:
 *   1. Verifies the Yoco webhook signature (when YOCO_WEBHOOK_SECRET is set)
 *   2. Looks up the order or subscription via the Yoco metadata
 *   3. Marks the order paid OR activates the subscription
 *   4. Records the payment in va_commerce_payments
 *   5. Grants entitlements based on the SKU snapshot
 *
 * On `payment.failed` events, it records the failure for audit but does
 * NOT grant entitlements.
 *
 * This is the SINGLE source of truth for "is this user now entitled".
 * Sibling apps can trust va_commerce_entitlements completely.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/payments/yoco";
import {
  activateSubscription,
  attachYocoCheckoutToOrder,
  attachYocoCheckoutToSubscription,
  getOrderByYocoCheckoutId,
  getSubscriptionByYocoCheckoutId,
  grantEntitlements,
  markOrderPaid,
  recordPayment,
} from "@/lib/commerce/db";
import { CATALOG_BY_SKU } from "@/lib/commerce/catalog";
import { createClient } from "@/lib/supabase/server";

interface YocoWebhookPayload {
  type: string;
  payload?: {
    id?: string;
    checkoutId?: string;
    amount?: number;
    metadata?: Record<string, string>;
  };
}

export async function POST(request: NextRequest) {
  // 1. Read the raw body for signature verification
  const rawBody = await request.text();
  const signature = request.headers.get("webhook-signature") ?? "";

  // 2. Verify signature when secret is configured (production)
  if (process.env.YOCO_WEBHOOK_SECRET) {
    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }
  }

  // 3. Parse the event
  let event: YocoWebhookPayload;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = event.type ?? "unknown";
  const yocoPaymentId = event.payload?.id;
  const yocoCheckoutId = event.payload?.checkoutId;
  const yocoMetadata = event.payload?.metadata ?? {};
  const amountCents = event.payload?.amount ?? 0;

  // 4. Route by event type
  if (eventType === "payment.succeeded") {
    return handlePaymentSucceeded({
      yocoPaymentId,
      yocoCheckoutId,
      yocoMetadata,
      amountCents,
    });
  }

  if (eventType === "payment.failed") {
    return handlePaymentFailed({
      yocoPaymentId,
      yocoCheckoutId,
      yocoMetadata,
      amountCents,
    });
  }

  // Unhandled event type — record + 200 (Yoco retries non-2xx)
  return NextResponse.json({ ok: true, ignored: true, type: eventType });
}

async function handlePaymentSucceeded(opts: {
  yocoPaymentId: string | undefined;
  yocoCheckoutId: string | undefined;
  yocoMetadata: Record<string, string>;
  amountCents: number;
}) {
  const kind = opts.yocoMetadata.kind;

  if (kind === "commerce_order") {
    return processOrderPayment(opts);
  }
  if (kind === "commerce_subscription") {
    return processSubscriptionPayment(opts);
  }

  // Unknown kind — record for audit but do not grant
  await recordPayment({
    amount_cents: opts.amountCents,
    yoco_event_type: "payment.succeeded",
    yoco_payment_id: opts.yocoPaymentId,
    yoco_checkout_id: opts.yocoCheckoutId,
    yoco_metadata: opts.yocoMetadata,
    status: "succeeded",
  });
  return NextResponse.json({
    ok: true,
    note: "payment recorded but no commerce kind matched — likely a base-tier signup, handled by /api/payments/yoco/webhook",
  });
}

async function processOrderPayment(opts: {
  yocoPaymentId: string | undefined;
  yocoCheckoutId: string | undefined;
  yocoMetadata: Record<string, string>;
  amountCents: number;
}) {
  const orderId = opts.yocoMetadata.order_id;
  if (!orderId) {
    return NextResponse.json(
      { error: "Missing order_id in metadata" },
      { status: 400 }
    );
  }

  // Try lookup by checkout id first (most reliable)
  let order = opts.yocoCheckoutId
    ? await getOrderByYocoCheckoutId(opts.yocoCheckoutId)
    : null;

  if (!order) {
    // Fallback: direct DB lookup by id
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("va_commerce_orders")
        .select("*")
        .eq("id", orderId)
        .maybeSingle();
      order = data ?? null;
    } catch {
      /* ignore */
    }
  }

  if (!order) {
    return NextResponse.json(
      { error: `Order ${orderId} not found` },
      { status: 404 }
    );
  }

  // 1. Mark order paid
  if (opts.yocoPaymentId) {
    await markOrderPaid(order.id, opts.yocoPaymentId);
  }

  // 2. Record payment
  await recordPayment({
    order_id: order.id,
    amount_cents: opts.amountCents,
    yoco_event_type: "payment.succeeded",
    yoco_payment_id: opts.yocoPaymentId,
    yoco_checkout_id: opts.yocoCheckoutId,
    yoco_metadata: opts.yocoMetadata,
    status: "succeeded",
  });

  // 3. Grant entitlements based on the order's items
  try {
    const supabase = await createClient();
    const { data: items } = await supabase
      .from("va_commerce_order_items")
      .select("sku, grants_json")
      .eq("order_id", order.id);

    if (items && items.length > 0) {
      // Collect all grants across all items
      const allGrants = items.flatMap((it) => {
        const fromJson = Array.isArray(it.grants_json) ? (it.grants_json as string[]) : [];
        // Defensive: also pull from catalog snapshot in case grants_json was empty
        const fromCatalog = CATALOG_BY_SKU[it.sku]?.grants ?? [];
        return Array.from(new Set([...fromJson, ...fromCatalog]));
      });
      const uniqueGrants = Array.from(new Set(allGrants));

      // Group by product_key for the entitlement insert
      const byProduct: Record<string, string[]> = {};
      for (const grant of uniqueGrants) {
        const productKey = grant.split(":")[0];
        if (!byProduct[productKey]) byProduct[productKey] = [];
        byProduct[productKey].push(grant);
      }

      for (const [productKey, keys] of Object.entries(byProduct)) {
        await grantEntitlements({
          buyer_email: order.buyer_email,
          dealer_id: order.dealer_id ?? undefined,
          entitlement_keys: keys,
          product_key: productKey,
          granted_by: "order",
          order_id: order.id,
        });
      }
    }
  } catch (e) {
    return NextResponse.json(
      {
        ok: true,
        warning: "order marked paid + payment recorded, but entitlement grant failed",
        details: (e as Error).message,
        order_id: order.id,
      },
      { status: 200 }
    );
  }

  return NextResponse.json({ ok: true, order_id: order.id, status: "paid" });
}

async function processSubscriptionPayment(opts: {
  yocoPaymentId: string | undefined;
  yocoCheckoutId: string | undefined;
  yocoMetadata: Record<string, string>;
  amountCents: number;
}) {
  const subscriptionId = opts.yocoMetadata.subscription_id;
  if (!subscriptionId) {
    return NextResponse.json(
      { error: "Missing subscription_id in metadata" },
      { status: 400 }
    );
  }

  // Try lookup via checkout id first
  let sub = opts.yocoCheckoutId
    ? await getSubscriptionByYocoCheckoutId(opts.yocoCheckoutId)
    : null;

  if (!sub) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("va_commerce_subscriptions")
        .select("*")
        .eq("id", subscriptionId)
        .maybeSingle();
      sub = data ?? null;
    } catch {
      /* ignore */
    }
  }

  if (!sub) {
    return NextResponse.json(
      { error: `Subscription ${subscriptionId} not found` },
      { status: 404 }
    );
  }

  // 1. Activate
  await activateSubscription(sub.id);

  // 2. Record payment
  await recordPayment({
    subscription_id: sub.id,
    amount_cents: opts.amountCents,
    yoco_event_type: "payment.succeeded",
    yoco_payment_id: opts.yocoPaymentId,
    yoco_checkout_id: opts.yocoCheckoutId,
    yoco_metadata: opts.yocoMetadata,
    status: "succeeded",
  });

  // 3. Grant entitlements from the catalog snapshot
  const catalogItem = CATALOG_BY_SKU[sub.sku];
  if (catalogItem && catalogItem.grants.length > 0) {
    // Set expires_at to one billing period from now
    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + (sub.billing_cadence_days ?? 30) + 3 // 3 day grace
    );

    await grantEntitlements({
      buyer_email: sub.buyer_email,
      dealer_id: sub.dealer_id ?? undefined,
      entitlement_keys: catalogItem.grants as unknown as string[],
      product_key: catalogItem.product,
      granted_by: "subscription",
      subscription_id: sub.id,
      expires_at: expiresAt.toISOString(),
    });
  }

  return NextResponse.json({
    ok: true,
    subscription_id: sub.id,
    status: "active",
    grants_applied: catalogItem?.grants ?? [],
  });
}

async function handlePaymentFailed(opts: {
  yocoPaymentId: string | undefined;
  yocoCheckoutId: string | undefined;
  yocoMetadata: Record<string, string>;
  amountCents: number;
}) {
  await recordPayment({
    amount_cents: opts.amountCents,
    yoco_event_type: "payment.failed",
    yoco_payment_id: opts.yocoPaymentId,
    yoco_checkout_id: opts.yocoCheckoutId,
    yoco_metadata: opts.yocoMetadata,
    status: "failed",
  });
  return NextResponse.json({ ok: true, recorded: "failed" });
}

// `attachYocoCheckoutToOrder` and `attachYocoCheckoutToSubscription` are imported
// for type completeness — they're used in the orders/subscriptions routes,
// but importing here keeps the helper layer cohesive.
void attachYocoCheckoutToOrder;
void attachYocoCheckoutToSubscription;
