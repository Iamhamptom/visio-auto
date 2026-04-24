import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

// =============================================================================
// POST /api/outreach/send — Send outreach emails via Resend
// Supports: dealer outreach, lead outreach, signal-based outreach
// =============================================================================

const sendSchema = z.object({
  to: z.string().email("Valid email required"),
  subject: z.string().min(1, "Subject is required"),
  html: z.string().min(1, "HTML body is required"),
  from_name: z.string().default("Visio Auto"),
  from_email: z.string().email().default("david@visiocorp.co"),
  reply_to: z.string().email().default("david@visiocorp.co"),
  dealer_id: z.string().optional(),
  lead_id: z.string().optional(),
  signal_id: z.string().optional(),
  template: z.string().optional(),
  // Chairman's hard rule: never auto-send without approval.
  // Caller must either pass approved=true or authenticate as cron.
  approved: z.boolean().optional(),
})

// ---------------------------------------------------------------------------
// POST /api/outreach/send
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = sendSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    )
  }

  const { to, subject, html, from_name, from_email, reply_to, dealer_id, lead_id, signal_id, template, approved } = parsed.data

  // Approval gate
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get("authorization")
  const fromCron = cronSecret ? authHeader === `Bearer ${cronSecret}` : false

  if (!approved && !fromCron) {
    return NextResponse.json(
      {
        error: "Send blocked — explicit approval required",
        hint: "Pass { approved: true } in the body after reviewing the draft, or call with the cron bearer token.",
      },
      { status: 403 }
    )
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 })
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${from_name} <${from_email}>`,
        to: [to],
        reply_to,
        subject,
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error(`[OUTREACH] Resend error: ${err}`)
      return NextResponse.json({ error: "Failed to send email", details: err }, { status: res.status })
    }

    const resendData = await res.json()

    // Log to Supabase if available
    try {
      const { createServiceClient } = await import("@/lib/supabase/service")
      const supabase = createServiceClient()
      await supabase.from("va_outreach_log").insert({
        resend_id: resendData.id,
        to_email: to,
        subject,
        from_email,
        dealer_id: dealer_id ?? null,
        lead_id: lead_id ?? null,
        signal_id: signal_id ?? null,
        template: template ?? null,
        status: "sent",
      })
    } catch {
      // Table may not exist yet — that's fine, email still sent
    }

    console.log(`[OUTREACH] Sent to ${to} | subject: ${subject.slice(0, 50)} | resend_id: ${resendData.id}`)

    return NextResponse.json({
      success: true,
      resend_id: resendData.id,
      to,
      subject,
      dealer_id,
      lead_id,
      signal_id,
    })
  } catch (err) {
    console.error("[OUTREACH] Send failed:", err)
    return NextResponse.json({ error: "Email send failed" }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// GET /api/outreach/send — View outreach log
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const dealerId = searchParams.get("dealer_id")

  try {
    const { createServiceClient } = await import("@/lib/supabase/service")
    const supabase = createServiceClient()

    let query = supabase.from("va_outreach_log").select("*", { count: "exact" }).order("created_at", { ascending: false }).limit(100)
    if (dealerId) query = query.eq("dealer_id", dealerId)

    const { data, count } = await query

    return NextResponse.json({ records: data ?? [], total: count ?? 0 })
  } catch {
    return NextResponse.json({ records: [], total: 0, note: "Outreach log table not yet created" })
  }
}
