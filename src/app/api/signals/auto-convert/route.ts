import { NextRequest, NextResponse } from 'next/server'
import { autoAssignLead } from '@/lib/leads/auto-assign'
import { notifyDealer } from '@/lib/leads/auto-notify'

// ---------------------------------------------------------------------------
// Cron: Auto Signal-to-Lead Conversion
// Closes the loop: Signal Engine -> Lead -> Dealer
// Runs alongside the signals cron (every 6 hours)
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    // Find unprocessed signals with high buying probability
    const { data: signals, error } = await supabase
      .from('va_signals')
      .select('*')
      .eq('is_processed', false)
      .is('converted_to_lead_id', null)
      .gte('buying_probability', 70)
      .order('buying_probability', { ascending: false })
      .limit(50)

    if (error || !signals) {
      console.error('[AutoConvert] Failed to fetch signals:', error?.message)
      return NextResponse.json({ error: 'Failed to fetch signals' }, { status: 500 })
    }

    if (signals.length === 0) {
      return NextResponse.json({ success: true, message: 'No signals to convert', converted: 0 })
    }

    let converted = 0
    let assigned = 0
    let notified = 0
    let errors = 0

    for (const signal of signals) {
      try {
        // Determine timeline from probability
        const timeline =
          signal.buying_probability >= 85
            ? 'this_week'
            : signal.buying_probability >= 70
              ? 'this_month'
              : 'three_months'

        const scoreTier =
          signal.buying_probability >= 70
            ? 'hot'
            : signal.buying_probability >= 40
              ? 'warm'
              : 'cold'

        // Create a lead from the signal
        const { data: lead, error: leadError } = await supabase
          .from('va_leads')
          .insert({
            name: signal.person_name ?? signal.company_name ?? 'Unknown',
            phone: signal.person_phone ?? '',
            email: signal.person_email ?? null,
            whatsapp: signal.person_phone ?? null,
            area: signal.area ?? null,
            city: signal.city ?? 'Johannesburg',
            province: signal.province ?? 'Gauteng',
            budget_min: signal.estimated_budget_min ?? null,
            budget_max: signal.estimated_budget_max ?? null,
            preferred_type: signal.vehicle_type_likely ?? null,
            preferred_brand: null,
            preferred_model: null,
            new_or_used: 'any',
            has_trade_in: false,
            timeline,
            finance_status: 'unknown',
            ai_score: signal.buying_probability,
            score_tier: scoreTier,
            source: 'signal_engine',
            source_detail: `auto_convert:${signal.signal_type}: ${signal.title}`,
            language: 'en',
            status: 'new',
          })
          .select()
          .single()

        if (leadError || !lead) {
          console.error(`[AutoConvert] Failed to create lead from signal ${signal.id}:`, leadError?.message)
          errors++
          continue
        }

        converted++

        // Mark signal as processed
        await supabase
          .from('va_signals')
          .update({
            converted_to_lead_id: lead.id,
            is_processed: true,
          })
          .eq('id', signal.id)

        // Auto-assign to best dealer
        const assignment = await autoAssignLead({
          id: lead.id,
          preferred_brand: lead.preferred_brand,
          area: lead.area,
          city: lead.city,
          score_tier: lead.score_tier,
        })

        if (assignment) {
          assigned++

          // Notify the assigned dealer
          const { data: dealer } = await supabase
            .from('va_dealers')
            .select('id, name, whatsapp_number, email')
            .eq('id', assignment.dealer_id)
            .single()

          if (dealer) {
            try {
              const notifyResult = await notifyDealer(dealer, lead)
              if (notifyResult.whatsapp_sent || notifyResult.email_prepared) {
                notified++
              }
            } catch {
              // Notification failure is non-fatal
            }
          }
        }

        console.log(
          `[AutoConvert] Signal "${signal.title}" (${signal.signal_type}, ${signal.buying_probability}%) → Lead ${lead.id}` +
            (assignment ? ` → Dealer "${assignment.dealer_name}"` : '')
        )
      } catch (err) {
        console.error(`[AutoConvert] Error processing signal ${signal.id}:`, err)
        errors++
      }
    }

    console.log(
      `[AutoConvert] Completed — ${converted} converted, ${assigned} assigned, ${notified} notified, ${errors} errors`
    )

    return NextResponse.json({
      success: true,
      signals_found: signals.length,
      converted,
      assigned,
      notified,
      errors,
    })
  } catch (err) {
    console.error('[AutoConvert] Cron error:', err)
    return NextResponse.json({ error: 'Auto-convert cron failed' }, { status: 500 })
  }
}
