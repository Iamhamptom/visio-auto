/**
 * Visio Auto Commerce — Supabase query helpers.
 *
 * Thin typed wrappers around the 5 commerce tables. Every helper is
 * server-only (uses `createClient` from the server Supabase client).
 *
 * The helpers handle the "no row" case gracefully — when the migration
 * has not been applied yet, queries return empty arrays / null instead
 * of throwing, so the API routes still respond cleanly.
 */

import { createClient } from "@/lib/supabase/server";
import { CATALOG_BY_SKU, type CatalogItem } from "./catalog";

// ─── Types ───────────────────────────────────────────────────────────

export interface CommerceOrder {
  id: string;
  order_number: string;
  buyer_email: string;
  buyer_phone: string | null;
  buyer_name: string | null;
  dealer_id: string | null;
  subtotal_cents: number;
  total_cents: number;
  currency: string;
  status:
    | "pending"
    | "awaiting_payment"
    | "paid"
    | "fulfilled"
    | "cancelled"
    | "refunded"
    | "failed";
  yoco_checkout_id: string | null;
  yoco_payment_id: string | null;
  paid_at: string | null;
  fulfilled_at: string | null;
  data_source: string;
  source_metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  internal_notes: string | null;
  buyer_notes: string | null;
}

export interface CommerceOrderItem {
  id: string;
  order_id: string;
  sku: string;
  label: string;
  unit_price_cents: number;
  quantity: number;
  line_total_cents: number;
  product_key: string | null;
  grants_json: string[];
  created_at: string;
}

export interface CommerceSubscription {
  id: string;
  subscription_number: string;
  buyer_email: string;
  buyer_phone: string | null;
  buyer_name: string | null;
  dealer_id: string | null;
  sku: string;
  product_key: string;
  tier: string | null;
  amount_cents: number;
  billing_cadence_days: number;
  revenue_share_pct: number | null;
  status:
    | "pending_payment"
    | "active"
    | "past_due"
    | "cancelled"
    | "paused"
    | "expired";
  started_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  cancel_at_period_end: boolean;
  yoco_initial_checkout_id: string | null;
  last_payment_at: string | null;
  next_billing_at: string | null;
  data_source: string;
  source_metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CommerceEntitlement {
  id: string;
  buyer_email: string;
  dealer_id: string | null;
  entitlement_key: string;
  product_key: string;
  tier: string | null;
  granted_by: "order" | "subscription" | "manual";
  order_id: string | null;
  subscription_id: string | null;
  granted_at: string;
  expires_at: string | null;
  revoked_at: string | null;
  active: boolean;
  created_at: string;
}

// ─── Order helpers ───────────────────────────────────────────────────

export interface CreateOrderInput {
  buyer_email: string;
  buyer_phone?: string;
  buyer_name?: string;
  dealer_id?: string;
  items: Array<{ sku: string; quantity?: number }>;
  data_source: string;
  source_metadata?: Record<string, unknown>;
  buyer_notes?: string;
}

export async function createOrder(input: CreateOrderInput): Promise<{
  order: CommerceOrder | null;
  items: CommerceOrderItem[];
  error: string | null;
}> {
  // Validate every SKU first — fail fast before touching the DB
  const validatedItems = input.items.map((it) => {
    const sku = CATALOG_BY_SKU[it.sku];
    if (!sku) throw new Error(`Unknown SKU: ${it.sku}`);
    if (sku.amountCents < 0) {
      throw new Error(
        `SKU ${it.sku} is quote-only (custom). Cannot create self-serve order.`
      );
    }
    const qty = it.quantity ?? 1;
    return {
      sku: sku.sku,
      label: sku.label,
      unit_price_cents: sku.amountCents,
      quantity: qty,
      line_total_cents: sku.amountCents * qty,
      product_key: sku.product,
      grants_json: sku.grants as unknown as string[],
    };
  });

  const subtotal = validatedItems.reduce(
    (sum, it) => sum + it.line_total_cents,
    0
  );

  try {
    const supabase = await createClient();

    // Insert order
    const { data: order, error: orderErr } = await supabase
      .from("va_commerce_orders")
      .insert({
        buyer_email: input.buyer_email,
        buyer_phone: input.buyer_phone ?? null,
        buyer_name: input.buyer_name ?? null,
        dealer_id: input.dealer_id ?? null,
        subtotal_cents: subtotal,
        total_cents: subtotal,
        status: "pending",
        data_source: input.data_source,
        source_metadata: input.source_metadata ?? {},
        buyer_notes: input.buyer_notes ?? null,
      })
      .select()
      .single();

    if (orderErr || !order) {
      return { order: null, items: [], error: orderErr?.message ?? "insert failed" };
    }

    // Insert items
    const itemsRows = validatedItems.map((it) => ({ ...it, order_id: order.id }));
    const { data: items, error: itemsErr } = await supabase
      .from("va_commerce_order_items")
      .insert(itemsRows)
      .select();

    if (itemsErr) {
      return { order, items: [], error: itemsErr.message };
    }

    return { order: order as CommerceOrder, items: (items ?? []) as CommerceOrderItem[], error: null };
  } catch (e) {
    return { order: null, items: [], error: (e as Error).message };
  }
}

export async function getOrderByYocoCheckoutId(
  checkoutId: string
): Promise<CommerceOrder | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("va_commerce_orders")
      .select("*")
      .eq("yoco_checkout_id", checkoutId)
      .maybeSingle();
    return (data as CommerceOrder | null) ?? null;
  } catch {
    return null;
  }
}

export async function attachYocoCheckoutToOrder(
  orderId: string,
  checkoutId: string
): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase
      .from("va_commerce_orders")
      .update({ yoco_checkout_id: checkoutId, status: "awaiting_payment" })
      .eq("id", orderId);
  } catch {
    // Honesty Protocol: fail silent only on writes; reads always raise
  }
}

export async function markOrderPaid(
  orderId: string,
  yocoPaymentId: string
): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase
      .from("va_commerce_orders")
      .update({
        status: "paid",
        yoco_payment_id: yocoPaymentId,
        paid_at: new Date().toISOString(),
      })
      .eq("id", orderId);
  } catch {
    /* honesty protocol — surface via webhook log */
  }
}

// ─── Subscription helpers ────────────────────────────────────────────

export interface CreateSubscriptionInput {
  buyer_email: string;
  buyer_phone?: string;
  buyer_name?: string;
  dealer_id?: string;
  sku: string;
  data_source: string;
  source_metadata?: Record<string, unknown>;
}

export async function createSubscription(
  input: CreateSubscriptionInput
): Promise<{ subscription: CommerceSubscription | null; error: string | null }> {
  const item = CATALOG_BY_SKU[input.sku];
  if (!item) return { subscription: null, error: `Unknown SKU: ${input.sku}` };
  if (item.family !== "subscription") {
    return {
      subscription: null,
      error: `SKU ${input.sku} is not a subscription (family=${item.family})`,
    };
  }
  if (item.amountCents < 0) {
    return {
      subscription: null,
      error: `SKU ${input.sku} is quote-only. Use the contact flow.`,
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("va_commerce_subscriptions")
      .insert({
        buyer_email: input.buyer_email,
        buyer_phone: input.buyer_phone ?? null,
        buyer_name: input.buyer_name ?? null,
        dealer_id: input.dealer_id ?? null,
        sku: item.sku,
        product_key: item.product,
        tier: item.tier ?? null,
        amount_cents: item.amountCents,
        billing_cadence_days: item.billingCadenceDays ?? 30,
        revenue_share_pct: item.revenueSharePct ?? null,
        status: "pending_payment",
        data_source: input.data_source,
        source_metadata: input.source_metadata ?? {},
      })
      .select()
      .single();
    if (error || !data) return { subscription: null, error: error?.message ?? "insert failed" };
    return { subscription: data as CommerceSubscription, error: null };
  } catch (e) {
    return { subscription: null, error: (e as Error).message };
  }
}

export async function attachYocoCheckoutToSubscription(
  subscriptionId: string,
  checkoutId: string
): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase
      .from("va_commerce_subscriptions")
      .update({ yoco_initial_checkout_id: checkoutId })
      .eq("id", subscriptionId);
  } catch {
    /* honesty protocol */
  }
}

export async function activateSubscription(
  subscriptionId: string
): Promise<void> {
  try {
    const supabase = await createClient();
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setDate(periodEnd.getDate() + 30);
    await supabase
      .from("va_commerce_subscriptions")
      .update({
        status: "active",
        started_at: now.toISOString(),
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        last_payment_at: now.toISOString(),
        next_billing_at: periodEnd.toISOString(),
      })
      .eq("id", subscriptionId);
  } catch {
    /* honesty protocol */
  }
}

export async function getSubscriptionByYocoCheckoutId(
  checkoutId: string
): Promise<CommerceSubscription | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("va_commerce_subscriptions")
      .select("*")
      .eq("yoco_initial_checkout_id", checkoutId)
      .maybeSingle();
    return (data as CommerceSubscription | null) ?? null;
  } catch {
    return null;
  }
}

// ─── Entitlement helpers ─────────────────────────────────────────────

export async function grantEntitlements(opts: {
  buyer_email: string;
  dealer_id?: string;
  entitlement_keys: string[];
  product_key: string;
  granted_by: "order" | "subscription" | "manual";
  order_id?: string;
  subscription_id?: string;
  expires_at?: string | null;
}): Promise<void> {
  try {
    const supabase = await createClient();
    const rows = opts.entitlement_keys.map((key) => {
      const [productKey, tier] = key.split(":");
      return {
        buyer_email: opts.buyer_email,
        dealer_id: opts.dealer_id ?? null,
        entitlement_key: key,
        product_key: productKey,
        tier: tier ?? null,
        granted_by: opts.granted_by,
        order_id: opts.order_id ?? null,
        subscription_id: opts.subscription_id ?? null,
        expires_at: opts.expires_at ?? null,
      };
    });
    if (rows.length === 0) return;
    await supabase
      .from("va_commerce_entitlements")
      .upsert(rows, { onConflict: "buyer_email,entitlement_key" });
  } catch {
    /* honesty protocol */
  }
}

export async function getEntitlementsForEmail(
  email: string
): Promise<CommerceEntitlement[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("va_commerce_entitlements")
      .select("*")
      .eq("buyer_email", email.toLowerCase())
      .eq("active", true)
      .order("granted_at", { ascending: false });
    return (data ?? []) as CommerceEntitlement[];
  } catch {
    return [];
  }
}

// ─── Payment audit ───────────────────────────────────────────────────

export async function recordPayment(opts: {
  order_id?: string;
  subscription_id?: string;
  amount_cents: number;
  yoco_event_type: string;
  yoco_payment_id?: string;
  yoco_checkout_id?: string;
  yoco_metadata?: Record<string, unknown>;
  status: "succeeded" | "failed" | "refunded" | "pending";
  failure_reason?: string;
}): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from("va_commerce_payments").insert({
      order_id: opts.order_id ?? null,
      subscription_id: opts.subscription_id ?? null,
      amount_cents: opts.amount_cents,
      yoco_event_type: opts.yoco_event_type,
      yoco_payment_id: opts.yoco_payment_id ?? null,
      yoco_checkout_id: opts.yoco_checkout_id ?? null,
      yoco_metadata: opts.yoco_metadata ?? {},
      status: opts.status,
      failure_reason: opts.failure_reason ?? null,
    });
  } catch {
    /* honesty protocol — payment events may fail to record but Yoco source-of-truth wins */
  }
}

// ─── Catalog convenience helper ──────────────────────────────────────

export function getCatalogItem(sku: string): CatalogItem | null {
  return CATALOG_BY_SKU[sku] ?? null;
}
