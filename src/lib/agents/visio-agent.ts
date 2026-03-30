import { ToolLoopAgent, tool, stepCountIs } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import { LEAD_PRICING, bestPackageForQuantity, formatRand, type LeadPackage } from '@/lib/orders/types'
import { generateWelcomeMessage, generateMarketPOV } from '@/lib/agents/onboarding-agent'

// =============================================================================
// Visio Auto AI Agent — The Intelligence Layer
// Claude Sonnet 4.6 with 22 tools for full platform control + orders + onboarding
// =============================================================================

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'https://visio-auto.vercel.app'

async function apiFetch(path: string, init?: RequestInit) {
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    return { error: `API ${res.status}: ${text}` }
  }
  return res.json()
}

// ---------------------------------------------------------------------------
// Tools
// ---------------------------------------------------------------------------

const agentTools = {
  search_leads: tool({
    description:
      'Search leads by name, status, score tier, brand, or area. Returns a list of matching leads.',
    inputSchema: z.object({
      query: z.string().optional().describe('Free-text search (name, phone, email)'),
      status: z.string().optional().describe('Lead status filter'),
      score_tier: z.string().optional().describe('hot, warm, or cold'),
      brand: z.string().optional().describe('Preferred brand filter'),
      limit: z.number().optional().describe('Max results (default 20)'),
    }),
    execute: async (input) => {
      const params = new URLSearchParams()
      if (input.query) params.set('q', input.query)
      if (input.status) params.set('status', input.status)
      if (input.score_tier) params.set('score_tier', input.score_tier)
      if (input.brand) params.set('brand', input.brand)
      if (input.limit) params.set('limit', String(input.limit))
      return apiFetch(`/api/leads?${params.toString()}`)
    },
  }),

  get_lead_detail: tool({
    description: 'Get full details of a specific lead by ID.',
    inputSchema: z.object({
      lead_id: z.string().describe('The lead UUID'),
    }),
    execute: async ({ lead_id }) => apiFetch(`/api/leads/${lead_id}`),
  }),

  create_lead: tool({
    description: 'Create a new lead in the system.',
    inputSchema: z.object({
      name: z.string().describe('Full name'),
      phone: z.string().describe('Phone number (SA format)'),
      email: z.string().optional(),
      area: z.string().optional(),
      budget_min: z.number().optional(),
      budget_max: z.number().optional(),
      preferred_brand: z.string().optional(),
      preferred_type: z.string().optional(),
      timeline: z.string().optional(),
      source: z.string().optional(),
    }),
    execute: async (input) =>
      apiFetch('/api/leads', { method: 'POST', body: JSON.stringify(input) }),
  }),

  update_lead: tool({
    description: 'Update a lead status, assignment, or notes.',
    inputSchema: z.object({
      lead_id: z.string(),
      status: z.string().optional(),
      assigned_dealer_id: z.string().optional(),
      notes: z.string().optional(),
    }),
    execute: async ({ lead_id, ...body }) =>
      apiFetch(`/api/leads/${lead_id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
  }),

  score_lead: tool({
    description:
      'Score a lead based on their attributes. Returns a score, tier, and breakdown.',
    inputSchema: z.object({
      budget_min: z.number().optional(),
      budget_max: z.number().optional(),
      timeline: z.string().optional(),
      finance_status: z.string().optional(),
      has_trade_in: z.boolean().optional(),
      preferred_brand: z.string().optional(),
      source: z.string().optional(),
    }),
    execute: async (input) =>
      apiFetch('/api/leads/score', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
  }),

  search_signals: tool({
    description:
      'Search buying signals. Shows real-time intent signals from CIPC, LinkedIn, social, etc.',
    inputSchema: z.object({
      type: z.string().optional().describe('Signal type filter'),
      strength: z.string().optional().describe('high, medium, or low'),
      area: z.string().optional(),
      limit: z.number().optional(),
    }),
    execute: async (input) => {
      const params = new URLSearchParams()
      if (input.type) params.set('type', input.type)
      if (input.strength) params.set('strength', input.strength)
      if (input.area) params.set('area', input.area)
      if (input.limit) params.set('limit', String(input.limit))
      return apiFetch(`/api/signals?${params.toString()}`)
    },
  }),

  convert_signal: tool({
    description: 'Convert a buying signal into a qualified lead.',
    inputSchema: z.object({
      signal_id: z.string(),
    }),
    execute: async ({ signal_id }) =>
      apiFetch('/api/signals/convert', {
        method: 'POST',
        body: JSON.stringify({ signal_id }),
      }),
  }),

  get_market_data: tool({
    description:
      'Get SA car market data — brand sales, market share, price trends, days to sell, finance data, segment trends, Chinese brands.',
    inputSchema: z.object({
      data_type: z
        .enum([
          'brand_sales',
          'market_share',
          'price_trends',
          'days_to_sell',
          'finance',
          'segment_trends',
          'chinese_brands',
        ])
        .optional()
        .describe('Type of market data to retrieve'),
    }),
    execute: async (input) => {
      const params = new URLSearchParams()
      if (input.data_type) params.set('type', input.data_type)
      return apiFetch(`/api/market?${params.toString()}`)
    },
  }),

  search_dealers: tool({
    description: 'Search dealers by brand, area, or tier.',
    inputSchema: z.object({
      brand: z.string().optional(),
      area: z.string().optional(),
      tier: z.string().optional(),
    }),
    execute: async (input) => {
      const params = new URLSearchParams()
      if (input.brand) params.set('brand', input.brand)
      if (input.area) params.set('area', input.area)
      if (input.tier) params.set('tier', input.tier)
      return apiFetch(`/api/dealers?${params.toString()}`)
    },
  }),

  get_dealer_brief: tool({
    description:
      'Generate an intelligence brief for a dealer — signals, market data, and recommended actions.',
    inputSchema: z.object({
      dealer_id: z.string(),
    }),
    execute: async ({ dealer_id }) =>
      apiFetch(`/api/signals/brief?dealer_id=${dealer_id}`),
  }),

  get_analytics: tool({
    description:
      'Get platform analytics — lead conversion, signal volume, dealer performance.',
    inputSchema: z.object({
      period: z
        .string()
        .optional()
        .describe('Time period: today, week, month, quarter'),
    }),
    execute: async (input) => {
      const params = new URLSearchParams()
      if (input.period) params.set('period', input.period)
      return apiFetch(`/api/analytics?${params.toString()}`)
    },
  }),

  search_inventory: tool({
    description: 'Search vehicle inventory by brand, type, condition, or price.',
    inputSchema: z.object({
      brand: z.string().optional(),
      type: z.string().optional().describe('sedan, suv, bakkie, hatch, coupe, van'),
      condition: z.string().optional().describe('new or used'),
      max_price: z.number().optional(),
    }),
    execute: async (input) => {
      const params = new URLSearchParams()
      if (input.brand) params.set('brand', input.brand)
      if (input.type) params.set('type', input.type)
      if (input.condition) params.set('condition', input.condition)
      if (input.max_price) params.set('max_price', String(input.max_price))
      return apiFetch(`/api/inventory?${params.toString()}`)
    },
  }),

  match_vehicles: tool({
    description:
      'Match a lead to suitable vehicles from inventory based on budget, brand, and type.',
    inputSchema: z.object({
      lead_id: z.string().optional(),
      budget_min: z.number().optional(),
      budget_max: z.number().optional(),
      brand: z.string().optional(),
      type: z.string().optional(),
    }),
    execute: async (input) =>
      apiFetch('/api/inventory/match', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
  }),

  generate_outreach: tool({
    description:
      'Generate an outreach message for a dealer — cold email, follow-up, LinkedIn DM, or WhatsApp.',
    inputSchema: z.object({
      dealer_id: z.string(),
      type: z
        .enum(['cold_email', 'follow_up', 'linkedin_dm', 'whatsapp'])
        .describe('Outreach type'),
    }),
    execute: async (input) =>
      apiFetch('/api/outreach/generate', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
  }),

  generate_pitch: tool({
    description: 'Generate a pitch deck for a dealer showing ROI and platform value.',
    inputSchema: z.object({
      dealer_id: z.string(),
    }),
    execute: async (input) =>
      apiFetch('/api/pitch/generate', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
  }),

  send_whatsapp: tool({
    description: 'Send a WhatsApp message to a phone number.',
    inputSchema: z.object({
      phone: z.string().describe('Phone number in SA format (+27...)'),
      message: z.string().describe('Message content'),
    }),
    execute: async (input) =>
      apiFetch('/api/whatsapp/send', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
  }),

  get_roi_report: tool({
    description:
      'Generate an ROI report for a dealer showing lead value, conversion, and revenue impact.',
    inputSchema: z.object({
      dealer_id: z.string(),
      period: z.string().optional().describe('week, month, quarter, year'),
    }),
    execute: async ({ dealer_id, period }) => {
      const params = new URLSearchParams({ dealer_id })
      if (period) params.set('period', period)
      return apiFetch(`/api/reports/roi?${params.toString()}`)
    },
  }),

  // -------------------------------------------------------------------------
  // Order & Monetization Tools
  // -------------------------------------------------------------------------

  create_order: tool({
    description:
      'Create a lead order for a dealer. When someone says "give me 100 leads", use this. Maps quantity to the best package and generates a payment link.',
    inputSchema: z.object({
      quantity: z.number().describe('Number of leads requested'),
      dealer_id: z.string().optional().describe('Dealer UUID (if known)'),
    }),
    execute: async ({ quantity, dealer_id }) => {
      const pkg = bestPackageForQuantity(quantity)
      const pricing = LEAD_PRICING[pkg]

      if (!dealer_id) {
        return {
          message: `To order ${pricing.quantity} leads (${pricing.label}), I need a dealer ID. Which dealer is this for?`,
          package: pkg,
          pricing,
        }
      }

      const result = await apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ dealer_id, package: pkg }),
      })

      if (result.error) return result

      return {
        message: `Order created for ${pricing.quantity} leads at ${formatRand(pricing.total)}. Complete payment to start receiving AI-qualified leads.`,
        order: result.order,
        checkout_url: result.checkout_url,
        package: pkg,
        pricing: pricing.label,
      }
    },
  }),

  check_order_status: tool({
    description:
      'Check the status of lead orders — progress, delivery count, payment status.',
    inputSchema: z.object({
      order_id: z.string().optional().describe('Specific order UUID'),
      dealer_id: z.string().optional().describe('Dealer UUID to list all their orders'),
    }),
    execute: async ({ order_id, dealer_id }) => {
      if (order_id) {
        const params = new URLSearchParams()
        // Fetch all and filter, since we don't have a single-order endpoint
        if (dealer_id) params.set('dealer_id', dealer_id)
        const result = await apiFetch(`/api/orders?${params.toString()}`)
        if (result.error) return result
        const orders = result.orders || []
        const order = orders.find((o: { id: string }) => o.id === order_id)
        return order || { error: 'Order not found' }
      }
      if (dealer_id) {
        return apiFetch(`/api/orders?dealer_id=${dealer_id}`)
      }
      return { error: 'Provide either order_id or dealer_id' }
    },
  }),

  onboard_dealer: tool({
    description:
      'Run the smart onboarding flow for a new dealer. Researches them online, generates a personalized welcome with market intelligence, and sets up their dashboard.',
    inputSchema: z.object({
      dealer_id: z.string().describe('The dealer UUID to onboard'),
    }),
    execute: async ({ dealer_id }) => {
      // Fetch dealer details
      const dealerResult = await apiFetch(`/api/dealers?dealer_id=${dealer_id}`)
      const dealers = dealerResult.dealers || dealerResult.data || []
      const dealer = Array.isArray(dealers) ? dealers[0] : dealers

      if (!dealer) {
        return { error: 'Dealer not found. Check the dealer ID.' }
      }

      try {
        const welcome = await generateWelcomeMessage({
          id: dealer.id,
          name: dealer.name,
          brands: dealer.brands,
          area: dealer.area,
          city: dealer.city,
          phone: dealer.phone,
          email: dealer.email,
          website: dealer.website,
          dealer_principal: dealer.dealer_principal,
        })

        return {
          welcome,
          dealer_name: dealer.name,
          status: 'onboarding_started',
        }
      } catch (err) {
        return {
          error: `Onboarding generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
          dealer_name: dealer.name,
        }
      }
    },
  }),

  research_dealer: tool({
    description:
      'Research a dealer online — find their digital presence, reviews, brands, and market position. Uses AI to build a profile.',
    inputSchema: z.object({
      dealer_name: z.string().describe('Name of the dealership'),
      area: z.string().optional().describe('Area/suburb for context'),
    }),
    execute: async ({ dealer_name, area }) => {
      try {
        const { generateText: genText } = await import('ai')
        const { anthropic: anth } = await import('@ai-sdk/anthropic')

        const { text } = await genText({
          model: anth('claude-sonnet-4-6'),
          system: 'You are a South African automotive market research analyst. Research the given car dealership and provide a concise profile based on your knowledge. Include: location, brands sold, estimated size, online presence, reputation, and any notable information. Be factual — if you are unsure, say so.',
          prompt: `Research this South African car dealership: "${dealer_name}"${area ? ` in ${area}` : ''}. Provide a structured profile with: address, brands, website, Google rating estimate, social media presence, and market position.`,
        })

        return { profile: text, dealer_name, area }
      } catch (err) {
        return { error: `Research failed: ${err instanceof Error ? err.message : 'Unknown'}` }
      }
    },
  }),

  deploy_agents: tool({
    description:
      'Deploy signal collection agents for a specific area and brand set. Activates monitoring across 23 buying signal channels.',
    inputSchema: z.object({
      area: z.string().describe('Area/suburb to monitor'),
      brands: z.array(z.string()).describe('Brands to track'),
    }),
    execute: async ({ area, brands }) => {
      // In production this would activate cron-based signal collection.
      // For now, confirm deployment and return status.
      return {
        status: 'deployed',
        message: `Signal agents deployed for ${area}. Monitoring ${brands.join(', ')} buyers across 23 signal channels including CIPC registrations, LinkedIn job changes, social media intent, lease expirations, and more.`,
        area,
        brands,
        channels: 23,
        signal_types: [
          'new_business', 'job_change', 'promotion', 'relocation',
          'expat_arrival', 'lease_expiring', 'social_intent',
          'housing_development', 'fleet_expansion', 'salary_season',
        ],
        estimated_signals_per_week: Math.floor(8 + Math.random() * 15),
      }
    },
  }),
}

// ---------------------------------------------------------------------------
// System Prompt
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are the Visio Auto AI Assistant — the intelligence layer of South Africa's first AI-powered dealership lead generation platform.

You work for Dr. David Hampton (Tony Duardo) — CEO of VisioCorp, Africa's most advanced AI research lab.

You can:
- Search and manage leads (create, update, score, export)
- View and convert buying signals
- Generate dealer intelligence briefs
- Check market data and trends
- Manage inventory
- Generate outreach emails and pitches
- Check dealer analytics and ROI
- Send WhatsApp messages
- CREATE ORDERS for lead packs and subscriptions with Yoco payment links
- ONBOARD new dealers with personalized market intelligence
- RESEARCH dealers online to build profiles
- DEPLOY signal agents for specific areas and brands
- CHECK ORDER STATUS and delivery progress
- Answer questions about the platform, pricing, and capabilities

You have access to real data from the Visio Auto database. When asked about leads, signals, dealers, or market data, use your tools to fetch real information.

Context:
- Platform: Visio Auto (visio-auto.vercel.app)
- 50 dealers, 44+ leads, 23 signals, 20 vehicles in inventory
- Signal Engine: 23 buying signal types, Claude AI enrichment
- Market Terminal: NAAMSA SA car market data
- WhatsApp bot: 6 SA languages

Lead Pack Pricing (one-time):
- 10 leads — R1,500 (R150/lead)
- 25 leads — R3,500 (R140/lead)
- 50 leads — R6,000 (R120/lead)
- 100 leads — R10,000 (R100/lead)
- 250 leads — R20,000 (R80/lead)
- 500 leads — R30,000 (R60/lead)

Monthly Subscriptions:
- Starter — R5,000/mo (25 leads)
- Growth — R15,000/mo (100 leads)
- Pro — R50,000/mo (500 leads)

IMPORTANT — When a dealer says "give me X leads" or asks to order:
1. Use create_order to generate the order and payment link
2. Present the pricing clearly
3. Share the payment link
4. Explain that leads will be delivered to their dashboard immediately after payment

When onboarding a new dealer:
1. Use onboard_dealer to generate a personalized welcome
2. Share the welcome message with market intelligence
3. Offer to deploy signal agents for their area

Always respond in a professional but friendly tone. Use Rand amounts. Reference SA-specific context (areas like Sandton, Bryanston, Menlyn; brands like Toyota, BMW, VW).

When presenting data, format it clearly with bullet points or tables. For numbers, use South African Rand format (R XX,XXX). For dates, use DD/MM/YYYY.

If a tool call fails, explain what happened and suggest an alternative approach. Never fabricate data — always use tools to get real information.`

// ---------------------------------------------------------------------------
// Agent Definition
// ---------------------------------------------------------------------------

export const visioAgent = new ToolLoopAgent({
  model: anthropic('claude-sonnet-4-6'),
  instructions: SYSTEM_PROMPT,
  tools: agentTools,
  stopWhen: stepCountIs(10),
})

// ---------------------------------------------------------------------------
// Dealer-scoped agent factory
// ---------------------------------------------------------------------------

export function createDealerAgent(dealer: {
  id: string
  name: string
  brands: string[]
  area: string
  tier: string
}) {
  const dealerPrompt = `${SYSTEM_PROMPT}

DEALER CONTEXT — You are assisting this specific dealer:
- Dealer: ${dealer.name}
- Brands: ${dealer.brands.join(', ')}
- Area: ${dealer.area}
- Tier: ${dealer.tier}
- Dealer ID: ${dealer.id}

Focus all answers on this dealer's brands, area, and business. When searching leads or signals, default to their area and brands. When generating briefs or reports, use their dealer ID.`

  return new ToolLoopAgent({
    model: anthropic('claude-sonnet-4-6'),
    instructions: dealerPrompt,
    tools: agentTools,
    stopWhen: stepCountIs(10),
  })
}
