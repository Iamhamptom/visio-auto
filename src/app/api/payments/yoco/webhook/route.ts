import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/payments/yoco";

async function getSupabase() {
  try {
    const { createServiceClient } = await import("@/lib/supabase/service");
    return createServiceClient();
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("webhook-signature") || "";

    // Verify webhook signature (skip in dev if no secret configured)
    if (process.env.YOCO_WEBHOOK_SECRET) {
      if (!verifyWebhookSignature(rawBody, signature)) {
        console.error("Yoco webhook: signature verification failed");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    const body = JSON.parse(rawBody);
    const { type, payload } = body;

    const supabase = await getSupabase();

    if (type === "payment.succeeded") {
      const metadata = payload?.metadata as
        | Record<string, string>
        | undefined;

      if (metadata?.dealer_id && metadata?.tier) {
        const { dealer_id, tier } = metadata;

        if (supabase) {
          // Activate dealer tier
          const { error } = await supabase
            .from("va_dealers")
            .update({
              tier,
              status: "active",
              payment_status: "paid",
              last_payment_at: new Date().toISOString(),
            })
            .eq("id", dealer_id);

          if (error) {
            console.error("Yoco webhook: failed to update dealer:", error);
          } else {
            console.log(
              `Yoco webhook: dealer ${dealer_id} upgraded to ${tier}`
            );
          }

          // Record payment event
          await supabase.from("va_payment_events").insert({
            dealer_id,
            tier,
            amount_cents: payload.amount,
            event_type: type,
            yoco_checkout_id: payload.checkoutId || payload.id,
            payload: body,
          }).then(({ error: insertErr }) => {
            if (insertErr)
              console.error("Yoco webhook: failed to log payment event:", insertErr);
          });
        }

        // TODO: Send welcome WhatsApp via Retell / Evolution API
        // TODO: Send welcome email via Resend
        console.log(
          `Yoco webhook: payment succeeded for dealer=${dealer_id} tier=${tier}`
        );
      }
    }

    if (type === "payment.failed") {
      const metadata = payload?.metadata as
        | Record<string, string>
        | undefined;
      if (metadata?.dealer_id) {
        console.warn(
          `Yoco webhook: payment failed for dealer=${metadata.dealer_id}`
        );
      }
    }

    return NextResponse.json({ status: "processed" });
  } catch (error) {
    console.error("Yoco webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
