import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import type { Dealer, Signal, MarketData } from '@/lib/types'

// =============================================================================
// Pitch Agent — Claude-powered pitch deck generation for dealer sales
// Uses Sonnet 4.6 for quality reasoning on pitch personalization
// =============================================================================

const SONNET = anthropic('claude-sonnet-4-6')

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PitchSlide {
  type: 'title' | 'problem' | 'solution' | 'roi' | 'market' | 'pricing' | 'cta'
  title: string
  content: string
  bullets?: string[]
  data?: Record<string, unknown>
}

export interface DealerPitch {
  slides: PitchSlide[]
  dealer_name: string
  recommended_tier: string
  generated_at: string
}

export interface PitchContext {
  signals?: Partial<Signal>[]
  marketData?: Partial<MarketData>[]
  competitorInfo?: string
}

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

const PITCH_SYSTEM = `You are a pitch deck content writer for Visio Auto — South Africa's first AI-powered lead generation platform for car dealerships.

Write compelling, data-driven pitch content that speaks to SA dealership principals and sales managers.

Visio Auto product details:
- AI Signal Engine: tracks 23 buying signals (CIPC registrations, LinkedIn job changes, lease expirations, social media intent, etc.)
- AI Qualification: every lead scored 0-100 on budget, timeline, trade-in, finance status
- WhatsApp delivery: leads arrive in <60 seconds
- VIN matching: buyers matched to specific vehicles in dealer inventory
- Multilingual: all 11 SA languages supported
- Pricing tiers: Starter R7,500/50 leads, Growth R15,000/100 leads, Pro R25,000/200 leads, Enterprise R45,000/500 leads

Industry pain points:
- AutoTrader costs R500+ per lead with 2-3% conversion
- Dealers waste time on tyre kickers (unqualified walk-ins and calls)
- Leads arrive via email inbox — slow response kills deals
- No intelligence on when someone is actually ready to buy
- Chinese brands (Chery, Haval, GWM) disrupting traditional brand loyalty

Return valid JSON only. No markdown fences. No commentary.`

// ---------------------------------------------------------------------------
// generateDealerPitch
// ---------------------------------------------------------------------------

export async function generateDealerPitch(
  dealer: Partial<Dealer>,
  context: PitchContext = {}
): Promise<DealerPitch> {
  const brandStr = dealer.brands?.join(', ') || 'vehicles'
  const signalCount = context.signals?.length ?? 15
  const area = dealer.area || 'Gauteng'

  const marketContext = context.marketData?.slice(0, 5).map(m =>
    `${m.brand || 'Market'}: ${m.value} ${m.unit || 'units'} (${m.change_pct ? `${m.change_pct > 0 ? '+' : ''}${m.change_pct}% change` : 'stable'})`
  ).join('\n') || 'Strong demand across all segments'

  // Recommend tier based on dealer size
  let recommendedTier = 'growth'
  if (dealer.tier === 'pro' || dealer.tier === 'enterprise') recommendedTier = dealer.tier
  else if (dealer.group_name) recommendedTier = 'pro'

  const tierPricing: Record<string, { fee: number; leads: number }> = {
    starter: { fee: 7500, leads: 50 },
    growth: { fee: 15000, leads: 100 },
    pro: { fee: 25000, leads: 200 },
    enterprise: { fee: 45000, leads: 500 },
  }
  const pricing = tierPricing[recommendedTier] || tierPricing.growth

  const { text } = await generateText({
    model: SONNET,
    system: PITCH_SYSTEM,
    prompt: `Generate a 7-slide pitch deck as a JSON array for this dealer.

Dealer info:
- Name: ${dealer.name || 'Dealer'}
- Principal: ${dealer.dealer_principal || 'Dealer Principal'}
- Brands: ${brandStr}
- Area: ${area}
- Group: ${dealer.group_name || 'Independent'}

Market data for their brands:
${marketContext}

Signals detected in their area: ${signalCount}

Recommended tier: ${recommendedTier} (R${pricing.fee.toLocaleString()}/month for ${pricing.leads} leads)

Generate a JSON array of exactly 7 slides with this structure:
[
  { "type": "title", "title": "...", "content": "...", "bullets": [] },
  { "type": "problem", "title": "...", "content": "...", "bullets": ["pain point 1", "pain point 2", ...] },
  { "type": "solution", "title": "...", "content": "...", "bullets": ["feature 1", "feature 2", ...] },
  { "type": "roi", "title": "...", "content": "...", "bullets": ["math line 1", ...], "data": { "investment": number, "leads": number, "conversion_rate": number, "avg_profit": number, "monthly_revenue": number, "roi_multiple": number } },
  { "type": "market", "title": "...", "content": "...", "bullets": ["insight 1", ...] },
  { "type": "pricing", "title": "...", "content": "...", "bullets": ["tier detail 1", ...], "data": { "recommended_tier": "${recommendedTier}", "monthly_fee": ${pricing.fee}, "leads_included": ${pricing.leads} } },
  { "type": "cta", "title": "...", "content": "...", "bullets": [] }
]

Make the title slide say "Visio Auto — AI-Powered Leads for ${dealer.name || 'Your Dealership'}".
Make ROI math specific to ${brandStr} and ${area}.
Make the CTA slide say "Start your free trial".
Return ONLY the JSON array.`,
  })

  let slides: PitchSlide[]
  try {
    const cleaned = text.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim()
    slides = JSON.parse(cleaned)
  } catch {
    // Fallback slides if AI response doesn't parse
    slides = buildFallbackSlides(dealer, recommendedTier, pricing, signalCount)
  }

  return {
    slides,
    dealer_name: dealer.name || 'Dealer',
    recommended_tier: recommendedTier,
    generated_at: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Fallback slides (if AI generation fails to parse)
// ---------------------------------------------------------------------------

function buildFallbackSlides(
  dealer: Partial<Dealer>,
  tier: string,
  pricing: { fee: number; leads: number },
  signalCount: number
): PitchSlide[] {
  const brandStr = dealer.brands?.join(', ') || 'vehicles'
  const area = dealer.area || 'Gauteng'
  const monthlyRevenue = Math.round(pricing.leads * 0.1 * 35000)
  const roi = Math.round(monthlyRevenue / pricing.fee * 10) / 10

  return [
    {
      type: 'title',
      title: `Visio Auto — AI-Powered Leads for ${dealer.name || 'Your Dealership'}`,
      content: `Qualified ${brandStr} buyers, delivered to your WhatsApp in under 60 seconds.`,
    },
    {
      type: 'problem',
      title: 'The Dealership Lead Problem',
      content: 'Traditional lead sources are expensive, slow, and full of tyre kickers.',
      bullets: [
        'AutoTrader charges R500+ per lead with only 2-3% conversion',
        'Email leads sit in inboxes — slow response kills deals',
        'No way to know who is actually ready to buy right now',
        'Unqualified walk-ins waste your sales team\'s time',
        'Chinese brands disrupting traditional loyalty',
      ],
    },
    {
      type: 'solution',
      title: 'Visio Auto: AI Signal Engine + Smart Qualification',
      content: 'We find buyers before they start shopping, qualify them with AI, and deliver them to your WhatsApp.',
      bullets: [
        '23 buying signals tracked (job changes, lease expirations, new businesses, etc.)',
        'AI qualification: budget, timeline, trade-in, finance status scored 0-100',
        'WhatsApp delivery in <60 seconds — fastest in the industry',
        'VIN-specific matching to YOUR inventory',
        'All 11 SA languages supported',
      ],
    },
    {
      type: 'roi',
      title: `ROI for ${dealer.name || 'Your Dealership'}`,
      content: `Here's the math for your ${tier} plan:`,
      bullets: [
        `Investment: R${pricing.fee.toLocaleString()}/month`,
        `AI-Qualified Leads: ${pricing.leads}/month`,
        `Conversion Rate: 10% (vs 2-3% industry avg)`,
        `Sales Closed: ${Math.round(pricing.leads * 0.1)}/month`,
        `Avg Profit/Sale: R35,000+`,
        `Monthly Revenue: R${monthlyRevenue.toLocaleString()}`,
        `ROI: ${roi}x return`,
      ],
      data: {
        investment: pricing.fee,
        leads: pricing.leads,
        conversion_rate: 10,
        avg_profit: 35000,
        monthly_revenue: monthlyRevenue,
        roi_multiple: roi,
      },
    },
    {
      type: 'market',
      title: `${brandStr} Market in ${area}`,
      content: `${signalCount} active buying signals detected in ${area} this week.`,
      bullets: [
        `Strong demand for ${brandStr} in the ${area} corridor`,
        'SUV and bakkie segments leading growth',
        'Finance pre-approval rates at 5-year high',
        'Digital-first buyers expect instant response',
      ],
    },
    {
      type: 'pricing',
      title: 'Your Recommended Plan',
      content: `Based on your dealership profile, we recommend the ${tier.charAt(0).toUpperCase() + tier.slice(1)} plan.`,
      bullets: [
        `${tier.charAt(0).toUpperCase() + tier.slice(1)}: R${pricing.fee.toLocaleString()}/month — ${pricing.leads} leads`,
        `Cost per lead: R${Math.round(pricing.fee / pricing.leads)}`,
        'No lock-in contracts — month-to-month',
        'Free onboarding and WhatsApp setup',
        '14-day free trial to prove ROI',
      ],
      data: {
        recommended_tier: tier,
        monthly_fee: pricing.fee,
        leads_included: pricing.leads,
      },
    },
    {
      type: 'cta',
      title: 'Start Your Free Trial',
      content: `Get ${pricing.leads} AI-qualified ${brandStr} buyers delivered to your WhatsApp. No risk, no lock-in.`,
      bullets: [],
    },
  ]
}
