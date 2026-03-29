import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { Lead, LeadStatus, ScoreTier } from '@/lib/types'

// ---------------------------------------------------------------------------
// In-memory fallback store (shared via module scope)
// ---------------------------------------------------------------------------

const inMemoryLeads: Lead[] = []

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const UpdateLeadSchema = z.object({
  status: z.enum([
    'new', 'contacted', 'qualified', 'test_drive_booked',
    'test_drive_done', 'negotiating', 'sold', 'lost', 'inactive',
  ] as const).optional(),
  assigned_dealer_id: z.string().uuid().optional().nullable(),
  matched_vin: z.string().optional().nullable(),
  matched_vehicle: z.string().optional().nullable(),
  contacted_at: z.string().datetime().optional().nullable(),
  test_drive_at: z.string().datetime().optional().nullable(),
  sold_at: z.string().datetime().optional().nullable(),
  sale_amount: z.number().min(0).optional().nullable(),
  ai_score: z.number().min(0).max(100).optional(),
  score_tier: z.enum(['hot', 'warm', 'cold'] as const).optional(),
  finance_status: z.enum(['pre_approved', 'needs_finance', 'cash', 'unknown'] as const).optional(),
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
// GET — Single lead by ID
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Try Supabase
  const supabase = await getSupabase()
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('va_leads')
        .select('*')
        .eq('id', id)
        .single()

      if (!error && data) {
        return NextResponse.json({ lead: data })
      }
      if (error?.code === 'PGRST116') {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
      }
    } catch {
      // fall through
    }
  }

  // In-memory fallback
  const lead = inMemoryLeads.find((l) => l.id === id)
  if (!lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  return NextResponse.json({ lead })
}

// ---------------------------------------------------------------------------
// PATCH — Update lead
// ---------------------------------------------------------------------------

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = UpdateLeadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.format() },
      { status: 400 }
    )
  }

  const updates = parsed.data

  // Try Supabase
  const supabase = await getSupabase()
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('va_leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (!error && data) {
        return NextResponse.json({ lead: data })
      }
      if (error?.code === 'PGRST116') {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
      }
    } catch {
      // fall through
    }
  }

  // In-memory fallback
  const idx = inMemoryLeads.findIndex((l) => l.id === id)
  if (idx === -1) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  const updated = {
    ...inMemoryLeads[idx],
    ...updates,
  } as Lead
  inMemoryLeads[idx] = updated

  return NextResponse.json({ lead: updated })
}
