import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

// =============================================================================
// POST /api/outreach/send — Send outreach emails (placeholder — logs for now)
// Tracks: sent_at, opened_at, replied_at
// =============================================================================

const sendSchema = z.object({
  dealer_id: z.string().min(1, "Dealer ID is required"),
  template: z.enum(["cold_intro", "follow_up", "roi_case_study"]),
  custom_message: z.string().nullable().optional(),
})

// In-memory outreach log (replaced by Supabase in production)
type OutreachRecord = {
  id: string
  dealer_id: string
  template: string
  custom_message: string | null
  sent_at: string
  opened_at: string | null
  replied_at: string | null
  status: "sent" | "delivered" | "opened" | "replied" | "bounced"
  channel: "email"
}

const outreachLog: OutreachRecord[] = []

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

  const { dealer_id, template, custom_message } = parsed.data

  // TODO: Actually send via Resend/SendGrid/Postmark
  // For now, we log the outreach and return a tracking record

  const record: OutreachRecord = {
    id: `out-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    dealer_id,
    template,
    custom_message: custom_message ?? null,
    sent_at: new Date().toISOString(),
    opened_at: null,
    replied_at: null,
    status: "sent",
    channel: "email",
  }

  outreachLog.push(record)

  // TODO: Insert into Supabase
  // const { error } = await supabase.from('outreach_log').insert(record)

  console.log(
    `[OUTREACH] Sent ${template} to dealer ${dealer_id} at ${record.sent_at}`,
    custom_message ? `| Custom: ${custom_message.slice(0, 80)}...` : ""
  )

  return NextResponse.json({
    success: true,
    outreach: record,
    message: `Outreach email (${template.replace(/_/g, " ")}) queued for dealer ${dealer_id}. Tracking ID: ${record.id}`,
    note: "Email sending is in placeholder mode. Connect Resend/SendGrid to go live.",
  })
}

// ---------------------------------------------------------------------------
// GET /api/outreach/send — View outreach log
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const dealerId = searchParams.get("dealer_id")

  let records = [...outreachLog]

  if (dealerId) {
    records = records.filter((r) => r.dealer_id === dealerId)
  }

  // Sort newest first
  records.sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())

  // Summary
  const total = records.length
  const sent = records.filter((r) => r.status === "sent").length
  const opened = records.filter((r) => r.status === "opened").length
  const replied = records.filter((r) => r.status === "replied").length

  return NextResponse.json({
    records,
    total,
    summary: {
      sent,
      opened,
      replied,
      open_rate: total > 0 ? Math.round((opened / total) * 100) : 0,
      reply_rate: total > 0 ? Math.round((replied / total) * 100) : 0,
    },
  })
}
