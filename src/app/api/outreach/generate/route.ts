import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  generateColdEmail,
  generateFollowUp,
  generateLinkedInDM,
  generateWhatsAppCampaign,
  generateDealerBrief,
} from '@/lib/agents/outreach-agent'
import type { Dealer, Signal, MarketData } from '@/lib/types'

// =============================================================================
// POST /api/outreach/generate — AI Outreach Generator
// Generate personalized outreach content for a specific dealer
// =============================================================================

const generateSchema = z.object({
  dealer_id: z.string().min(1, 'dealer_id is required'),
  type: z.enum(['cold_email', 'follow_up', 'linkedin_dm', 'whatsapp', 'brief']),
  previous_email: z.object({
    subject: z.string(),
    body: z.string(),
  }).optional(),
  days_since: z.number().int().min(1).optional(),
})

// ---------------------------------------------------------------------------
// Demo dealers fallback (matches existing campaign route)
// ---------------------------------------------------------------------------

const DEMO_DEALERS: Record<string, Partial<Dealer>> = {
  'd-001': { id: 'd-001', name: 'Motus Toyota Kempton Park', dealer_principal: 'Werner van Rooyen', area: 'Kempton Park', brands: ['Toyota'], group_name: 'Motus Group', tier: 'growth' },
  'd-002': { id: 'd-002', name: 'BMW Bryanston (JSN Motors)', dealer_principal: 'Johan Smit', area: 'Bryanston', brands: ['BMW'], group_name: 'JSN Motors Group', tier: 'pro' },
  'd-003': { id: 'd-003', name: 'Audi Centre Sandton', dealer_principal: 'Michael Fourie', area: 'Sandton', brands: ['Audi'], group_name: 'Motus', tier: 'pro' },
  'd-004': { id: 'd-004', name: 'Mercedes-Benz Sandton', dealer_principal: 'Pierre du Toit', area: 'Sandton', brands: ['Mercedes-Benz'], group_name: null, tier: 'enterprise' },
  'd-005': { id: 'd-005', name: 'Hatfield VW', dealer_principal: 'Leon Erasmus', area: 'Hatfield', brands: ['Volkswagen'], group_name: null, tier: 'growth' },
  'd-006': { id: 'd-006', name: 'NTT Toyota Menlyn', dealer_principal: 'Stefan Naidoo', area: 'Menlyn', brands: ['Toyota'], group_name: 'NTT Motor Group', tier: 'growth' },
  'd-007': { id: 'd-007', name: 'CMH Kia Sandton', dealer_principal: 'Kevin Moodley', area: 'Sandton', brands: ['Kia'], group_name: 'CMH Group', tier: 'starter' },
  'd-008': { id: 'd-008', name: 'Pharoah Auto', dealer_principal: 'Yusuf Moosa', area: 'Sandton', brands: ['Porsche', 'Ferrari', 'Lamborghini'], group_name: null, tier: 'enterprise' },
  'd-009': { id: 'd-009', name: 'Halfway Toyota Fourways', dealer_principal: 'Francois Viljoen', area: 'Fourways', brands: ['Toyota'], group_name: 'Halfway Group', tier: 'growth' },
  'd-010': { id: 'd-010', name: 'SMH BMW Oakdene', dealer_principal: 'Charl Steyn', area: 'Oakdene', brands: ['BMW'], group_name: 'SMH Group', tier: 'pro' },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function fetchDealer(dealerId: string): Promise<Partial<Dealer> | null> {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data } = await supabase
      .from('va_dealers')
      .select('*')
      .eq('id', dealerId)
      .single()
    if (data) return data as Dealer
  } catch {
    // Fall through to demo data
  }
  return DEMO_DEALERS[dealerId] || null
}

async function fetchSignalsForArea(area: string): Promise<Partial<Signal>[]> {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data } = await supabase
      .from('va_signals')
      .select('*')
      .ilike('area', `%${area}%`)
      .order('created_at', { ascending: false })
      .limit(10)
    if (data && data.length > 0) return data
  } catch {
    // Fall through
  }
  return []
}

async function fetchMarketDataForBrands(brands: string[]): Promise<Partial<MarketData>[]> {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data } = await supabase
      .from('va_market_data')
      .select('*')
      .in('brand', brands)
      .limit(10)
    if (data && data.length > 0) return data
  } catch {
    // Fall through
  }
  return []
}

// ---------------------------------------------------------------------------
// POST /api/outreach/generate
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = generateSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.issues },
      { status: 400 }
    )
  }

  const { dealer_id, type, previous_email, days_since } = parsed.data

  // Fetch dealer data
  const dealer = await fetchDealer(dealer_id)
  if (!dealer) {
    return NextResponse.json(
      { error: `Dealer not found: ${dealer_id}` },
      { status: 404 }
    )
  }

  // Fetch contextual data
  const [signals, marketData] = await Promise.all([
    fetchSignalsForArea(dealer.area || ''),
    fetchMarketDataForBrands(dealer.brands || []),
  ])

  try {
    switch (type) {
      case 'cold_email': {
        const email = await generateColdEmail(dealer, {
          signalCount: signals.length || undefined,
          recentSignals: signals,
          marketData,
        })
        return NextResponse.json({
          success: true,
          type: 'cold_email',
          dealer_id,
          dealer_name: dealer.name,
          content: email,
        })
      }

      case 'follow_up': {
        if (!previous_email) {
          return NextResponse.json(
            { error: 'previous_email is required for follow_up type' },
            { status: 400 }
          )
        }
        const followUp = await generateFollowUp(dealer, previous_email, days_since || 3)
        return NextResponse.json({
          success: true,
          type: 'follow_up',
          dealer_id,
          dealer_name: dealer.name,
          content: followUp,
        })
      }

      case 'linkedin_dm': {
        const dm = await generateLinkedInDM(dealer)
        return NextResponse.json({
          success: true,
          type: 'linkedin_dm',
          dealer_id,
          dealer_name: dealer.name,
          content: dm,
        })
      }

      case 'whatsapp': {
        const sequence = await generateWhatsAppCampaign(dealer)
        return NextResponse.json({
          success: true,
          type: 'whatsapp',
          dealer_id,
          dealer_name: dealer.name,
          content: sequence,
        })
      }

      case 'brief': {
        const brief = await generateDealerBrief(signals, marketData, dealer)
        return NextResponse.json({
          success: true,
          type: 'brief',
          dealer_id,
          dealer_name: dealer.name,
          content: brief,
        })
      }

      default:
        return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 })
    }
  } catch (error) {
    console.error('[OUTREACH] Generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate outreach content. Check ANTHROPIC_API_KEY.' },
      { status: 500 }
    )
  }
}
