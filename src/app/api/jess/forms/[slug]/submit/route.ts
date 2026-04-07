import { NextRequest, NextResponse } from 'next/server'
import { runFunnelLead } from '@/lib/jess/funnel'
import { upsertJessLead, type NormalizedJessLead } from '@/lib/jess/leads'

// ---------------------------------------------------------------------------
// POST /api/jess/forms/[slug]/submit — public form intake
// Pipes the payload through L1 funnel, upserts a jess_lead,
// logs jess_form_submissions, and auto-enrolls A/B grades into a sequence.
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  let payload: Record<string, unknown>
  try {
    payload = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    // 1. Look up the form
    const { data: form, error: formError } = await supabase
      .from('jess_forms')
      .select('*')
      .eq('slug', slug)
      .single()

    if (formError || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    // 2. Normalize lead from payload
    const email = typeof payload.email === 'string' ? payload.email.toLowerCase().trim() : null
    const phone = typeof payload.phone === 'string' ? payload.phone : null
    const lead: NormalizedJessLead = {
      type: form.audience === 'dealer' ? 'dealer_principal' : 'buyer',
      full_name: (payload.full_name as string | undefined) ?? (payload.name as string | undefined) ?? null,
      email,
      phone,
      whatsapp: (payload.whatsapp as string | undefined) ?? phone,
      company: (payload.company as string | undefined) ?? (payload.dealership as string | undefined) ?? null,
      role: (payload.role as string | undefined) ?? (payload.title as string | undefined) ?? null,
      province: (payload.province as string | undefined) ?? (payload.region as string | undefined) ?? null,
      source: `visio_auto_form:${slug}`,
      raw_payload: payload,
    }

    // 3. Run funnel
    const funnel = runFunnelLead({
      email: lead.email ?? undefined,
      phone: lead.phone ?? undefined,
      full_name: lead.full_name ?? undefined,
    })

    // 4. Upsert lead
    await upsertJessLead(lead, supabase)

    // 5. Resolve lead id (email if present, otherwise most-recent insert by source)
    let leadId: string | null = null
    if (lead.email) {
      const { data: found } = await supabase
        .from('jess_leads')
        .select('id')
        .eq('email', lead.email)
        .single()
      leadId = found?.id ?? null
    } else {
      const { data: found } = await supabase
        .from('jess_leads')
        .select('id')
        .eq('source', lead.source)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      leadId = found?.id ?? null
    }

    // 6. Log submission
    await supabase.from('jess_form_submissions').insert({
      form_id: form.id,
      lead_id: leadId,
      payload,
      funnel_grade: funnel.grade,
    })

    // 7. Auto-enroll Grade A/B
    let enrolled: 'dealer_cold' | 'buyer_warm' | null = null
    if (leadId && (funnel.grade === 'A' || funnel.grade === 'B')) {
      const seqName = form.audience === 'dealer' ? 'dealer_cold' : 'buyer_warm'
      const { data: seq } = await supabase
        .from('jess_sequences')
        .select('id')
        .eq('name', seqName)
        .single()

      if (seq?.id) {
        const { error: enrollErr } = await supabase.from('jess_sequence_enrollments').insert({
          lead_id: leadId,
          sequence_id: seq.id,
          current_step: 0,
          next_run_at: new Date().toISOString(),
          status: 'active',
        })
        if (!enrollErr) enrolled = seqName
      }
    }

    return NextResponse.json({
      ok: true,
      lead_id: leadId,
      funnel: { grade: funnel.grade, flags: funnel.flags },
      enrolled,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[jess/forms/submit] Fatal:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
