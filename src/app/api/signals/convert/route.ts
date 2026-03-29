import { NextRequest, NextResponse } from 'next/server'
import { scoreSignal } from '@/lib/ai/scoring'

export async function POST(request: NextRequest) {
  try {
    const { signal_id } = await request.json()

    if (!signal_id) {
      return NextResponse.json({ error: 'signal_id is required' }, { status: 400 })
    }

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    // Fetch the signal
    const { data: signal, error: fetchError } = await supabase
      .from('va_signals')
      .select('*')
      .eq('id', signal_id)
      .single()

    if (fetchError || !signal) {
      return NextResponse.json({ error: 'Signal not found' }, { status: 404 })
    }

    // Score the signal
    const { probability } = scoreSignal(signal.signal_type)

    // Create a lead from the signal
    const { data: lead, error: leadError } = await supabase
      .from('va_leads')
      .insert({
        name: signal.person_name ?? signal.company_name ?? 'Unknown',
        phone: signal.person_phone ?? '',
        email: signal.person_email,
        area: signal.area,
        city: signal.city ?? 'Johannesburg',
        province: signal.province ?? 'Gauteng',
        budget_min: signal.estimated_budget_min,
        budget_max: signal.estimated_budget_max,
        preferred_type: signal.vehicle_type_likely,
        new_or_used: 'any',
        has_trade_in: false,
        timeline: probability >= 70 ? 'this_month' : 'three_months',
        finance_status: 'unknown',
        ai_score: probability,
        score_tier: probability >= 70 ? 'hot' : probability >= 40 ? 'warm' : 'cold',
        source: 'signal_engine',
        source_detail: `${signal.signal_type}: ${signal.title}`,
        language: 'en',
        status: 'new',
      })
      .select()
      .single()

    if (leadError) throw leadError

    // Update the signal as converted
    await supabase
      .from('va_signals')
      .update({
        converted_to_lead_id: lead.id,
        is_processed: true,
      })
      .eq('id', signal_id)

    return NextResponse.json({ lead, signal_id }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to convert signal to lead' },
      { status: 500 }
    )
  }
}
