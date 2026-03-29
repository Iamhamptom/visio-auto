// ---------------------------------------------------------------------------
// Freemium Tier System — Defines limits and usage tracking per dealer tier
// ---------------------------------------------------------------------------

export type TierName = 'free' | 'starter' | 'growth' | 'pro' | 'enterprise'

export interface TierConfig {
  leads_per_month: number
  signals_per_day: number
  export_enabled: boolean
  whatsapp_enabled: boolean
  voice_enabled: boolean
  marketplace_enabled: boolean
  enrichment_enabled: boolean
  brief_enabled: boolean
  price: number // ZAR cents
}

export const TIER_LIMITS: Record<TierName, TierConfig> = {
  free: {
    leads_per_month: 5,
    signals_per_day: 3,
    export_enabled: false,
    whatsapp_enabled: false,
    voice_enabled: false,
    marketplace_enabled: false,
    enrichment_enabled: false,
    brief_enabled: false,
    price: 0,
  },
  starter: {
    leads_per_month: 25,
    signals_per_day: 10,
    export_enabled: true,
    whatsapp_enabled: true,
    voice_enabled: false,
    marketplace_enabled: false,
    enrichment_enabled: false,
    brief_enabled: true,
    price: 5000,
  },
  growth: {
    leads_per_month: 100,
    signals_per_day: 50,
    export_enabled: true,
    whatsapp_enabled: true,
    voice_enabled: true,
    marketplace_enabled: true,
    enrichment_enabled: true,
    brief_enabled: true,
    price: 15000,
  },
  pro: {
    leads_per_month: 500,
    signals_per_day: -1, // unlimited
    export_enabled: true,
    whatsapp_enabled: true,
    voice_enabled: true,
    marketplace_enabled: true,
    enrichment_enabled: true,
    brief_enabled: true,
    price: 50000,
  },
  enterprise: {
    leads_per_month: -1, // unlimited
    signals_per_day: -1, // unlimited
    export_enabled: true,
    whatsapp_enabled: true,
    voice_enabled: true,
    marketplace_enabled: true,
    enrichment_enabled: true,
    brief_enabled: true,
    price: 150000,
  },
}

export type FeatureFlag = 'export_enabled' | 'whatsapp_enabled' | 'voice_enabled' | 'marketplace_enabled' | 'enrichment_enabled' | 'brief_enabled'
export type CountableFeature = 'leads_per_month' | 'signals_per_day'

export interface TierUsage {
  tier: TierName
  limits: TierConfig
  usage: {
    leads_this_month: number
    signals_today: number
  }
  remaining: {
    leads: number | 'unlimited'
    signals: number | 'unlimited'
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getSupabase() {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    return await createClient()
  } catch {
    return null
  }
}

function startOfMonth(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

function startOfToday(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
}

// ---------------------------------------------------------------------------
// checkTierLimit — Check if dealer has hit their tier limit for a feature
// ---------------------------------------------------------------------------

export async function checkTierLimit(
  dealerId: string,
  feature: CountableFeature | FeatureFlag
): Promise<{ allowed: boolean; current: number; limit: number; tier: TierName }> {
  const supabase = await getSupabase()
  if (!supabase) {
    return { allowed: true, current: 0, limit: -1, tier: 'enterprise' }
  }

  // Get dealer tier
  const { data: dealer } = await supabase
    .from('va_dealers')
    .select('tier')
    .eq('id', dealerId)
    .single()

  const tier: TierName = (dealer?.tier as TierName) ?? 'free'
  const config = TIER_LIMITS[tier]

  // Boolean feature flags
  if (feature.endsWith('_enabled')) {
    const enabled = config[feature as FeatureFlag]
    return { allowed: enabled, current: 0, limit: enabled ? 1 : 0, tier }
  }

  // Countable features
  if (feature === 'leads_per_month') {
    const limit = config.leads_per_month
    if (limit === -1) return { allowed: true, current: 0, limit: -1, tier }

    const { count } = await supabase
      .from('va_leads')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_dealer_id', dealerId)
      .gte('created_at', startOfMonth())

    const current = count ?? 0
    return { allowed: current < limit, current, limit, tier }
  }

  if (feature === 'signals_per_day') {
    const limit = config.signals_per_day
    if (limit === -1) return { allowed: true, current: 0, limit: -1, tier }

    // Count signals delivered today to this dealer's area
    const { data: dealerData } = await supabase
      .from('va_dealers')
      .select('area, city')
      .eq('id', dealerId)
      .single()

    let query = supabase
      .from('va_signals')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfToday())

    if (dealerData?.area) {
      query = query.eq('area', dealerData.area)
    }

    const { count } = await query
    const current = count ?? 0
    return { allowed: current < limit, current, limit, tier }
  }

  return { allowed: true, current: 0, limit: -1, tier }
}

// ---------------------------------------------------------------------------
// getTierUsage — Return current usage vs limits for a dealer
// ---------------------------------------------------------------------------

export async function getTierUsage(dealerId: string): Promise<TierUsage> {
  const supabase = await getSupabase()

  let tier: TierName = 'free'
  let leadsThisMonth = 0
  let signalsToday = 0

  if (supabase) {
    const { data: dealer } = await supabase
      .from('va_dealers')
      .select('tier')
      .eq('id', dealerId)
      .single()

    tier = (dealer?.tier as TierName) ?? 'free'

    // Count leads this month
    const { count: leadCount } = await supabase
      .from('va_leads')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_dealer_id', dealerId)
      .gte('created_at', startOfMonth())

    leadsThisMonth = leadCount ?? 0

    // Count signals today
    const { count: signalCount } = await supabase
      .from('va_signals')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfToday())

    signalsToday = signalCount ?? 0
  }

  const config = TIER_LIMITS[tier]

  return {
    tier,
    limits: config,
    usage: {
      leads_this_month: leadsThisMonth,
      signals_today: signalsToday,
    },
    remaining: {
      leads: config.leads_per_month === -1 ? 'unlimited' : Math.max(0, config.leads_per_month - leadsThisMonth),
      signals: config.signals_per_day === -1 ? 'unlimited' : Math.max(0, config.signals_per_day - signalsToday),
    },
  }
}

// ---------------------------------------------------------------------------
// upgradeTier — Upgrade (or downgrade) a dealer's tier
// ---------------------------------------------------------------------------

export async function upgradeTier(
  dealerId: string,
  newTier: TierName
): Promise<{ success: boolean; previous_tier: TierName; new_tier: TierName; error?: string }> {
  const supabase = await getSupabase()
  if (!supabase) {
    return { success: false, previous_tier: 'free', new_tier: newTier, error: 'Database unavailable' }
  }

  const { data: dealer } = await supabase
    .from('va_dealers')
    .select('tier')
    .eq('id', dealerId)
    .single()

  if (!dealer) {
    return { success: false, previous_tier: 'free', new_tier: newTier, error: 'Dealer not found' }
  }

  const previousTier = (dealer.tier as TierName) ?? 'free'

  const { error } = await supabase
    .from('va_dealers')
    .update({ tier: newTier })
    .eq('id', dealerId)

  if (error) {
    return { success: false, previous_tier: previousTier, new_tier: newTier, error: error.message }
  }

  return { success: true, previous_tier: previousTier, new_tier: newTier }
}
