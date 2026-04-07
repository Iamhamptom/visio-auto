/**
 * POST /api/commerce/checkout
 *
 * Generic Yoco checkout creator for ad-hoc payment links.
 * The orders + subscriptions routes already create their own checkouts —
 * this endpoint is for cases where you want a one-off payment link without
 * a structured order (manual lead invoice, custom partnership deposit, etc.).
 *
 * Body:
 *   {
 *     amount_cents: number,
 *     description: string,
 *     buyer_email?: string,
 *     metadata?: object
 *   }
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createCheckout } from "@/lib/payments/yoco";

const CheckoutSchema = z.object({
  amount_cents: z.number().int().positive(),
  description: z.string().min(3),
  buyer_email: z.string().email().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://visio-auto.vercel.app";

  try {
    const checkout = await createCheckout({
      amountInCents: parsed.data.amount_cents,
      description: parsed.data.description,
      successUrl: `${baseUrl}/shop/success?checkout=${"{checkoutId}"}`,
      cancelUrl: `${baseUrl}/shop?cancelled=true`,
      metadata: {
        kind: "ad_hoc_checkout",
        ...(parsed.data.buyer_email ? { buyer_email: parsed.data.buyer_email } : {}),
        ...(parsed.data.metadata ?? {}),
      },
    });

    return NextResponse.json({
      ok: true,
      checkout: {
        id: checkout.id,
        redirect_url: checkout.redirectUrl,
        status: checkout.status,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Yoco checkout creation failed", details: (e as Error).message },
      { status: 502 }
    );
  }
}
