import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getClientIp, rateLimitedResponse } from "@/lib/security/rate-limit";

const Schema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  reason: z.string().optional(),
});

/**
 * POPIA right-to-erasure / right-to-be-forgotten.
 *
 * Two phases:
 *   1. Immediate: mark all matching va_leads opted_out_at = now, status = inactive,
 *      so no further outreach fires from any cron or notification path.
 *   2. Logged: queued for 30-day retention SLA. After verification a human
 *      operator runs the actual delete (the lead history is needed for
 *      regulatory traceability and bookkeeping per the Tax Admin Act).
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`data_rights:${ip}`, { limit: 5, window: 600 });
  if (!limit.allowed) return rateLimitedResponse(limit);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success || (!parsed.data.email && !parsed.data.phone)) {
    return NextResponse.json(
      { error: "Provide email and/or phone." },
      { status: 400 }
    );
  }

  const { email, phone, reason } = parsed.data;

  try {
    const { createServiceClient } = await import("@/lib/supabase/service");
    const supabase = createServiceClient();

    // Immediate suppression — stop all outreach right now.
    const filters: string[] = [];
    if (phone) filters.push(`phone.eq.${phone}`);
    if (email) filters.push(`email.eq.${email.toLowerCase()}`);

    if (filters.length > 0) {
      await supabase
        .from("va_leads")
        .update({
          opted_out_at: new Date().toISOString(),
          status: "inactive",
        })
        .or(filters.join(","));
    }

    await supabase.from("va_data_rights_requests").insert({
      request_type: "delete",
      email: email ?? null,
      phone: phone ?? null,
      requester_ip: ip,
      notes: reason ?? null,
      status: "received",
    });

    return NextResponse.json({
      received: true,
      message:
        "All outreach has been suspended immediately. Final deletion happens within 30 days after verification, retaining only what SARS / regulators legally require.",
      sla_days: 30,
      contact: "david@visiocorp.co",
    });
  } catch (err) {
    console.error("[data-rights/delete] error:", err);
    return NextResponse.json(
      { error: "Service unavailable — email david@visiocorp.co directly." },
      { status: 503 }
    );
  }
}
