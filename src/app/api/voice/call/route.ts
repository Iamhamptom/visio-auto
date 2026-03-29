import { NextRequest, NextResponse } from 'next/server'
import { getAgentPrompt } from '@/lib/voice/agents'
import { getLanguageName } from '@/lib/ai/multilingual'
import type { Language } from '@/lib/types'

async function getSupabase() {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    return await createClient()
  } catch {
    return null
  }
}

type CallPurpose = 'qualify' | 'follow_up' | 'test_drive_confirm'

interface CallRequest {
  lead_id: string
  phone: string
  language?: Language
  purpose: CallPurpose
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CallRequest

    const { lead_id, phone, language = 'en', purpose } = body

    if (!lead_id || !phone || !purpose) {
      return NextResponse.json(
        { error: 'lead_id, phone, and purpose are required' },
        { status: 400 }
      )
    }

    const validPurposes: CallPurpose[] = ['qualify', 'follow_up', 'test_drive_confirm']
    if (!validPurposes.includes(purpose)) {
      return NextResponse.json(
        { error: `purpose must be one of: ${validPurposes.join(', ')}` },
        { status: 400 }
      )
    }

    // Fetch lead data for context
    const supabase = await getSupabase()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }
    const { data: lead } = await supabase
      .from('va_leads')
      .select('*')
      .eq('id', lead_id)
      .single()

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Build agent prompt
    const agentPrompt = getAgentPrompt(purpose, language, {
      name: lead.name,
      preferred_brand: lead.preferred_brand,
      preferred_model: lead.preferred_model,
      budget_max: lead.budget_max,
      matched_vehicle: lead.matched_vehicle,
      test_drive_at: lead.test_drive_at,
    })

    // Retell AI API call (placeholder — requires RETELL_API_KEY)
    const retellApiKey = process.env.RETELL_API_KEY
    if (!retellApiKey) {
      // Log the call attempt even without the API key
      await logCallAttempt(supabase, lead_id, purpose, language, 'skipped_no_api_key')
      return NextResponse.json({
        success: false,
        error: 'Voice calling not configured — RETELL_API_KEY not set',
        agent_prompt: agentPrompt, // Return prompt for testing
      }, { status: 503 })
    }

    // Initiate Retell AI call
    const retellResponse = await fetch('https://api.retellai.com/v2/create-phone-call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${retellApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from_number: process.env.RETELL_PHONE_NUMBER,
        to_number: phone,
        agent_id: getRetellAgentId(purpose),
        retell_llm_dynamic_variables: {
          customer_name: lead.name,
          language: getLanguageName(language),
          agent_prompt: agentPrompt,
        },
        metadata: {
          lead_id,
          purpose,
          language,
        },
      }),
    })

    if (!retellResponse.ok) {
      const errText = await retellResponse.text()
      console.error('Retell API error:', errText)
      await logCallAttempt(supabase, lead_id, purpose, language, 'retell_error')
      return NextResponse.json(
        { error: 'Failed to initiate voice call' },
        { status: 502 }
      )
    }

    const retellData = await retellResponse.json()

    // Log successful call initiation
    await logCallAttempt(supabase, lead_id, purpose, language, 'initiated', retellData.call_id)

    return NextResponse.json({
      success: true,
      call_id: retellData.call_id,
      status: 'initiated',
    })
  } catch (error) {
    console.error('Voice call error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate voice call' },
      { status: 500 }
    )
  }
}

function getRetellAgentId(purpose: CallPurpose): string {
  // Map purposes to Retell agent IDs (configured in env)
  const agentIds: Record<CallPurpose, string> = {
    qualify: process.env.RETELL_AGENT_QUALIFY || '',
    follow_up: process.env.RETELL_AGENT_FOLLOWUP || '',
    test_drive_confirm: process.env.RETELL_AGENT_TESTDRIVE || '',
  }
  return agentIds[purpose]
}

async function logCallAttempt(
  supabase: NonNullable<Awaited<ReturnType<typeof getSupabase>>>,
  leadId: string,
  purpose: CallPurpose,
  language: Language,
  status: string,
  callId?: string
) {
  await supabase.from('va_voice_calls').insert({
    lead_id: leadId,
    purpose,
    language,
    status,
    retell_call_id: callId || null,
    initiated_at: new Date().toISOString(),
  })
}
