/**
 * POST /api/commerce/orders
 *
 * Create a one-off commerce order for any catalog SKU.
 * Returns the order + a Yoco checkout URL the buyer can click immediately.
 *
 * Body:
 *   {
 *     buyer_email: string,
 *     buyer_phone?: string,
 *     buyer_name?: string,
 *     dealer_id?: string,
 *     items: [{ sku: string, quantity?: number }],
 *     data_source: "jess_chat" | "shop_page" | "api" | "manual",
 *     buyer_notes?: string
 *   }
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createOrder, attachYocoCheckoutToOrder } from "@/lib/commerce/db";
import { createCheckout } from "@/lib/payments/yoco";

const OrderSchema = z.object({
  buyer_email: z.string().email(),
  buyer_phone: z.string().optional(),
  buyer_name: z.string().optional(),
  dealer_id: z.string().optional(),
  items: z
    .array(
      z.object({
        sku: z.string().min(1),
        quantity: z.number().int().positive().optional(),
      })
    )
    .min(1),
  data_source: z.string().min(3),
  source_metadata: z.record(z.string(), z.unknown()).optional(),
  buyer_notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = OrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  // 1. Create the order in the database
  let orderResult;
  try {
    orderResult = await createOrder(parsed.data);
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "Failed to create order" },
      { status: 400 }
    );
  }

  if (orderResult.error || !orderResult.order) {
    return NextResponse.json(
      {
        error: orderResult.error ?? "Failed to create order",
        hint:
          "If you see 'relation va_commerce_orders does not exist', apply the supabase/migrations/20260407_commerce.sql migration first.",
      },
      { status: 500 }
    );
  }

  // 2. Create the Yoco checkout
  const order = orderResult.order;
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://visio-auto.vercel.app";
  const description = `Visio Auto — Order ${order.order_number}`;

  let checkout;
  try {
    checkout = await createCheckout({
      amountInCents: order.total_cents,
      description,
      successUrl: `${baseUrl}/shop/success?order=${order.order_number}`,
      cancelUrl: `${baseUrl}/shop?cancelled=${order.order_number}`,
      failureUrl: `${baseUrl}/shop?failed=${order.order_number}`,
      metadata: {
        kind: "commerce_order",
        order_id: order.id,
        order_number: order.order_number,
        buyer_email: order.buyer_email,
      },
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: "Yoco checkout creation failed",
        details: (e as Error).message,
        order, // return the order so the buyer can be retried
      },
      { status: 502 }
    );
  }

  // 3. Attach the checkout id back to the order row
  await attachYocoCheckoutToOrder(order.id, checkout.id);

  return NextResponse.json(
    {
      ok: true,
      order: { ...order, status: "awaiting_payment", yoco_checkout_id: checkout.id },
      items: orderResult.items,
      checkout: {
        id: checkout.id,
        redirect_url: checkout.redirectUrl,
        status: checkout.status,
      },
      next_step:
        "Send the buyer to checkout.redirect_url. The webhook at /api/commerce/webhook will activate the order and grant entitlements when payment succeeds.",
    },
    { status: 201 }
  );
}
