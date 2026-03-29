import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  distributeLeadToMultipleDealers,
  findMatchingDealers,
  trackFirstResponder,
} from '@/lib/leads/marketplace'

/**
 * Lead Marketplace — distribute leads to multiple dealers for 3-5x revenue.
 *
 * POST /api/leads/marketplace — Distribute a lead to dealers
 * GET  /api/leads/marketplace — List marketplace-distributed leads
 */

const DistributeSchema = z.object({
  lead_id: z.string().min(1),
  dealer_ids: z.array(z.string()).min(1).max(5).optional(),
  auto_match: z.boolean().default(false),
  max_dealers: z.coerce.number().min(1).max(5).default(3),
  notification_type: z.enum(['whatsapp', 'email', 'both']).default('both'),
})

const RespondSchema = z.object({
  lead_id: z.string().min(1),
  dealer_id: z.string().min(1),
  action: z.literal('respond'),
})

// ---------------------------------------------------------------------------
// POST — Distribute or respond
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Check if this is a "respond" action
  const respondParsed = RespondSchema.safeParse(body)
  if (respondParsed.success) {
    try {
      const result = await trackFirstResponder(
        respondParsed.data.lead_id,
        respondParsed.data.dealer_id
      )
      return NextResponse.json({ status: 'response_recorded', ...result })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return NextResponse.json({ error: message }, { status: 500 })
    }
  }

  // Otherwise this is a distribution request
  const parsed = DistributeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.format() },
      { status: 400 }
    )
  }

  const { lead_id, dealer_ids, auto_match, max_dealers, notification_type } = parsed.data

  try {
    let targetDealerIds = dealer_ids || []

    // Auto-match dealers if no explicit list provided
    if (auto_match || targetDealerIds.length === 0) {
      // We need to fetch the lead to match dealers
      const { createServiceClient } = await import('@/lib/supabase/service')
      const supabase = createServiceClient()
      const { data: lead } = await supabase
        .from('va_leads')
        .select('preferred_brand, area, city')
        .eq('id', lead_id)
        .single()

      if (!lead) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
      }

      const matched = await findMatchingDealers(lead, max_dealers)
      targetDealerIds = matched.map((d) => d.id)

      if (targetDealerIds.length === 0) {
        return NextResponse.json(
          { error: 'No matching dealers found for this lead' },
          { status: 404 }
        )
      }
    }

    const result = await distributeLeadToMultipleDealers(lead_id, targetDealerIds)

    return NextResponse.json({
      status: 'distributed',
      notification_type,
      ...result,
    }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[marketplace] Distribution error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// GET — List marketplace leads
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const limit = Number(request.nextUrl.searchParams.get('limit') || '50')
  const offset = Number(request.nextUrl.searchParams.get('offset') || '0')

  try {
    const { createServiceClient } = await import('@/lib/supabase/service')
    const supabase = createServiceClient()

    const { data, count, error } = await supabase
      .from('va_leads')
      .select('*', { count: 'exact' })
      .not('marketplace_dealers', 'is', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Summarize marketplace info
    const leads = (data || []).map((lead) => {
      const mpDealers = (lead.marketplace_dealers as Array<Record<string, unknown>>) || []
      return {
        ...lead,
        marketplace_summary: {
          total_dealers: mpDealers.length,
          responded: mpDealers.filter((d) => d.responded).length,
          first_responder: mpDealers.find((d) => d.is_first_responder) || null,
        },
      }
    })

    return NextResponse.json({
      leads,
      total: count ?? 0,
      limit,
      offset,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
