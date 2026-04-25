import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/payments/yoco";
import { sendEmail } from "@/lib/email/resend";
import { welcomeEmail, paymentReceiptEmail } from "@/lib/email/templates";
import { claimWebhookEvent } from "@/lib/security/idempotency";

async function getSupabase() {
  try {
    const { createServiceClient } = await import("@/lib/supabase/service");
    return createServiceClient();
  } catch {
    return null;
  }
}

async function sendWelcomePack(
  supabase: NonNullable<Awaited<ReturnType<typeof getSupabase>>>,
  dealer_id: string,
  tier: string,
  amount_cents: number
) {
  const { data: dealer } = await supabase
    .from("va_dealers")
    .select("name, email, whatsapp_number")
    .eq("id", dealer_id)
    .single();

  if (!dealer?.email) {
    console.log(`[Yoco] No email on file for dealer ${dealer_id} — skipping welcome pack`);
    return;
  }

  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://auto.visiocorp.co"}/dashboard`;
  const receiptUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://auto.visiocorp.co"}/dashboard?receipt=latest`;

  const welcome = welcomeEmail(dealer.name, tier, dashboardUrl);
  const receipt = paymentReceiptEmail(dealer.name, amount_cents, tier, receiptUrl);

  const [welcomeResult, receiptResult] = await Promise.all([
    sendEmail({ to: dealer.email, subject: welcome.subject, html: welcome.html, text: welcome.text }),
    sendEmail({ to: dealer.email, subject: receipt.subject, html: receipt.html, text: receipt.text }),
  ]);

  console.log(
    `[Yoco] Welcome pack for ${dealer.name}: welcome=${welcomeResult.sent ? "sent" : welcomeResult.skipped_reason ?? welcomeResult.error}, receipt=${receiptResult.sent ? "sent" : receiptResult.skipped_reason ?? receiptResult.error}`
  );

  // WhatsApp welcome is optional — only fire if a number is configured and
  // the WhatsApp API is reachable. Transactional welcome does NOT go through
  // the notification gate (the dealer just paid us — this is a receipt, not outreach).
  if (dealer.whatsapp_number) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      await fetch(`${baseUrl}/api/whatsapp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: dealer.whatsapp_number,
          message: `Welcome to Visio Auto, ${dealer.name}! Your ${tier} plan is live. Open the dashboard: ${dashboardUrl}`,
          language: "en",
        }),
      });
    } catch (err) {
      console.log(`[Yoco] WhatsApp welcome skipped:`, err);
    }
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

    // Idempotency — Yoco retries on non-200. Use the event id (or checkout id
    // as fallback) so the same payment.succeeded never fires welcome twice.
    const eventId = body.id ?? payload?.checkoutId ?? payload?.id;
    if (eventId) {
      const claim = await claimWebhookEvent({
        provider: "yoco",
        eventId: String(eventId),
        payload: body,
      });
      if (!claim.isFirstSeen) {
        console.log(`[Yoco] event ${eventId} already processed — returning 200 idempotent`);
        return NextResponse.json({ status: "already_processed", event_id: eventId });
      }
    }

    const supabase = await getSupabase();

    if (type === "payment.succeeded") {
      const metadata = payload?.metadata as
        | Record<string, string>
        | undefined;

      if (metadata?.dealer_id && metadata?.tier) {
        const { dealer_id, tier } = metadata;

        // Ownership check — Yoco metadata is set by us at checkout creation,
        // so a payment that lands here with a dealer_id MUST match a row we
        // own. If it doesn't, refuse rather than activating a random dealer.
        if (supabase) {
          const { data: dealerCheck } = await supabase
            .from("va_dealers")
            .select("id, name")
            .eq("id", dealer_id)
            .single();

          if (!dealerCheck) {
            console.error(
              `[Yoco] payment.succeeded references unknown dealer_id=${dealer_id} — refusing to activate`
            );
            return NextResponse.json({ error: "Unknown dealer" }, { status: 404 });
          }
        }

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

        console.log(
          `Yoco webhook: payment succeeded for dealer=${dealer_id} tier=${tier}`
        );

        // Send welcome pack (email + WhatsApp). Non-blocking: webhook returns 200
        // even if welcome delivery hiccups, so Yoco doesn't retry.
        if (supabase) {
          sendWelcomePack(supabase, dealer_id, tier, payload.amount ?? 0).catch((err) => {
            console.error("[Yoco] Welcome pack failed:", err);
          });
        }
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
