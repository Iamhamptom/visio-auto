import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { WebhookEvent } from '@/lib/webhooks/dispatcher'

// ---------------------------------------------------------------------------
// Webhook Registration Platform — CRUD for dealer webhook URLs
// ---------------------------------------------------------------------------

const VALID_EVENTS: WebhookEvent[] = ['new_lead', 'signal_detected', 'lead_scored', 'test_drive_booked']

const RegisterWebhookSchema = z.object({
  dealer_id: z.string().min(1, 'dealer_id is required'),
  url: z.string().url('Must be a valid URL'),
  events: z.array(z.enum(['new_lead', 'signal_detected', 'lead_scored', 'test_drive_booked'])).min(1, 'At least one event required'),
})

const DeleteWebhookSchema = z.object({
  dealer_id: z.string().min(1, 'dealer_id is required'),
  webhook_id: z.string().min(1, 'webhook_id is required'),
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getSupabase() {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    return await createClient()
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// POST — Register a webhook URL for a dealer
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = RegisterWebhookSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.format() },
      { status: 400 }
    )
  }

  const { dealer_id, url, events } = parsed.data

  const supabase = await getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }

  // Check for duplicate URL+dealer combo
  const { data: existing } = await supabase
    .from('va_webhooks')
    .select('id')
    .eq('dealer_id', dealer_id)
    .eq('url', url)
    .single()

  if (existing) {
    // Update events on existing webhook
    const { data: updated, error } = await supabase
      .from('va_webhooks')
      .update({ events, is_active: true })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ webhook: updated, action: 'updated' })
  }

  // Insert new webhook
  const { data: webhook, error } = await supabase
    .from('va_webhooks')
    .insert({
      dealer_id,
      url,
      events,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ webhook, action: 'created' }, { status: 201 })
}

// ---------------------------------------------------------------------------
// GET — List registered webhooks for a dealer
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const dealerId = request.nextUrl.searchParams.get('dealer_id')

  if (!dealerId) {
    return NextResponse.json({ error: 'dealer_id query param is required' }, { status: 400 })
  }

  const supabase = await getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }

  const { data: webhooks, error } = await supabase
    .from('va_webhooks')
    .select('*')
    .eq('dealer_id', dealerId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    webhooks: webhooks ?? [],
    available_events: VALID_EVENTS,
  })
}

// ---------------------------------------------------------------------------
// DELETE — Remove a webhook
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = DeleteWebhookSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.format() },
      { status: 400 }
    )
  }

  const { dealer_id, webhook_id } = parsed.data

  const supabase = await getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }

  const { error } = await supabase
    .from('va_webhooks')
    .delete()
    .eq('id', webhook_id)
    .eq('dealer_id', dealer_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ deleted: true, webhook_id })
}
