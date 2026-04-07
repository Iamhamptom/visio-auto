/**
 * POST /api/commerce/subscriptions
 *
 * Start a recurring subscription for any catalog subscription SKU.
 * Creates a `pending_payment` subscription row + Yoco checkout for the
 * first month. Webhook activates the subscription on payment.
 *
 * Body:
 *   {
 *     buyer_email: string,
 *     buyer_phone?: string,
 *     buyer_name?: string,
 *     dealer_id?: string,
 *     sku: string,
 *     data_source: string,
 *     source_metadata?: object
 *   }
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createSubscription,
  attachYocoCheckoutToSubscription,
} from "@/lib/commerce/db";
import { createCheckout } from "@/lib/payments/yoco";
import { CATALOG_BY_SKU } from "@/lib/commerce/catalog";

const SubSchema = z.object({
  buyer_email: z.string().email(),
  buyer_phone: z.string().optional(),
  buyer_name: z.string().optional(),
  dealer_id: z.string().optional(),
  sku: z.string().min(1),
  data_source: z.string().min(3),
  source_metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = SubSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const item = CATALOG_BY_SKU[parsed.data.sku];
  if (!item) {
    return NextResponse.json(
      { error: `Unknown SKU: ${parsed.data.sku}` },
      { status: 400 }
    );
  }
  if (item.family !== "subscription") {
    return NextResponse.json(
      {
        error: `SKU ${parsed.data.sku} is family=${item.family}, not subscription. Use /api/commerce/orders for one-off purchases.`,
      },
      { status: 400 }
    );
  }
  if (!item.selfServe) {
    return NextResponse.json(
      {
        error: `SKU ${parsed.data.sku} is quote-only. Contact concierge@visiocorp.co.`,
      },
      { status: 400 }
    );
  }

  // 1. Create subscription row
  const subResult = await createSubscription(parsed.data);
  if (subResult.error || !subResult.subscription) {
    return NextResponse.json(
      {
        error: subResult.error ?? "Failed to create subscription",
        hint:
          "If you see 'relation va_commerce_subscriptions does not exist', apply supabase/migrations/20260407_commerce.sql first.",
      },
      { status: 500 }
    );
  }

  // 2. Create Yoco checkout for the first month's payment
  const sub = subResult.subscription;
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://visio-auto.vercel.app";

  let checkout;
  try {
    checkout = await createCheckout({
      amountInCents: sub.amount_cents,
      description: `${item.label} — first month (${sub.subscription_number})`,
      successUrl: `${baseUrl}/shop/success?subscription=${sub.subscription_number}`,
      cancelUrl: `${baseUrl}/shop?cancelled=${sub.subscription_number}`,
      failureUrl: `${baseUrl}/shop?failed=${sub.subscription_number}`,
      metadata: {
        kind: "commerce_subscription",
        subscription_id: sub.id,
        subscription_number: sub.subscription_number,
        sku: sub.sku,
        buyer_email: sub.buyer_email,
      },
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: "Yoco checkout creation failed",
        details: (e as Error).message,
        subscription: sub,
      },
      { status: 502 }
    );
  }

  await attachYocoCheckoutToSubscription(sub.id, checkout.id);

  return NextResponse.json(
    {
      ok: true,
      subscription: { ...sub, yoco_initial_checkout_id: checkout.id },
      sku_label: item.label,
      first_payment_amount_zar: sub.amount_cents / 100,
      checkout: {
        id: checkout.id,
        redirect_url: checkout.redirectUrl,
        status: checkout.status,
      },
      grants_on_payment: item.grants,
      next_step:
        "Send the buyer to checkout.redirect_url. The webhook at /api/commerce/webhook will activate the subscription and grant entitlements when payment succeeds.",
    },
    { status: 201 }
  );
}
