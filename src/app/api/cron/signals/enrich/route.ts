import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { enrichSignal, routeSignalToDealers, classifySignalUrgency } from '@/lib/signals/agent'
import type { Dealer, Signal } from '@/lib/types'

// ---------------------------------------------------------------------------
// Cron: Signal Enrichment via AI Agent
//
// Runs 30 min after signal collection (at :30 past every 6th hour).
// Picks up unprocessed signals, enriches them with Gemini,
// routes to best dealers, and auto-converts hot signals to leads.
//
// GET /api/cron/signals/enrich
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const runStart = Date.now()
  const supabase = createServiceClient()

  try {
    // -----------------------------------------------------------------------
    // 1. Fetch unprocessed signals
    // -----------------------------------------------------------------------
    const { data: rawSignals, error: fetchErr } = await supabase
      .from('va_signals')
      .select('*')
      .eq('is_processed', false)
      .is('converted_to_lead_id', null)
      .order('created_at', { ascending: true })
      .limit(30)

    if (fetchErr) {
      console.error('[enrich-cron] Failed to fetch signals:', fetchErr.message)
      return NextResponse.json({ error: 'Failed to fetch signals' }, { status: 500 })
    }

    if (!rawSignals || rawSignals.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No unprocessed signals',
        enriched: 0,
        duration_ms: Date.now() - runStart,
      })
    }

    console.log(`[enrich-cron] Processing ${rawSignals.length} signals`)

    // -----------------------------------------------------------------------
    // 2. Fetch active dealers for routing
    // -----------------------------------------------------------------------
    const { data: dealerRows } = await supabase
      .from('va_dealers')
      .select('*')
      .eq('is_active', true)

    const dealers: Dealer[] = (dealerRows as Dealer[]) ?? []

    // -----------------------------------------------------------------------
    // 3. Enrich each signal
    // -----------------------------------------------------------------------
    let enriched = 0
    let routed = 0
    let autoConverted = 0
    let errors = 0

    for (const raw of rawSignals as Signal[]) {
      try {
        // --- AI Enrichment ---
        const enrichment = await enrichSignal(raw)

        // --- AI Urgency Classification ---
        const urgency = await classifySignalUrgency(raw)

        // Use the higher probability between raw and AI-determined
        const finalProbability = Math.max(
          raw.buying_probability ?? 0,
          enrichment.buying_probability
        )

        // --- Update signal with enriched data ---
        const updatePayload: Record<string, unknown> = {
          person_name: enrichment.person_name ?? raw.person_name,
          company_name: enrichment.company_name ?? raw.company_name,
          area: enrichment.area ?? raw.area,
          city: enrichment.city ?? raw.city,
          buying_probability: finalProbability,
          estimated_budget_min: enrichment.budget_min ?? raw.estimated_budget_min,
          estimated_budget_max: enrichment.budget_max ?? raw.estimated_budget_max,
          vehicle_type_likely: enrichment.vehicle_type_likely ?? raw.vehicle_type_likely,
          signal_strength:
            finalProbability >= 70
              ? 'strong'
              : finalProbability >= 40
                ? 'medium'
                : 'weak',
          is_processed: true,
        }

        const { error: updateErr } = await supabase
          .from('va_signals')
          .update(updatePayload)
          .eq('id', raw.id)

        if (updateErr) {
          console.error(`[enrich-cron] Failed to update signal ${raw.id}:`, updateErr.message)
          errors++
          continue
        }

        enriched++

        console.log(
          `[enrich-cron] Enriched "${raw.title}" → ${enrichment.urgency} (${finalProbability}%) | ${enrichment.vehicle_type_likely ?? 'unknown type'} | Budget: R${enrichment.budget_min ?? '?'}-R${enrichment.budget_max ?? '?'}`
        )

        // --- AI Dealer Routing ---
        if (dealers.length > 0) {
          const matches = await routeSignalToDealers(
            {
              ...raw,
              buying_probability: finalProbability,
              estimated_budget_min: enrichment.budget_min,
              estimated_budget_max: enrichment.budget_max,
              vehicle_type_likely: enrichment.vehicle_type_likely,
            },
            dealers
          )

          if (matches.length > 0) {
            routed++
            console.log(
              `[enrich-cron] Routed "${raw.title}" → ${matches.map((m) => m.dealer_id).join(', ')}`
            )
          }

          // --- Auto-convert hot signals to leads ---
          if (finalProbability >= 70 && matches.length > 0) {
            const bestDealer = matches[0]

            const timeline =
              urgency.urgency === 'URGENT'
                ? 'this_week'
                : urgency.urgency === 'SOON'
                  ? 'this_month'
                  : 'three_months'

            const scoreTier =
              finalProbability >= 70
                ? 'hot'
                : finalProbability >= 40
                  ? 'warm'
                  : 'cold'

            const { data: lead, error: leadErr } = await supabase
              .from('va_leads')
              .insert({
                name: enrichment.person_name ?? enrichment.company_name ?? 'Unknown',
                phone: raw.person_phone ?? '',
                email: raw.person_email ?? null,
                whatsapp: raw.person_phone ?? null,
                area: enrichment.area ?? raw.area ?? null,
                city: enrichment.city ?? raw.city ?? 'Johannesburg',
                province: raw.province ?? 'Gauteng',
                budget_min: enrichment.budget_min ?? null,
                budget_max: enrichment.budget_max ?? null,
                preferred_type: enrichment.vehicle_type_likely ?? null,
                preferred_brand: enrichment.brand_suggestions?.[0] ?? null,
                preferred_model: null,
                new_or_used: 'any',
                has_trade_in: false,
                timeline,
                finance_status: 'unknown',
                ai_score: finalProbability,
                score_tier: scoreTier,
                source: 'signal_engine',
                source_detail: `ai_enriched:${raw.signal_type}:${enrichment.urgency}`,
                language: enrichment.language_preference ?? 'en',
                status: 'new',
                assigned_dealer_id: bestDealer.dealer_id,
              })
              .select('id')
              .single()

            if (lead && !leadErr) {
              // Mark signal as converted
              await supabase
                .from('va_signals')
                .update({ converted_to_lead_id: lead.id })
                .eq('id', raw.id)

              autoConverted++

              console.log(
                `[enrich-cron] Auto-converted "${raw.title}" → Lead ${lead.id} → Dealer ${bestDealer.dealer_id} (${bestDealer.match_reasons.join(', ')})`
              )
            } else if (leadErr) {
              console.error(`[enrich-cron] Failed to create lead from signal ${raw.id}:`, leadErr.message)
            }
          }
        }

        // Brief pause to avoid Gemini rate limits
        await new Promise((r) => setTimeout(r, 500))
      } catch (err) {
        console.error(`[enrich-cron] Error processing signal ${raw.id}:`, err)
        errors++
      }
    }

    // -----------------------------------------------------------------------
    // 4. Summary
    // -----------------------------------------------------------------------
    const summary = {
      success: true,
      run_at: new Date().toISOString(),
      duration_ms: Date.now() - runStart,
      signals_found: rawSignals.length,
      enriched,
      routed,
      auto_converted: autoConverted,
      errors,
    }

    console.log('[enrich-cron] === Complete ===', JSON.stringify(summary))

    return NextResponse.json(summary)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[enrich-cron] Fatal error:', message)
    return NextResponse.json(
      { error: 'Enrichment cron failed', detail: message },
      { status: 500 }
    )
  }
}

// Allow up to 5 minutes for AI processing
export const maxDuration = 300
