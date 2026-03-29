import { NextRequest, NextResponse } from 'next/server'
import { enrichLead } from '@/lib/leads/enrichment'

// ---------------------------------------------------------------------------
// Cron: Lead Enrichment — AI-powered lead data enrichment
// Schedule: daily at 03:00 SAST
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[cron/leads/enrich] Unauthorized cron attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[cron/leads/enrich] === Starting enrichment run ===')
  const runStart = Date.now()

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    // Find leads that have NOT been enriched yet
    // Enriched leads have source_detail containing 'enriched'
    const { data: leads, error } = await supabase
      .from('va_leads')
      .select('id, name, phone, email, area, city, province, preferred_brand, source, source_detail')
      .or('source_detail.is.null,source_detail.not.ilike.%enriched%')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('[cron/leads/enrich] Query error:', error.message)
      return NextResponse.json({ status: 'error', error: error.message }, { status: 500 })
    }

    if (!leads || leads.length === 0) {
      console.log('[cron/leads/enrich] No leads to enrich')
      return NextResponse.json({
        status: 'completed',
        message: 'No unenriched leads found',
        duration_ms: Date.now() - runStart,
      })
    }

    console.log(`[cron/leads/enrich] Found ${leads.length} leads to enrich`)

    let enriched = 0
    let failed = 0

    for (const lead of leads) {
      try {
        const enrichedData = await enrichLead(lead)

        // Build the updated source_detail with enrichment marker
        const existingDetail = lead.source_detail ?? ''
        const enrichmentTag = `[enriched:${new Date().toISOString().slice(0, 10)}]`
        const updatedDetail = existingDetail
          ? `${existingDetail} ${enrichmentTag}`
          : enrichmentTag

        // Store enriched data in a metadata-style JSON within source_detail
        // and update any inferable fields
        const updatePayload: Record<string, unknown> = {
          source_detail: updatedDetail,
        }

        // If we got a high-confidence industry, store it
        if (enrichedData.enrichment_confidence > 0.5) {
          // Store full enrichment data as JSON in source_detail
          const enrichmentJson = JSON.stringify({
            enrichment: enrichedData,
            previous_detail: existingDetail || null,
          })
          updatePayload.source_detail = `${enrichmentTag} ${enrichmentJson}`
        }

        const { error: updateError } = await supabase
          .from('va_leads')
          .update(updatePayload)
          .eq('id', lead.id)

        if (updateError) {
          console.error(`[cron/leads/enrich] Update error for ${lead.id}:`, updateError.message)
          failed++
        } else {
          enriched++
        }
      } catch (err) {
        console.error(`[cron/leads/enrich] Enrichment error for ${lead.id}:`, err)
        failed++
      }
    }

    const summary = {
      status: 'completed',
      run_at: new Date().toISOString(),
      duration_ms: Date.now() - runStart,
      totals: {
        candidates: leads.length,
        enriched,
        failed,
      },
    }

    console.log('[cron/leads/enrich] === Run complete ===', JSON.stringify(summary.totals))

    return NextResponse.json(summary)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[cron/leads/enrich] Fatal error:', message)

    return NextResponse.json(
      {
        status: 'error',
        error: message,
        run_at: new Date().toISOString(),
        duration_ms: Date.now() - runStart,
      },
      { status: 500 }
    )
  }
}

// Enrichment uses AI calls — needs generous timeout
export const maxDuration = 300 // 5 minutes
