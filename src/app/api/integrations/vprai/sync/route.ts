import { NextRequest, NextResponse } from 'next/server'
import { fetchVPraiLeads, mapVPraiLeadToVisioAuto, pushLeadToVPrai } from '@/lib/integrations/vprai'
import { scoreLead } from '@/lib/ai/scoring'
import type { Lead } from '@/lib/types'

// ---------------------------------------------------------------------------
// GET /api/integrations/vprai/sync — Pull leads from V-Prai into Visio Auto
// POST /api/integrations/vprai/sync — Push Visio Auto leads to V-Prai
// ---------------------------------------------------------------------------

const SYNC_API_KEY = process.env.VPRAI_API_KEY || process.env.VISIO_GATEWAY_KEY || ''

function validateAuth(request: NextRequest): boolean {
  if (!SYNC_API_KEY) return false
  const auth = request.headers.get('authorization')?.replace('Bearer ', '') || ''
  return auth === SYNC_API_KEY
}

// ---------------------------------------------------------------------------
// GET — Pull from V-Prai, import new leads (dedup by phone)
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  if (!validateAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sinceParam = request.nextUrl.searchParams.get('since')
  const since = sinceParam ? new Date(sinceParam) : undefined

  // Fetch leads from V-Prai
  const { leads: vpraiLeads, error: fetchError } = await fetchVPraiLeads(since)

  if (fetchError) {
    return NextResponse.json(
      { error: `Failed to fetch V-Prai leads: ${fetchError}`, imported: 0 },
      { status: 502 }
    )
  }

  if (vpraiLeads.length === 0) {
    return NextResponse.json({ message: 'No new leads from V-Prai', imported: 0, skipped: 0 })
  }

  let imported = 0
  let skipped = 0
  const errors: string[] = []

  try {
    const { createServiceClient } = await import('@/lib/supabase/service')
    const supabase = createServiceClient()

    for (const vpLead of vpraiLeads) {
      try {
        // Deduplicate by phone
        if (vpLead.phone) {
          const { data: existing } = await supabase
            .from('va_leads')
            .select('id')
            .eq('phone', vpLead.phone)
            .limit(1)

          if (existing && existing.length > 0) {
            skipped++
            continue
          }
        }

        // Also deduplicate by email
        if (vpLead.email) {
          const { data: existing } = await supabase
            .from('va_leads')
            .select('id')
            .eq('email', vpLead.email)
            .limit(1)

          if (existing && existing.length > 0) {
            skipped++
            continue
          }
        }

        const mapped = mapVPraiLeadToVisioAuto(vpLead)
        const { score, tier } = scoreLead({
          budget_min: mapped.budget_min,
          budget_max: mapped.budget_max,
          timeline: mapped.timeline,
          finance_status: mapped.finance_status,
          has_trade_in: mapped.has_trade_in,
          preferred_brand: mapped.preferred_brand,
          preferred_model: mapped.preferred_model,
          preferred_type: mapped.preferred_type,
          source: 'vprai',
        })

        const { error: insertErr } = await supabase.from('va_leads').insert({
          ...mapped,
          ai_score: score,
          score_tier: tier,
        })

        if (insertErr) {
          errors.push(`Insert failed for "${vpLead.name}": ${insertErr.message}`)
        } else {
          imported++
        }
      } catch (err) {
        errors.push(`Process error for "${vpLead.name}": ${err instanceof Error ? err.message : 'Unknown'}`)
      }
    }
  } catch {
    return NextResponse.json(
      { error: 'Supabase unavailable — cannot import leads', imported: 0 },
      { status: 503 }
    )
  }

  console.log(`[vprai-sync] imported: ${imported}, skipped: ${skipped}, errors: ${errors.length}`)

  return NextResponse.json({
    success: true,
    total_from_vprai: vpraiLeads.length,
    imported,
    skipped,
    errors: errors.length > 0 ? errors : undefined,
  })
}

// ---------------------------------------------------------------------------
// POST — Push Visio Auto leads to V-Prai
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  if (!validateAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { lead_ids?: string[]; since?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  let leads: Lead[] = []

  try {
    const { createServiceClient } = await import('@/lib/supabase/service')
    const supabase = createServiceClient()

    if (body.lead_ids && body.lead_ids.length > 0) {
      // Push specific leads
      const { data, error } = await supabase
        .from('va_leads')
        .select('*')
        .in('id', body.lead_ids)

      if (error) throw error
      leads = (data || []) as Lead[]
    } else {
      // Push recent leads not from vprai (avoid loops)
      const since = body.since || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { data, error } = await supabase
        .from('va_leads')
        .select('*')
        .neq('source', 'vprai')
        .neq('source', 'workspace')
        .gte('created_at', since)
        .limit(100)

      if (error) throw error
      leads = (data || []) as Lead[]
    }
  } catch {
    return NextResponse.json(
      { error: 'Supabase unavailable — cannot fetch leads to push' },
      { status: 503 }
    )
  }

  if (leads.length === 0) {
    return NextResponse.json({ message: 'No leads to push', pushed: 0 })
  }

  let pushed = 0
  const errors: string[] = []

  for (const lead of leads) {
    const result = await pushLeadToVPrai(lead)
    if (result.success) {
      pushed++
    } else {
      errors.push(`Push failed for "${lead.name}": ${result.error}`)
    }
  }

  console.log(`[vprai-sync] pushed: ${pushed}/${leads.length} to V-Prai`)

  return NextResponse.json({
    success: true,
    total: leads.length,
    pushed,
    errors: errors.length > 0 ? errors : undefined,
  })
}
