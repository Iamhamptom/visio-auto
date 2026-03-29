import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { dispatchWebhook, type WebhookEvent } from '@/lib/webhooks/dispatcher'

// ---------------------------------------------------------------------------
// Webhook Dispatcher — Internal route called when events happen
// POST /api/webhooks/dispatch
// ---------------------------------------------------------------------------

const DispatchSchema = z.object({
  event: z.enum(['new_lead', 'signal_detected', 'lead_scored', 'test_drive_booked']),
  dealer_id: z.string().min(1, 'dealer_id is required'),
  payload: z.record(z.string(), z.unknown()),
})

export async function POST(request: NextRequest) {
  // Verify internal call — only accept from same origin or with CRON_SECRET
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  const internalKey = process.env.VISIO_GATEWAY_KEY

  const isAuthorized =
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    (internalKey && authHeader === `Bearer ${internalKey}`)

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = DispatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.format() },
      { status: 400 }
    )
  }

  const { event, dealer_id, payload } = parsed.data

  console.log(`[webhooks/dispatch] Dispatching '${event}' for dealer ${dealer_id}`)

  try {
    const result = await dispatchWebhook(event as WebhookEvent, dealer_id, payload)

    const delivered = result.results.filter((r) => r.status === 'delivered').length
    const failed = result.results.filter((r) => r.status === 'failed').length

    console.log(
      `[webhooks/dispatch] Done: ${delivered} delivered, ${failed} failed out of ${result.results.length} hooks`
    )

    return NextResponse.json({
      status: 'dispatched',
      event,
      dealer_id,
      hooks_total: result.results.length,
      delivered,
      failed,
      results: result.results,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[webhooks/dispatch] Fatal error:', message)

    return NextResponse.json(
      { error: 'Dispatch failed', details: message },
      { status: 500 }
    )
  }
}

// Webhook dispatch can take time with retries
export const maxDuration = 60
