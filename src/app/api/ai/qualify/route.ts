import { NextRequest, NextResponse } from 'next/server'
import { qualifyLead } from '@/lib/ai/qualify'

async function getSupabase() {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    return await createClient()
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, lead_id } = body as {
      messages: string[]
      lead_id?: string
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'messages array is required and must not be empty' },
        { status: 400 }
      )
    }

    const supabase = await getSupabase()

    // If lead_id is provided, fetch existing lead data for context
    let leadData = {}
    if (lead_id && supabase) {
      const { data: lead } = await supabase
        .from('va_leads')
        .select('*')
        .eq('id', lead_id)
        .single()

      if (lead) {
        leadData = lead
      }
    }

    const result = await qualifyLead(messages, leadData)

    // Update lead record if lead_id was provided
    if (lead_id && supabase) {
      await supabase
        .from('va_leads')
        .update({
          ai_score: result.score,
          score_tier: result.tier,
          budget_min: result.budget_extracted.min,
          budget_max: result.budget_extracted.max,
          preferred_brand: result.brand_preference,
          preferred_model: result.model_preference,
          preferred_type: result.vehicle_type,
          timeline: result.timeline,
          new_or_used: result.new_or_used,
          has_trade_in: result.trade_in.has_trade_in,
          trade_in_brand: result.trade_in.brand,
          trade_in_model: result.trade_in.model,
          trade_in_year: result.trade_in.year,
          finance_status: result.finance_status,
          language: result.language_detected,
        })
        .eq('id', lead_id)
    }

    return NextResponse.json({ success: true, qualification: result })
  } catch (error) {
    console.error('AI qualification error:', error)
    return NextResponse.json(
      { error: 'Failed to qualify lead' },
      { status: 500 }
    )
  }
}
