import { NextRequest, NextResponse } from 'next/server'
import { qualifyJessLead } from '@/lib/jess/leads'

// ---------------------------------------------------------------------------
// Cron: Jess Tick — advance due sequence enrollments + run pending tasks.
// Schedule: every 5 minutes
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  // Verify cron secret (mirrors src/app/api/cron/leads/enrich/route.ts)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[cron/jess/tick] Unauthorized cron attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const runStart = Date.now()

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const now = new Date().toISOString()

    let sequences_processed = 0
    let tasks_processed = 0

    // ---------- 1. Sequence enrollments ----------
    const { data: enrollments, error: enrErr } = await supabase
      .from('jess_sequence_enrollments')
      .select('id, lead_id, sequence_id, current_step')
      .eq('status', 'active')
      .lte('next_run_at', now)
      .limit(50)

    if (enrErr) {
      console.error('[cron/jess/tick] enrollments query failed:', enrErr.message)
    }

    for (const e of enrollments ?? []) {
      try {
        const { data: seq } = await supabase
          .from('jess_sequences')
          .select('id, name, steps')
          .eq('id', e.sequence_id)
          .single()

        const steps = (seq?.steps ?? []) as Array<{ day?: number; channel?: string; template?: string }>
        const nextStepIdx = (e.current_step ?? 0) + 1
        const nextStep = steps[nextStepIdx]

        // Queue an outreach record (don't actually send here)
        const curStep = steps[e.current_step ?? 0]
        await supabase.from('jess_outreach').insert({
          lead_id: e.lead_id,
          sequence_id: e.sequence_id,
          step: e.current_step ?? 0,
          status: 'queued',
          channel: curStep?.channel ?? 'email',
          template_id: curStep?.template ?? null,
          meta: { enrollment_id: e.id, step_index: e.current_step ?? 0 },
        })

        if (nextStep) {
          const dayOffset = typeof nextStep.day === 'number' ? nextStep.day : 1
          const next_run_at = new Date(Date.now() + dayOffset * 24 * 60 * 60 * 1000).toISOString()
          await supabase
            .from('jess_sequence_enrollments')
            .update({ current_step: nextStepIdx, next_run_at })
            .eq('id', e.id)
        } else {
          await supabase
            .from('jess_sequence_enrollments')
            .update({ status: 'completed', current_step: nextStepIdx })
            .eq('id', e.id)
        }

        sequences_processed++
      } catch (err) {
        console.error('[cron/jess/tick] enrollment failed', e.id, err)
      }
    }

    // ---------- 2. Pending tasks ----------
    const { data: tasks, error: tasksErr } = await supabase
      .from('jess_tasks')
      .select('*')
      .eq('status', 'pending')
      .lte('run_at', now)
      .limit(50)

    if (tasksErr) {
      console.error('[cron/jess/tick] tasks query failed:', tasksErr.message)
    }

    for (const t of tasks ?? []) {
      const attempts = (t.attempts ?? 0) + 1
      await supabase
        .from('jess_tasks')
        .update({ status: 'running', attempts })
        .eq('id', t.id)

      try {
        if (t.kind === 'qualify' && t.lead_id) {
          await qualifyJessLead(t.lead_id, supabase)
          await supabase.from('jess_tasks').update({ status: 'done' }).eq('id', t.id)
        } else if (t.kind === 'enrich') {
          // Real enrichment is its own job — mark done for now
          await supabase.from('jess_tasks').update({ status: 'done' }).eq('id', t.id)
        } else if (t.kind === 'reminder' || t.kind === 'followup') {
          await supabase.from('jess_outreach').insert({
            lead_id: t.lead_id,
            channel: 'email',
            status: 'queued',
            meta: t.payload ?? { task_id: t.id, kind: t.kind },
          })
          await supabase.from('jess_tasks').update({ status: 'done' }).eq('id', t.id)
        } else {
          await supabase
            .from('jess_tasks')
            .update({ status: 'failed', last_error: 'unknown task kind' })
            .eq('id', t.id)
        }
        tasks_processed++
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        await supabase
          .from('jess_tasks')
          .update({ status: 'failed', last_error: message })
          .eq('id', t.id)
      }
    }

    return NextResponse.json({
      ok: true,
      sequences_processed,
      tasks_processed,
      duration_ms: Date.now() - runStart,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[cron/jess/tick] Fatal:', message)
    return NextResponse.json(
      { ok: false, error: message, duration_ms: Date.now() - runStart },
      { status: 500 }
    )
  }
}

export const maxDuration = 120
