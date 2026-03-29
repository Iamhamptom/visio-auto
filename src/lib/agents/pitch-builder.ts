import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import type { Dealer, MarketData, Signal } from '@/lib/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SlideType =
  | 'hero'
  | 'problem'
  | 'solution'
  | 'stats'
  | 'roi'
  | 'features'
  | 'market'
  | 'pricing'
  | 'testimonial'
  | 'cta'

export interface PitchSlide {
  type: SlideType
  title: string
  subtitle: string
  content: string // markdown
  data: Record<string, unknown>
}

export interface PitchDeck {
  id: string
  dealer_id: string
  dealer_name: string
  template: string
  slides: PitchSlide[]
  created_at: string
}

// ---------------------------------------------------------------------------
// Prompt helpers
// ---------------------------------------------------------------------------

function dealerContext(dealer: Partial<Dealer>) {
  return [
    `Dealer: ${dealer.name ?? 'Unknown'}`,
    dealer.group_name ? `Group: ${dealer.group_name}` : null,
    dealer.brands?.length ? `Brands: ${dealer.brands.join(', ')}` : null,
    dealer.area ? `Area: ${dealer.area}, ${dealer.city}, ${dealer.province}` : null,
    dealer.tier ? `Tier: ${dealer.tier}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}

function marketContext(market: Partial<MarketData>[]) {
  if (!market.length) return 'No market data available.'
  return market
    .map(
      (m) =>
        `${m.brand ?? 'Unknown'}: ${m.value} ${m.unit ?? 'units'} (${m.period ?? ''})${m.change_pct != null ? ` | ${m.change_pct > 0 ? '+' : ''}${m.change_pct}%` : ''}`
    )
    .join('\n')
}

function signalContext(signals: Partial<Signal>[]) {
  if (!signals.length) return 'No recent signals in this area.'
  return signals
    .slice(0, 8)
    .map(
      (s) =>
        `- [${s.signal_type}] ${s.title} (${Math.round((s.buying_probability ?? 0) * 100)}% buy probability)`
    )
    .join('\n')
}

// ---------------------------------------------------------------------------
// ROI calculator
// ---------------------------------------------------------------------------

function calculateROI(tier?: string) {
  const plans: Record<string, { fee: number; leads: number }> = {
    starter: { fee: 7500, leads: 50 },
    growth: { fee: 15000, leads: 100 },
    pro: { fee: 25000, leads: 200 },
    enterprise: { fee: 45000, leads: 500 },
  }
  const plan = plans[tier ?? 'growth'] ?? plans.growth
  const conversionRate = 0.1
  const profitPerSaleMin = 35000
  const profitPerSaleMax = 51000
  const sales = Math.round(plan.leads * conversionRate)
  return {
    monthly_fee: plan.fee,
    leads_per_month: plan.leads,
    conversion_rate: '10%',
    expected_sales: sales,
    profit_per_sale_range: `R${(profitPerSaleMin / 1000).toFixed(0)}K - R${(profitPerSaleMax / 1000).toFixed(0)}K`,
    monthly_profit_min: sales * profitPerSaleMin,
    monthly_profit_max: sales * profitPerSaleMax,
    roi_min: Math.round((sales * profitPerSaleMin) / plan.fee),
    roi_max: Math.round((sales * profitPerSaleMax) / plan.fee),
  }
}

// ---------------------------------------------------------------------------
// Pricing tiers
// ---------------------------------------------------------------------------

function recommendedTier(dealer: Partial<Dealer>) {
  const brands = dealer.brands ?? []
  const luxuryBrands = ['BMW', 'Mercedes', 'Audi', 'Porsche', 'Land Rover', 'Jaguar', 'Lexus', 'Volvo']
  const isLuxury = brands.some((b) => luxuryBrands.includes(b))
  if (dealer.tier === 'enterprise' || brands.length > 5) return 'enterprise'
  if (isLuxury) return 'pro'
  if (brands.length > 2) return 'growth'
  return 'starter'
}

const PRICING_TABLE = {
  starter: { name: 'Starter', fee: 'R7,500/mo', leads: '50 leads', features: ['AI lead scoring', 'WhatsApp delivery', 'Basic analytics'] },
  growth: { name: 'Growth', fee: 'R15,000/mo', leads: '100 leads', features: ['Everything in Starter', 'Signal Engine', 'VIN matching', 'Voice follow-up'] },
  pro: { name: 'Pro', fee: 'R25,000/mo', leads: '200 leads', features: ['Everything in Growth', 'Market Terminal', 'Multi-brand tracking', 'Priority support'] },
  enterprise: { name: 'Enterprise', fee: 'R45,000/mo', leads: '500 leads', features: ['Everything in Pro', 'Dedicated account manager', 'API access', 'Custom integrations'] },
}

// ---------------------------------------------------------------------------
// Main builder
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a pitch deck writer for Visio Auto, an AI-powered lead generation platform for South African car dealerships. You write compelling, data-driven pitch decks that sell dealers on the value of AI-qualified leads.

Your tone: Professional but energetic. Use South African market context. Back every claim with numbers. Focus on ROI and pain points that SA dealers actually face (AutoTrader costs R800+/lead, slow follow-up kills conversions, generic leads waste salespeople's time).

Visio Auto's 7-Layer Stack:
1. Signal Engine — detects 23 life-event buying signals (promotions, new babies, relocations, etc.)
2. AI Scoring — 100-point qualification with budget, timeline, and intent extraction
3. VIN Matching — matches qualified buyers to specific vehicles in dealer inventory
4. WhatsApp Delivery — hot leads delivered to sales team WhatsApp in <60 seconds
5. Voice AI — automated follow-up calls for warm leads
6. Market Terminal — real-time NAAMSA data, competitor tracking, market share analytics
7. Analytics Dashboard — full pipeline visibility, ROI tracking, conversion funnels

Always output valid JSON when asked for structured data.`

export async function buildDealershipPitch(
  dealer: Partial<Dealer>,
  marketData: Partial<MarketData>[],
  signals: Partial<Signal>[]
): Promise<PitchSlide[]> {
  const roi = calculateROI(dealer.tier ?? recommendedTier(dealer))
  const tier = recommendedTier(dealer)
  const pricing = PRICING_TABLE[tier as keyof typeof PRICING_TABLE]
  const signalCount = signals.length

  const prompt = `Generate a pitch deck for the following dealership. Return ONLY a JSON array of slide objects.

DEALER INFO:
${dealerContext(dealer)}

MARKET DATA:
${marketContext(marketData)}

RECENT SIGNALS IN THEIR AREA:
${signalContext(signals)}

ROI NUMBERS:
- Monthly fee: R${roi.monthly_fee.toLocaleString()}
- Leads per month: ${roi.leads_per_month}
- Expected conversion: ${roi.conversion_rate}
- Expected sales: ${roi.expected_sales}/month
- Profit per sale: ${roi.profit_per_sale_range}
- Monthly profit: R${roi.monthly_profit_min.toLocaleString()} - R${roi.monthly_profit_max.toLocaleString()}
- ROI: ${roi.roi_min}x - ${roi.roi_max}x

RECOMMENDED PLAN: ${pricing.name} (${pricing.fee}, ${pricing.leads}/month)

Generate exactly 9 slides as a JSON array. Each slide has: { "type", "title", "subtitle", "content" (markdown), "data" (object with relevant numbers/lists) }.

Slide order:
1. type:"hero" — "AI-Powered Leads for ${dealer.name ?? 'Your Dealership'}" — hook them with the value prop
2. type:"problem" — SA dealership pain points (AutoTrader costs, slow response, low conversion, generic leads)
3. type:"solution" — Visio Auto's 7-layer stack explanation
4. type:"market" — Their brand's market position using the market data provided. Use real numbers.
5. type:"stats" — Signal demo: "${signalCount} buying signals detected in ${dealer.area ?? 'their area'}" — show actual signal examples
6. type:"roi" — Personalized ROI calculator with the exact numbers above
7. type:"pricing" — Recommended tier with features list
8. type:"testimonial" — Tony Duardo partnership + VisioCorp portfolio (mention: "Tony Duardo, SA's top music marketer, chose VisioCorp for his artist campaigns")
9. type:"cta" — "Start your free trial — see signals in your area within 24 hours"

Return ONLY the JSON array, no markdown fences.`

  const result = await generateText({
    model: anthropic('claude-sonnet-4-6'),
    system: SYSTEM_PROMPT,
    prompt,
    temperature: 0.7,
  })

  try {
    const slides = JSON.parse(result.text) as PitchSlide[]
    return slides
  } catch {
    // Attempt to extract JSON from response
    const match = result.text.match(/\[[\s\S]*\]/)
    if (match) {
      return JSON.parse(match[0]) as PitchSlide[]
    }
    // Return fallback structure
    return buildFallbackSlides(dealer, marketData, signals, roi, tier)
  }
}

export async function buildCustomPitch(
  prompt: string,
  dealer: Partial<Dealer>
): Promise<PitchSlide[]> {
  const result = await generateText({
    model: anthropic('claude-sonnet-4-6'),
    system: SYSTEM_PROMPT + `\n\nDealer context:\n${dealerContext(dealer)}`,
    prompt: `Create a custom pitch deck based on this brief: "${prompt}"

Return a JSON array of slide objects. Each slide: { "type" (hero|problem|solution|stats|roi|features|market|pricing|testimonial|cta), "title", "subtitle", "content" (markdown), "data" (object) }.

Generate 5-10 slides. Return ONLY the JSON array, no markdown fences.`,
    temperature: 0.8,
  })

  try {
    return JSON.parse(result.text) as PitchSlide[]
  } catch {
    const match = result.text.match(/\[[\s\S]*\]/)
    if (match) return JSON.parse(match[0]) as PitchSlide[]
    return []
  }
}

// ---------------------------------------------------------------------------
// Fallback slides (if AI response parsing fails)
// ---------------------------------------------------------------------------

function buildFallbackSlides(
  dealer: Partial<Dealer>,
  marketData: Partial<MarketData>[],
  signals: Partial<Signal>[],
  roi: ReturnType<typeof calculateROI>,
  tier: string
): PitchSlide[] {
  const pricing = PRICING_TABLE[tier as keyof typeof PRICING_TABLE]
  const dealerName = dealer.name ?? 'Your Dealership'

  return [
    {
      type: 'hero',
      title: `AI-Powered Leads for ${dealerName}`,
      subtitle: 'Stop chasing. Start closing.',
      content: `Visio Auto delivers **AI-qualified buyers** directly to your sales team's WhatsApp — in under 60 seconds.\n\nWe detect buying signals before your competitors even know someone is looking.`,
      data: { dealer_name: dealerName, brands: dealer.brands ?? [] },
    },
    {
      type: 'problem',
      title: 'The Dealership Lead Problem',
      subtitle: 'Sound familiar?',
      content: `- **AutoTrader leads cost R800+** each — and most never pick up the phone\n- **67% of leads** go cold within 5 minutes of first contact\n- Sales teams waste **3 hours/day** chasing unqualified browsers\n- Generic lead forms don't tell you who's actually ready to buy`,
      data: { autotrader_cost: 800, cold_rate: 67, wasted_hours: 3 },
    },
    {
      type: 'solution',
      title: 'Visio Auto\'s 7-Layer Intelligence Stack',
      subtitle: 'From signal to sale — fully automated',
      content: `1. **Signal Engine** — detects 23 life-event buying triggers\n2. **AI Scoring** — 100-point qualification (budget, timeline, intent)\n3. **VIN Matching** — matches buyers to your actual inventory\n4. **WhatsApp Delivery** — hot leads in <60 seconds\n5. **Voice AI** — automated warm-lead follow-up\n6. **Market Terminal** — real-time NAAMSA data & competitor tracking\n7. **Analytics Dashboard** — full pipeline visibility`,
      data: { layers: 7, signal_types: 23, delivery_time: '<60s' },
    },
    {
      type: 'market',
      title: 'Your Market Position',
      subtitle: `${dealer.area ?? 'South Africa'} — brand intelligence`,
      content: marketData.length
        ? marketData.map((m) => `- **${m.brand}**: ${m.value} ${m.unit ?? 'units'} (${m.period ?? ''})${m.change_pct != null ? ` — ${m.change_pct > 0 ? '+' : ''}${m.change_pct}% change` : ''}`).join('\n')
        : 'We track real-time NAAMSA sales data, market share shifts, and competitor pricing for every brand you carry.',
      data: { market_data: marketData },
    },
    {
      type: 'stats',
      title: `${signals.length} Buying Signals Detected`,
      subtitle: `In ${dealer.area ?? 'your area'} this week`,
      content: signals.length
        ? signals.slice(0, 5).map((s) => `- **${s.signal_type}**: ${s.title} (${Math.round((s.buying_probability ?? 0) * 100)}% buy probability)`).join('\n')
        : '- New business registrations in your area\n- Recent promotions at nearby corporates\n- Relocation activity into your catchment\n- Lease expiry clusters this quarter',
      data: { signal_count: signals.length, signals: signals.slice(0, 5) },
    },
    {
      type: 'roi',
      title: 'Your Personalised ROI',
      subtitle: 'Conservative estimates based on SA dealer data',
      content: `| Metric | Value |\n|---|---|\n| Monthly investment | R${roi.monthly_fee.toLocaleString()} |\n| AI-qualified leads | ${roi.leads_per_month}/month |\n| Conversion rate | ${roi.conversion_rate} |\n| Expected sales | ${roi.expected_sales}/month |\n| Profit per sale | ${roi.profit_per_sale_range} |\n| **Monthly profit** | **R${roi.monthly_profit_min.toLocaleString()} - R${roi.monthly_profit_max.toLocaleString()}** |\n| **ROI** | **${roi.roi_min}x - ${roi.roi_max}x** |`,
      data: roi,
    },
    {
      type: 'pricing',
      title: `Recommended: ${pricing.name} Plan`,
      subtitle: `${pricing.fee} — ${pricing.leads}/month`,
      content: pricing.features.map((f) => `- ${f}`).join('\n'),
      data: { recommended_tier: tier, ...pricing, all_plans: PRICING_TABLE },
    },
    {
      type: 'testimonial',
      title: 'Trusted by Industry Leaders',
      subtitle: 'VisioCorp portfolio',
      content: `> "Tony Duardo, SA's top music marketer, chose VisioCorp for his artist campaigns — the same AI technology that powers Visio Auto."\n\nVisioCorp builds AI operating systems for businesses across **13 industries**. Visio Auto is our specialist automotive intelligence product, backed by the same infrastructure that manages R10M+ in client operations.`,
      data: { partner: 'Tony Duardo', industries: 13, parent: 'VisioCorp' },
    },
    {
      type: 'cta',
      title: 'See Signals in Your Area Within 24 Hours',
      subtitle: 'Start your free trial today',
      content: `1. **Sign up** — takes 2 minutes\n2. **We scan your area** — our Signal Engine activates immediately\n3. **Receive your first leads** — AI-qualified buyers, delivered to WhatsApp\n\nNo lock-in contract. Cancel anytime.\n\n**[Get Started Now](/get-quote)**`,
      data: { trial_period: '14 days', setup_time: '24 hours' },
    },
  ]
}
