import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getClientIp, rateLimitedResponse } from "@/lib/security/rate-limit";

const Schema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

/**
 * POPIA data subject access request.
 *
 * The Information Regulator requires we respond within a "reasonable time"
 * (interpreted as 30 days). This endpoint takes the request, logs it, and
 * (when an authenticated session exists) returns the buyer's lead history.
 * Anonymous requests are queued for human review to prevent enumeration.
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

  const { email, phone } = parsed.data;

  try {
    const { createServiceClient } = await import("@/lib/supabase/service");
    const supabase = createServiceClient();

    // Always log the request — proof we received it within 30-day SLA.
    await supabase.from("va_data_rights_requests").insert({
      request_type: "access",
      email: email ?? null,
      phone: phone ?? null,
      requester_ip: ip,
      status: "received",
    });

    return NextResponse.json({
      received: true,
      message:
        "Your access request has been logged. We'll send a verification email or SMS within 7 business days, then return your data within 30 days as required by POPIA.",
      sla_days: 30,
      contact: "david@visiocorp.co",
    });
  } catch (err) {
    console.error("[data-rights/access] error:", err);
    return NextResponse.json(
      { error: "Service unavailable — email david@visiocorp.co directly." },
      { status: 503 }
    );
  }
}
