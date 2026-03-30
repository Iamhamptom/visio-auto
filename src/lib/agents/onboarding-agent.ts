// =============================================================================
// Visio Auto — Smart Onboarding Agent
// Concierge that greets new dealers, researches them, and gets them set up.
// Uses Claude Sonnet 4.6 for personalized market intelligence.
// =============================================================================

import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'https://visio-auto.vercel.app'

interface DealerProfile {
  id: string
  name: string
  brands?: string[]
  area?: string
  city?: string
  phone?: string
  email?: string
  website?: string
  dealer_principal?: string
}

// ---------------------------------------------------------------------------
// generateWelcomeMessage
// ---------------------------------------------------------------------------

export async function generateWelcomeMessage(dealer: DealerProfile): Promise<string> {
  // Gather context about the dealer's area
  let signalContext = ''
  let marketContext = ''

  try {
    const signalRes = await fetch(`${BASE_URL}/api/signals?area=${encodeURIComponent(dealer.area || '')}&limit=10`)
    if (signalRes.ok) {
      const data = await signalRes.json()
      const signals = data.signals || data.data || []
      signalContext = signals.length > 0
        ? `Recent signals in ${dealer.area}: ${signals.length} buying signals detected this week, including: ${signals.slice(0, 3).map((s: { title: string }) => s.title).join(', ')}`
        : `Signal monitoring is active for ${dealer.area || 'their area'}.`
    }
  } catch {
    signalContext = 'Signal engine is active and monitoring.'
  }

  try {
    const marketRes = await fetch(`${BASE_URL}/api/market?type=brand_sales`)
    if (marketRes.ok) {
      const data = await marketRes.json()
      marketContext = JSON.stringify(data).slice(0, 500)
    }
  } catch {
    marketContext = 'SA car market data available.'
  }

  const { text } = await generateText({
    model: anthropic('claude-sonnet-4-6'),
    system: `You are the Visio Auto onboarding concierge. You write warm, professional, data-driven welcome messages for new car dealerships joining the platform.

Your tone: confident, knowledgeable, South African. Use Rand amounts. Reference real areas (Sandton, Bryanston, Menlyn, etc).

Structure your welcome:
1. Greet them by name and confirm their dealership identity
2. Share what you already know about their market (signals, trends)
3. Give a specific ROI projection based on their brand and area
4. Offer to get started immediately

Keep it under 300 words. Use emoji sparingly (max 2-3). Format with bullet points for data.`,
    prompt: `Generate a personalized welcome message for this new dealer:

Name: ${dealer.name}
Brands: ${(dealer.brands || []).join(', ') || 'Unknown'}
Area: ${dealer.area || 'Unknown'}
City: ${dealer.city || 'Unknown'}
Principal: ${dealer.dealer_principal || 'Unknown'}
Website: ${dealer.website || 'Not found'}

Market context: ${marketContext}
Signal context: ${signalContext}

Write a compelling welcome that makes them feel like we already know their business and can immediately add value. Include specific numbers where possible.`,
  })

  return text
}

// ---------------------------------------------------------------------------
// generateMarketPOV
// ---------------------------------------------------------------------------

export async function generateMarketPOV(dealer: DealerProfile): Promise<string> {
  // Gather market data for their brands
  let marketData = ''
  let signalData = ''
  let competitorData = ''

  try {
    const [marketRes, signalRes, dealerRes] = await Promise.all([
      fetch(`${BASE_URL}/api/market?type=brand_sales`),
      fetch(`${BASE_URL}/api/signals?area=${encodeURIComponent(dealer.area || '')}&limit=20`),
      fetch(`${BASE_URL}/api/dealers?area=${encodeURIComponent(dealer.area || '')}`),
    ])

    if (marketRes.ok) marketData = JSON.stringify(await marketRes.json()).slice(0, 800)
    if (signalRes.ok) signalData = JSON.stringify(await signalRes.json()).slice(0, 800)
    if (dealerRes.ok) competitorData = JSON.stringify(await dealerRes.json()).slice(0, 800)
  } catch {
    // Continue with what we have
  }

  const { text } = await generateText({
    model: anthropic('claude-sonnet-4-6'),
    system: `You are Visio Auto's market intelligence analyst. You produce concise, actionable market POV reports for car dealerships in South Africa.

Structure:
1. Brand Performance — their brand(s) nationally
2. Area Analysis — buying patterns in their area
3. Competitor Landscape — other dealers in the same area
4. Growth Opportunities — underserved segments, emerging trends
5. Recommended Actions — 3 specific things they should do

Use real SA car market context. Reference NAAMSA data, Chinese brand disruption, EV trends, used car market growth. Format with headers and bullet points.`,
    prompt: `Generate a market POV for:

Dealer: ${dealer.name}
Brands: ${(dealer.brands || []).join(', ')}
Area: ${dealer.area}, ${dealer.city}

Market data: ${marketData || 'Use general SA market knowledge'}
Signals in area: ${signalData || 'No specific signals yet'}
Other dealers in area: ${competitorData || 'Unknown'}

Be specific and actionable. Use Rand amounts.`,
  })

  return text
}

// ---------------------------------------------------------------------------
// runOnboardingFlow
// ---------------------------------------------------------------------------

export async function runOnboardingFlow(dealer: DealerProfile): Promise<{
  welcome: string
  marketPov: string
  nextSteps: string[]
}> {
  // Run welcome and market POV in parallel
  const [welcome, marketPov] = await Promise.all([
    generateWelcomeMessage(dealer),
    generateMarketPOV(dealer),
  ])

  const nextSteps = [
    'Dashboard is being set up with your brand and area preferences',
    `Signal agents are now monitoring ${dealer.area || 'your area'} for buying triggers`,
    'Connect your DMS/CRM for automated lead delivery (optional)',
    'Connect social media accounts for audience analysis (optional)',
    `First intelligence brief will be ready within 24 hours`,
  ]

  return { welcome, marketPov, nextSteps }
}
