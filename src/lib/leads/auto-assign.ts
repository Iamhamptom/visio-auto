import type { Lead, Dealer } from '@/lib/types'

// ---------------------------------------------------------------------------
// Auto-assign a lead to the best matching dealer
// ---------------------------------------------------------------------------

interface AssignResult {
  dealer_id: string
  dealer_name: string
  reason: string
}

/**
 * Automatically assign a lead to the best-matching dealer.
 *
 * Priority order:
 *  1. Brand match + area match
 *  2. Brand match (any area)
 *  3. Area match (any brand)
 *  4. Round-robin fallback
 *
 * Within each tier, pro/enterprise dealers get priority for hot leads,
 * and we round-robin to distribute evenly within the same priority group.
 */
export async function autoAssignLead(
  lead: Pick<Lead, 'preferred_brand' | 'area' | 'city' | 'score_tier' | 'id'>
): Promise<AssignResult | null> {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    // Fetch active dealers with their current lead counts
    const { data: dealers, error } = await supabase
      .from('va_dealers')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (error || !dealers || dealers.length === 0) {
      console.log('[AutoAssign] No active dealers found', error?.message)
      return null
    }

    // Get current lead counts per dealer (this month) to check capacity
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: leadCounts } = await supabase
      .from('va_leads')
      .select('assigned_dealer_id')
      .not('assigned_dealer_id', 'is', null)
      .gte('created_at', startOfMonth.toISOString())

    const countMap: Record<string, number> = {}
    for (const row of leadCounts ?? []) {
      const did = row.assigned_dealer_id as string
      countMap[did] = (countMap[did] ?? 0) + 1
    }

    // Filter out dealers that have exceeded their quota
    const availableDealers = (dealers as Dealer[]).filter((d) => {
      const currentCount = countMap[d.id] ?? 0
      return currentCount < d.leads_quota
    })

    if (availableDealers.length === 0) {
      console.log('[AutoAssign] All dealers at capacity')
      return null
    }

    // Score each dealer for this lead
    const scored = availableDealers.map((dealer) => {
      let matchScore = 0
      const reasons: string[] = []

      // Brand match (highest weight)
      if (
        lead.preferred_brand &&
        dealer.brands.some(
          (b) => b.toLowerCase() === lead.preferred_brand!.toLowerCase()
        )
      ) {
        matchScore += 50
        reasons.push(`sells ${lead.preferred_brand}`)
      }

      // Area / city match
      if (
        lead.area &&
        dealer.area.toLowerCase() === lead.area.toLowerCase()
      ) {
        matchScore += 30
        reasons.push(`same area (${lead.area})`)
      } else if (
        lead.city &&
        dealer.city.toLowerCase() === lead.city.toLowerCase()
      ) {
        matchScore += 15
        reasons.push(`same city (${lead.city})`)
      }

      // Tier bonus for hot leads — pro/enterprise dealers handle them better
      if (lead.score_tier === 'hot') {
        if (dealer.tier === 'enterprise') matchScore += 10
        else if (dealer.tier === 'pro') matchScore += 5
      }

      // Capacity utilisation — prefer dealers with more headroom
      const used = countMap[dealer.id] ?? 0
      const utilisation = used / dealer.leads_quota
      matchScore += Math.round((1 - utilisation) * 10) // 0-10 points

      return {
        dealer,
        matchScore,
        currentCount: used,
        reason: reasons.length > 0 ? reasons.join(', ') : 'round-robin',
      }
    })

    // Sort by matchScore descending, then by currentCount ascending (round-robin)
    scored.sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore
      return a.currentCount - b.currentCount
    })

    const best = scored[0]

    // Update the lead's assigned_dealer_id in Supabase
    const { error: updateError } = await supabase
      .from('va_leads')
      .update({ assigned_dealer_id: best.dealer.id })
      .eq('id', lead.id)

    if (updateError) {
      console.error('[AutoAssign] Failed to update lead:', updateError.message)
    }

    console.log(
      `[AutoAssign] Lead ${lead.id} → Dealer "${best.dealer.name}" (score: ${best.matchScore}, reason: ${best.reason})`
    )

    return {
      dealer_id: best.dealer.id,
      dealer_name: best.dealer.name,
      reason: best.reason,
    }
  } catch (err) {
    console.error('[AutoAssign] Error:', err)
    return null
  }
}
