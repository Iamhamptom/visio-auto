import { NextResponse } from "next/server";
import { createCheckout, TIER_AMOUNTS, TIER_LABELS } from "@/lib/payments/yoco";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dealer_id, tier, amount } = body as {
      dealer_id?: string;
      tier?: string;
      amount?: number;
    };

    if (!tier || !TIER_AMOUNTS[tier]) {
      return NextResponse.json(
        { error: "Invalid tier. Must be one of: starter, growth, pro, enterprise" },
        { status: 400 }
      );
    }

    if (!dealer_id) {
      return NextResponse.json(
        { error: "dealer_id is required" },
        { status: 400 }
      );
    }

    const amountCents = amount ?? TIER_AMOUNTS[tier];
    const description = `Visio Auto — ${TIER_LABELS[tier]} Subscription`;

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get("origin") ||
      "https://visioauto.visiocorp.co";

    const checkout = await createCheckout({
      amountInCents: amountCents,
      description,
      successUrl: `${baseUrl}/get-started?payment=success&tier=${tier}&dealer=${dealer_id}`,
      cancelUrl: `${baseUrl}/get-started?payment=cancelled`,
      failureUrl: `${baseUrl}/get-started?payment=failed`,
      metadata: {
        dealer_id,
        tier,
        product: "visio-auto",
      },
    });

    return NextResponse.json({
      checkoutId: checkout.id,
      redirectUrl: checkout.redirectUrl,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Payment failed";
    console.error("Yoco checkout error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
