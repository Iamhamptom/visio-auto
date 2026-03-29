import { NextRequest, NextResponse } from 'next/server'
import { scoreLead } from '@/lib/ai/scoring'

// ---------------------------------------------------------------------------
// Cron: Score Refresh — re-score stale leads weekly
// Schedule: Sundays at 02:00
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

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

    // Fetch leads older than 7 days that are still active
    const { data: leads, error } = await supabase
      .from('va_leads')
      .select('*')
      .in('status', ['new', 'contacted', 'qualified', 'test_drive_booked'])
      .lte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: true })
      .limit(500)

    if (error || !leads) {
      console.error('[ScoreRefresh] Failed to fetch leads:', error?.message)
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }

    // Check for leads that have appeared in recent social signals
    const { data: socialSignals } = await supabase
      .from('va_social_signals')
      .select('person_name, brand_mentioned')
      .eq('is_processed', false)
      .gte('created_at', sevenDaysAgo)

    const socialNames = new Set(
      (socialSignals ?? [])
        .map((s) => s.person_name?.toLowerCase())
        .filter(Boolean)
    )

    let upgraded = 0
    let downgraded = 0
    let unchanged = 0

    for (const lead of leads) {
      try {
        const daysSinceCreated = Math.floor(
          (now.getTime() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24)
        )

        // Re-calculate base score
        const { score: baseScore } = scoreLead({
          budget_min: lead.budget_min,
          budget_max: lead.budget_max,
          timeline: lead.timeline,
          finance_status: lead.finance_status,
          has_trade_in: lead.has_trade_in,
          preferred_brand: lead.preferred_brand,
          preferred_model: lead.preferred_model,
          preferred_type: lead.preferred_type,
          source: lead.source,
        })

        let adjustedScore = baseScore

        // --- Downgrade factors ---

        // Timeline decay: if their buying window has likely passed
        if (lead.timeline === 'this_week' && daysSinceCreated > 14) {
          adjustedScore -= 15 // they said this week but it's been 2+ weeks
        } else if (lead.timeline === 'this_month' && daysSinceCreated > 45) {
          adjustedScore -= 10
        }

        // No engagement decay: status still 'new' after 7+ days
        if (lead.status === 'new' && daysSinceCreated > 7) {
          adjustedScore -= 5
        }

        // Very stale: 30+ days with no progress
        if (daysSinceCreated > 30 && !lead.contacted_at) {
          adjustedScore -= 10
        }

        // --- Upgrade factors ---

        // Lead appeared in social signals (new buying signal)
        if (lead.name && socialNames.has(lead.name.toLowerCase())) {
          adjustedScore += 10
        }

        // Lead has been actively engaged (test drive booked)
        if (lead.status === 'test_drive_booked') {
          adjustedScore += 5
        }

        // Clamp score
        adjustedScore = Math.max(0, Math.min(100, adjustedScore))

        // Determine new tier
        let newTier: 'hot' | 'warm' | 'cold' = 'cold'
        if (adjustedScore >= 70) newTier = 'hot'
        else if (adjustedScore >= 40) newTier = 'warm'

        // Only update if score changed
        if (adjustedScore === lead.ai_score && newTier === lead.score_tier) {
          unchanged++
          continue
        }

        if (adjustedScore > lead.ai_score) upgraded++
        else downgraded++

        await supabase
          .from('va_leads')
          .update({
            ai_score: adjustedScore,
            score_tier: newTier,
          })
          .eq('id', lead.id)
      } catch (err) {
        console.error(`[ScoreRefresh] Error processing lead ${lead.id}:`, err)
      }
    }

    console.log(
      `[ScoreRefresh] Completed — ${leads.length} reviewed: ${upgraded} upgraded, ${downgraded} downgraded, ${unchanged} unchanged`
    )

    return NextResponse.json({
      success: true,
      reviewed: leads.length,
      upgraded,
      downgraded,
      unchanged,
    })
  } catch (err) {
    console.error('[ScoreRefresh] Cron error:', err)
    return NextResponse.json({ error: 'Score refresh cron failed' }, { status: 500 })
  }
}
