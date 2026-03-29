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

interface RetellWebhookPayload {
  event: string
  call: {
    call_id: string
    call_status: 'ended' | 'error' | 'ongoing'
    start_timestamp: number
    end_timestamp: number
    transcript: string
    transcript_object?: Array<{
      role: 'agent' | 'user'
      content: string
    }>
    recording_url?: string
    disconnection_reason?: string
    metadata?: {
      lead_id?: string
      purpose?: string
      language?: string
    }
    call_analysis?: {
      call_summary?: string
      user_sentiment?: string
      custom_analysis_data?: Record<string, unknown>
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as RetellWebhookPayload

    // Verify webhook signature if configured
    const webhookSecret = process.env.RETELL_WEBHOOK_SECRET
    if (webhookSecret) {
      const signature = request.headers.get('x-retell-signature')
      if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
      }
      // In production, verify HMAC signature here
    }

    const { event, call } = payload

    if (event !== 'call_ended' && event !== 'call_analyzed') {
      // Acknowledge events we don't process
      return NextResponse.json({ received: true })
    }

    const supabase = await getSupabase()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }
    const leadId = call.metadata?.lead_id
    const callId = call.call_id

    // Calculate call duration
    const durationSeconds = call.end_timestamp && call.start_timestamp
      ? Math.round((call.end_timestamp - call.start_timestamp) / 1000)
      : 0

    // Extract transcript as conversation messages
    const messages: string[] = []
    if (call.transcript_object && call.transcript_object.length > 0) {
      for (const turn of call.transcript_object) {
        if (turn.role === 'user') {
          messages.push(turn.content)
        }
      }
    } else if (call.transcript) {
      // Fallback: split raw transcript
      const lines = call.transcript.split('\n').filter(Boolean)
      for (const line of lines) {
        const cleaned = line.replace(/^(Agent|User|Customer):\s*/i, '')
        messages.push(cleaned)
      }
    }

    // Update voice_calls record
    await supabase
      .from('va_voice_calls')
      .update({
        status: call.call_status === 'ended' ? 'completed' : 'error',
        duration_seconds: durationSeconds,
        transcript: call.transcript || null,
        recording_url: call.recording_url || null,
        disconnection_reason: call.disconnection_reason || null,
        call_summary: call.call_analysis?.call_summary || null,
        sentiment: call.call_analysis?.user_sentiment || null,
        completed_at: new Date().toISOString(),
      })
      .eq('retell_call_id', callId)

    // Run AI qualification on the conversation if we have messages and a lead
    if (leadId && messages.length > 0) {
      try {
        const qualification = await qualifyLead(messages, {})

        // Update lead with qualification results
        await supabase
          .from('va_leads')
          .update({
            ai_score: qualification.score,
            score_tier: qualification.tier,
            budget_min: qualification.budget_extracted.min,
            budget_max: qualification.budget_extracted.max,
            preferred_brand: qualification.brand_preference,
            preferred_model: qualification.model_preference,
            preferred_type: qualification.vehicle_type,
            timeline: qualification.timeline,
            new_or_used: qualification.new_or_used,
            has_trade_in: qualification.trade_in.has_trade_in,
            trade_in_brand: qualification.trade_in.brand,
            trade_in_model: qualification.trade_in.model,
            trade_in_year: qualification.trade_in.year,
            finance_status: qualification.finance_status,
            language: qualification.language_detected,
            status: 'contacted',
            contacted_at: new Date().toISOString(),
          })
          .eq('id', leadId)

        // Create a WhatsApp conversation summary
        const callSummary = call.call_analysis?.call_summary
          || `Voice call completed (${durationSeconds}s). Score: ${qualification.score}/100 (${qualification.tier}).`

        await supabase.from('va_whatsapp_convos').insert({
          lead_id: leadId,
          direction: 'system',
          message_type: 'voice_call_summary',
          content: callSummary,
          metadata: {
            call_id: callId,
            duration_seconds: durationSeconds,
            qualification_score: qualification.score,
            qualification_tier: qualification.tier,
            purpose: call.metadata?.purpose,
          },
          created_at: new Date().toISOString(),
        })
      } catch (qualErr) {
        console.error('Post-call qualification error:', qualErr)
        // Don't fail the webhook — the call data is already saved
      }
    }

    return NextResponse.json({ success: true, call_id: callId })
  } catch (error) {
    console.error('Voice webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
