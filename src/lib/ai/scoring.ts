import type { ScoreTier } from '@/lib/types'

interface ScoringInput {
  budget_min?: number | null
  budget_max?: number | null
  timeline?: string | null
  finance_status?: string | null
  has_trade_in?: boolean
  preferred_brand?: string | null
  preferred_model?: string | null
  preferred_type?: string | null
  source?: string
}

export function scoreLead(input: ScoringInput): { score: number; tier: ScoreTier } {
  let score = 0

  // Budget specified (0-20 points)
  if (input.budget_min || input.budget_max) {
    score += 15
    if (input.budget_min && input.budget_max) score += 5 // precise range = serious buyer
  }

  // Timeline (0-25 points)
  switch (input.timeline) {
    case 'this_week': score += 25; break
    case 'this_month': score += 18; break
    case 'three_months': score += 10; break
    case 'just_browsing': score += 2; break
  }

  // Finance status (0-20 points)
  switch (input.finance_status) {
    case 'pre_approved': score += 20; break
    case 'cash': score += 18; break
    case 'needs_finance': score += 8; break
    case 'unknown': score += 0; break
  }

  // Trade-in (0-10 points) — having a trade-in = serious buyer
  if (input.has_trade_in) score += 10

  // Vehicle specificity (0-15 points)
  if (input.preferred_brand) score += 5
  if (input.preferred_model) score += 5
  if (input.preferred_type && input.preferred_type !== 'any') score += 5

  // Source quality (0-10 points)
  switch (input.source) {
    case 'google_ad': score += 10; break // highest intent
    case 'signal_engine': score += 9; break
    case 'whatsapp': score += 8; break
    case 'referral': score += 7; break
    case 'meta_ad': score += 5; break
    case 'organic': score += 4; break
    default: score += 2
  }

  // Cap at 100
  score = Math.min(score, 100)

  // Determine tier
  let tier: ScoreTier = 'cold'
  if (score >= 70) tier = 'hot'
  else if (score >= 40) tier = 'warm'

  return { score, tier }
}

// Signal-based scoring
export function scoreSignal(signalType: string): { probability: number; strength: 'strong' | 'medium' | 'weak' } {
  const scores: Record<string, { probability: number; strength: 'strong' | 'medium' | 'weak' }> = {
    // Direct buying signals
    lease_expiring: { probability: 85, strength: 'strong' },
    new_business: { probability: 70, strength: 'strong' },
    promotion: { probability: 65, strength: 'strong' },
    job_change: { probability: 60, strength: 'strong' },
    relocation: { probability: 75, strength: 'strong' },
    expat_arrival: { probability: 80, strength: 'strong' },

    // Life event signals
    new_driver_age: { probability: 70, strength: 'strong' },
    graduation: { probability: 55, strength: 'medium' },
    wedding: { probability: 50, strength: 'medium' },
    new_baby: { probability: 60, strength: 'medium' },
    birthday_milestone: { probability: 45, strength: 'medium' },

    // Business signals
    funding_round: { probability: 65, strength: 'strong' },
    contract_won: { probability: 55, strength: 'medium' },
    fleet_expansion: { probability: 80, strength: 'strong' },
    hiring: { probability: 40, strength: 'medium' },
    position_filled: { probability: 35, strength: 'weak' },

    // Market signals
    interest_rate_change: { probability: 30, strength: 'weak' },
    housing_development: { probability: 50, strength: 'medium' },
    insurance_claim: { probability: 70, strength: 'strong' },
    competitor_closing: { probability: 60, strength: 'medium' },
    salary_season: { probability: 40, strength: 'medium' },

    // Social signals
    social_intent: { probability: 55, strength: 'medium' },
  }

  return scores[signalType] || { probability: 30, strength: 'weak' }
}
