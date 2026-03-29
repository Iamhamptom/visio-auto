import { NextRequest, NextResponse } from 'next/server'
import { scoreLead } from '@/lib/ai/scoring'
import { mapVPraiLeadToVisioAuto } from '@/lib/integrations/vprai'
import type { VPraiLead } from '@/lib/integrations/vprai'

// ---------------------------------------------------------------------------
// POST /api/integrations/vprai/webhook
// Receives leads from V-Prai when they are captured.
// V-Prai calls this endpoint with a webhook payload containing new leads.
// ---------------------------------------------------------------------------

const VPRAI_WEBHOOK_SECRET = process.env.VPRAI_WEBHOOK_SECRET || process.env.VPRAI_API_KEY || ''

export async function POST(request: NextRequest) {
  // ── Validate webhook auth ──────────────────────────────────────────
  const authHeader = request.headers.get('authorization') || ''
  const apiKey = request.headers.get('x-vprai-key') || ''
  const token = authHeader.replace('Bearer ', '') || apiKey

  if (!VPRAI_WEBHOOK_SECRET || token !== VPRAI_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Parse body ─────────────────────────────────────────────────────
  let body: { leads?: VPraiLead[]; lead?: VPraiLead }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Support both single lead and batch
  const incomingLeads: VPraiLead[] = []
  if (body.leads && Array.isArray(body.leads)) {
    incomingLeads.push(...body.leads)
  } else if (body.lead) {
    incomingLeads.push(body.lead)
  }

  if (incomingLeads.length === 0) {
    return NextResponse.json({ error: 'No leads in payload' }, { status: 400 })
  }

  // ── Process each lead ──────────────────────────────────────────────
  const created: Array<{ id: string; name: string; ai_score: number; score_tier: string }> = []
  const errors: string[] = []

  for (const vpLead of incomingLeads) {
    try {
      // Map to Visio Auto format
      const mapped = mapVPraiLeadToVisioAuto(vpLead)

      // Re-score with Visio Auto scoring engine
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

      const leadRow = {
        ...mapped,
        ai_score: score,
        score_tier: tier,
        source: 'vprai',
        source_detail: `V-Prai webhook — ${vpLead.name || 'unknown'}`,
      }

      // Try Supabase insert
      let insertedId: string | null = null
      try {
        const { createServiceClient } = await import('@/lib/supabase/service')
        const supabase = createServiceClient()

        // Deduplicate by phone number
        if (vpLead.phone) {
          const { data: existing } = await supabase
            .from('va_leads')
            .select('id')
            .eq('phone', vpLead.phone)
            .eq('source', 'vprai')
            .limit(1)

          if (existing && existing.length > 0) {
            created.push({
              id: existing[0].id,
              name: vpLead.name || 'Unknown',
              ai_score: score,
              score_tier: tier,
            })
            continue // skip duplicate
          }
        }

        // Auto-assign to a dealer (round-robin by area)
        const { data: dealers } = await supabase
          .from('va_dealers')
          .select('id')
          .eq('is_active', true)
          .limit(1)

        if (dealers && dealers.length > 0) {
          leadRow.assigned_dealer_id = dealers[0].id
        }

        const { data: inserted, error } = await supabase
          .from('va_leads')
          .insert(leadRow)
          .select('id')
          .single()

        if (!error && inserted) {
          insertedId = inserted.id
        }
      } catch (dbErr) {
        console.error('[vprai-webhook] Supabase insert failed, using fallback', dbErr)
      }

      created.push({
        id: insertedId || `vprai_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: vpLead.name || 'Unknown',
        ai_score: score,
        score_tier: tier,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      errors.push(`Failed to process lead "${vpLead.name}": ${msg}`)
      console.error('[vprai-webhook] lead processing error:', msg)
    }
  }

  console.log(`[vprai-webhook] processed ${created.length} leads, ${errors.length} errors`)

  return NextResponse.json(
    {
      success: true,
      processed: created.length,
      leads: created,
      errors: errors.length > 0 ? errors : undefined,
    },
    { status: 201 }
  )
}
