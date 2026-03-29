import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { scoreLead } from '@/lib/ai/scoring'
import { autoAssignLead } from '@/lib/leads/auto-assign'
import { notifyDealer } from '@/lib/leads/auto-notify'
import type { Lead, ScoreTier } from '@/lib/types'

// ---------------------------------------------------------------------------
// In-memory fallback (when Supabase is unavailable)
// ---------------------------------------------------------------------------

const inMemoryLeads: Lead[] = []

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const CreateLeadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(9, 'Phone number is required'),
  email: z.string().email().optional(),
  whatsapp: z.string().optional(),
  area: z.string().optional(),
  city: z.string().default('Johannesburg'),
  province: z.string().default('Gauteng'),
  budget_min: z.number().min(0).optional(),
  budget_max: z.number().min(0).optional(),
  preferred_brand: z.string().optional(),
  preferred_model: z.string().optional(),
  preferred_type: z.enum(['sedan', 'suv', 'bakkie', 'hatch', 'coupe', 'van', 'any']).optional(),
  new_or_used: z.enum(['new', 'used', 'any']).default('any'),
  has_trade_in: z.boolean().default(false),
  trade_in_brand: z.string().optional(),
  trade_in_model: z.string().optional(),
  trade_in_year: z.number().min(1990).max(2027).optional(),
  timeline: z.enum(['this_week', 'this_month', 'three_months', 'just_browsing']).default('just_browsing'),
  finance_status: z.enum(['pre_approved', 'needs_finance', 'cash', 'unknown']).default('unknown'),
  language: z.enum(['en', 'af', 'zu', 'st', 'ts', 'xh']).default('en'),
  source: z.string().default('get_quote_form'),
  source_detail: z.string().optional(),
})

const ListLeadsQuery = z.object({
  status: z.string().optional(),
  score_tier: z.enum(['hot', 'warm', 'cold']).optional(),
  source: z.string().optional(),
  dealer_id: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
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

function generateId(): string {
  return `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

// ---------------------------------------------------------------------------
// GET — List leads
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams)
  const parsed = ListLeadsQuery.safeParse(params)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query parameters', details: parsed.error.format() }, { status: 400 })
  }

  const { status, score_tier, source, dealer_id, limit, offset } = parsed.data

  // Try Supabase
  const supabase = await getSupabase()
  if (supabase) {
    try {
      let query = supabase
        .from('va_leads')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (status) query = query.eq('status', status)
      if (score_tier) query = query.eq('score_tier', score_tier)
      if (source) query = query.eq('source', source)
      if (dealer_id) query = query.eq('assigned_dealer_id', dealer_id)

      const { data, count, error } = await query

      if (!error) {
        return NextResponse.json({ leads: data, total: count ?? 0, limit, offset })
      }
    } catch {
      // fall through to in-memory
    }
  }

  // In-memory fallback
  let filtered = [...inMemoryLeads]
  if (status) filtered = filtered.filter((l) => l.status === status)
  if (score_tier) filtered = filtered.filter((l) => l.score_tier === score_tier)
  if (source) filtered = filtered.filter((l) => l.source === source)
  if (dealer_id) filtered = filtered.filter((l) => l.assigned_dealer_id === dealer_id)

  const total = filtered.length
  const leads = filtered.slice(offset, offset + limit)

  return NextResponse.json({ leads, total, limit, offset })
}

// ---------------------------------------------------------------------------
// POST — Create lead
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = CreateLeadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.format() },
      { status: 400 }
    )
  }

  const data = parsed.data

  // Score the lead
  const { score, tier } = scoreLead({
    budget_min: data.budget_min,
    budget_max: data.budget_max,
    timeline: data.timeline,
    finance_status: data.finance_status,
    has_trade_in: data.has_trade_in,
    preferred_brand: data.preferred_brand,
    preferred_model: data.preferred_model,
    preferred_type: data.preferred_type,
    source: data.source,
  })

  const leadRow = {
    name: data.name,
    phone: data.phone,
    email: data.email ?? null,
    whatsapp: data.whatsapp ?? data.phone,
    area: data.area ?? null,
    city: data.city,
    province: data.province,
    budget_min: data.budget_min ?? null,
    budget_max: data.budget_max ?? null,
    preferred_brand: data.preferred_brand ?? null,
    preferred_model: data.preferred_model ?? null,
    preferred_type: data.preferred_type ?? null,
    new_or_used: data.new_or_used,
    has_trade_in: data.has_trade_in,
    trade_in_brand: data.trade_in_brand ?? null,
    trade_in_model: data.trade_in_model ?? null,
    trade_in_year: data.trade_in_year ?? null,
    timeline: data.timeline,
    finance_status: data.finance_status,
    ai_score: score,
    score_tier: tier,
    source: data.source,
    source_detail: data.source_detail ?? null,
    language: data.language,
    status: 'new' as const,
  }

  // Try Supabase
  const supabase = await getSupabase()
  if (supabase) {
    try {
      const { data: inserted, error } = await supabase
        .from('va_leads')
        .insert(leadRow)
        .select()
        .single()

      if (!error && inserted) {
        // Auto-assign to best matching dealer
        let assignment: { dealer_id: string; dealer_name: string; reason: string } | null = null
        let notification: { whatsapp_sent: boolean; email_prepared: boolean } | null = null

        try {
          assignment = await autoAssignLead({
            id: inserted.id,
            preferred_brand: inserted.preferred_brand,
            area: inserted.area,
            city: inserted.city,
            score_tier: inserted.score_tier,
          })

          // Notify the assigned dealer
          if (assignment) {
            const { data: dealer } = await supabase
              .from('va_dealers')
              .select('id, name, whatsapp_number, email')
              .eq('id', assignment.dealer_id)
              .single()

            if (dealer) {
              notification = await notifyDealer(dealer, inserted)
            }
          }
        } catch (err) {
          console.error('[Leads POST] Auto-assign/notify error (non-fatal):', err)
        }

        // If source is signal_engine and source_detail has signal info, link back
        if (data.source === 'signal_engine' && data.source_detail) {
          try {
            const signalMatch = data.source_detail.match(/signal:(\S+)/)
            if (signalMatch?.[1]) {
              await supabase
                .from('va_signals')
                .update({ converted_to_lead_id: inserted.id, is_processed: true })
                .eq('id', signalMatch[1])
            }
          } catch {
            // Signal linkback is non-fatal
          }
        }

        return NextResponse.json({
          lead: inserted,
          ai_score: score,
          score_tier: tier,
          assignment: assignment ? { dealer_id: assignment.dealer_id, dealer_name: assignment.dealer_name, reason: assignment.reason } : null,
          notification: notification ?? null,
        }, { status: 201 })
      }
    } catch {
      // fall through to in-memory
    }
  }

  // In-memory fallback
  const lead: Lead = {
    id: generateId(),
    ...leadRow,
    assigned_dealer_id: null,
    matched_vin: null,
    matched_vehicle: null,
    contacted_at: null,
    test_drive_at: null,
    sold_at: null,
    sale_amount: null,
    created_at: new Date().toISOString(),
  }

  inMemoryLeads.unshift(lead)

  return NextResponse.json({
    lead,
    ai_score: score,
    score_tier: tier,
  }, { status: 201 })
}
