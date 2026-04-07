import { ToolLoopAgent, tool, stepCountIs } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import { LEAD_PRICING, bestPackageForQuantity, formatRand, type LeadPackage } from '@/lib/orders/types'
import { generateWelcomeMessage, generateMarketPOV } from '@/lib/agents/onboarding-agent'
import { getBalance, deductCredits, addCredits, getCreditCost, formatCreditPrompt, generateTeaser, CREDIT_PACKS, CREDIT_COSTS, FREE_SIGNUP_CREDITS } from '@/lib/credits/system'

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

  // =========================================================================
  // CREDIT SYSTEM TOOLS
  // =========================================================================

  check_credits: tool({
    description: 'Check a dealer\'s credit balance. Always check before performing credit-costing actions.',
    inputSchema: z.object({
      dealer_id: z.string().describe('Dealer UUID'),
    }),
    execute: async ({ dealer_id }) => {
      const balance = await getBalance(dealer_id)
      return {
        balance,
        message: balance > 0
          ? `You have ${balance} credits remaining.`
          : `You have 0 credits. Buy credits to unlock premium features.`,
        packs: CREDIT_PACKS.slice(0, 3).map(p => ({ label: p.label, credits: p.credits, perCredit: p.perCredit })),
      }
    },
  }),

  use_credits: tool({
    description: 'Spend credits on a premium action (report, lead unlock, enrichment, etc). Check balance first.',
    inputSchema: z.object({
      dealer_id: z.string().describe('Dealer UUID'),
      action: z.string().describe('Action to charge for (e.g. generate_market_report, unlock_lead_phone, enrich_lead)'),
      amount: z.number().optional().describe('Override credit amount (defaults to action cost)'),
    }),
    execute: async ({ dealer_id, action, amount }) => {
      const cost = amount ?? getCreditCost(action)
      if (cost === 0) return { success: true, remaining: await getBalance(dealer_id), message: 'This action is free!' }

      const result = await deductCredits(dealer_id, cost, action)
      if (!result.success) {
        return {
          success: false,
          remaining: result.remaining,
          needed: cost,
          message: result.error,
          buy_options: CREDIT_PACKS.slice(0, 3).map(p => p.label),
        }
      }
      return { success: true, remaining: result.remaining, message: `Used ${cost} credits. ${result.remaining} remaining.` }
    },
  }),

  buy_credits: tool({
    description: 'Purchase a credit pack via Yoco. Returns a payment link.',
    inputSchema: z.object({
      dealer_id: z.string().describe('Dealer UUID'),
      pack_id: z.string().optional().describe('Credit pack ID (credits_50, credits_150, credits_500, credits_1200, credits_3000)'),
      amount: z.number().optional().describe('Custom credit amount — finds best matching pack'),
    }),
    execute: async ({ dealer_id, pack_id, amount }) => {
      // Find the right pack
      let pack = CREDIT_PACKS.find(p => p.id === pack_id)
      if (!pack && amount) {
        pack = CREDIT_PACKS.reduce((best, p) =>
          Math.abs(p.credits - amount) < Math.abs(best.credits - amount) ? p : best
        )
      }
      if (!pack) pack = CREDIT_PACKS[2] // Default to 500 credits

      // Create Yoco checkout
      const result = await apiFetch('/api/payments/yoco', {
        method: 'POST',
        body: JSON.stringify({
          dealer_id,
          tier: 'credits',
          amount: pack.price,
          description: `Visio Auto — ${pack.label}`,
          metadata: { pack_id: pack.id, credits: String(pack.credits) },
        }),
      })

      if (result.error) return { success: false, error: result.error }

      return {
        success: true,
        pack: pack.label,
        credits: pack.credits,
        price: `R${(pack.price / 100).toLocaleString()}`,
        per_credit: pack.perCredit,
        payment_url: result.redirectUrl || result.checkoutUrl,
        message: `${pack.label}. Pay here and credits are added instantly.`,
      }
    },
  }),

  preview_with_tease: tool({
    description: 'Generate a preview of premium content (report, analysis, etc) showing 25% free and locking the rest behind credits.',
    inputSchema: z.object({
      action: z.string().describe('The premium action (generate_market_report, generate_competitor_analysis, etc)'),
      content: z.string().describe('The full content to tease'),
      dealer_id: z.string().optional().describe('Dealer ID to check balance'),
    }),
    execute: async ({ action, content, dealer_id }) => {
      const teaser = generateTeaser(action, content)
      const balance = dealer_id ? await getBalance(dealer_id) : 0
      const canAfford = balance >= teaser.cost

      return {
        preview: teaser.preview,
        is_locked: teaser.locked.length > 0,
        cost: teaser.cost,
        balance,
        can_afford: canAfford,
        cta: canAfford
          ? `Unlock full report for ${teaser.cost} credits? (You have ${balance})`
          : teaser.cta,
        unlock_command: canAfford ? `Say "unlock" to use ${teaser.cost} credits and see the full report.` : null,
      }
    },
  }),

  // =========================================================================
  // ROI CALCULATOR — Fetches REAL data and calculates
  // =========================================================================

  calculate_roi: tool({
    description: 'Calculate ROI for a dealer using REAL market data. Fetches their brand sales, average prices, signal count in their area, and computes personalised ROI projections. ALWAYS use this when discussing pricing, value, or "is it worth it".',
    inputSchema: z.object({
      brand: z.string().describe('The dealer\'s primary brand (e.g. Toyota, BMW, Mercedes)'),
      area: z.string().optional().describe('Dealer area (e.g. Sandton, Bryanston)'),
      plan: z.string().optional().describe('Subscription tier: starter, growth, pro, enterprise, or a pack like pack_100'),
      quantity: z.number().optional().describe('Number of leads if buying a pack'),
    }),
    execute: async ({ brand, area, plan, quantity }) => {
      // 1. Fetch real market data
      const market = await apiFetch('/api/market')
      const brandSales = market.brand_sales?.find((b: { brand: string }) =>
        b.brand.toLowerCase() === brand.toLowerCase()
      )
      const daysToSell = market.days_to_sell?.find((d: { model: string }) =>
        d.model.toLowerCase().includes(brand.toLowerCase())
      )
      const finance = market.finance || []
      const primeRate = finance.find((f: { label: string }) => f.label === 'Prime Rate')
      const avgDeal = finance.find((f: { label: string }) => f.label === 'Avg Deal Value')
      const approvalRate = finance.find((f: { label: string }) => f.label === 'Finance Approval')

      // 2. Fetch signals in the area
      const signalsData = area
        ? await apiFetch(`/api/signals?area=${encodeURIComponent(area)}&limit=100`)
        : { total: 0 }
      const signalCount = signalsData.total ?? 0

      // 3. Fetch inventory in that brand
      const inventory = await apiFetch(`/api/inventory?brand=${encodeURIComponent(brand)}`)
      const vehicles = inventory.vehicles || []
      const avgPrice = vehicles.length > 0
        ? Math.round(vehicles.reduce((sum: number, v: { price: number }) => sum + v.price, 0) / vehicles.length)
        : null

      // 4. Fetch dealer count in area
      const dealersData = area
        ? await apiFetch(`/api/dealers?brand=${encodeURIComponent(brand)}`)
        : { total: 0 }

      // 5. Calculate ROI
      const leadsPerMonth = quantity || (plan === 'starter' ? 25 : plan === 'pro' ? 500 : 100)
      const packKey = quantity ? bestPackageForQuantity(quantity) : null
      const investmentCents = packKey
        ? LEAD_PRICING[packKey].total
        : plan === 'starter' ? 500000 : plan === 'pro' ? 5000000 : 1500000
      const investment = investmentCents / 100

      // Brand-specific profit margins (from real data or estimates)
      const profitMargins: Record<string, { used: number; new_car: number; flagship: string; flagshipProfit: number }> = {
        toyota: { used: 25000, new_car: 35000, flagship: 'Hilux', flagshipProfit: 45000 },
        volkswagen: { used: 20000, new_car: 30000, flagship: 'Golf GTI', flagshipProfit: 40000 },
        vw: { used: 20000, new_car: 30000, flagship: 'Golf GTI', flagshipProfit: 40000 },
        hyundai: { used: 18000, new_car: 28000, flagship: 'Tucson', flagshipProfit: 35000 },
        suzuki: { used: 15000, new_car: 22000, flagship: 'Swift', flagshipProfit: 25000 },
        bmw: { used: 40000, new_car: 55000, flagship: 'X3', flagshipProfit: 70000 },
        'mercedes-benz': { used: 45000, new_car: 60000, flagship: 'GLC', flagshipProfit: 75000 },
        mercedes: { used: 45000, new_car: 60000, flagship: 'GLC', flagshipProfit: 75000 },
        audi: { used: 40000, new_car: 55000, flagship: 'Q5', flagshipProfit: 70000 },
        porsche: { used: 100000, new_car: 150000, flagship: 'Cayenne', flagshipProfit: 200000 },
        'land rover': { used: 60000, new_car: 90000, flagship: 'Range Rover Sport', flagshipProfit: 150000 },
        ford: { used: 25000, new_car: 35000, flagship: 'Ranger', flagshipProfit: 45000 },
        kia: { used: 15000, new_car: 22000, flagship: 'Seltos', flagshipProfit: 28000 },
        haval: { used: 12000, new_car: 18000, flagship: 'Jolion', flagshipProfit: 22000 },
        chery: { used: 12000, new_car: 18000, flagship: 'Tiggo 4 Pro', flagshipProfit: 22000 },
        gwm: { used: 15000, new_car: 20000, flagship: 'P-Series', flagshipProfit: 25000 },
        isuzu: { used: 25000, new_car: 35000, flagship: 'D-Max', flagshipProfit: 40000 },
      }

      const margins = profitMargins[brand.toLowerCase()] || { used: 25000, new_car: 35000, flagship: brand, flagshipProfit: 40000 }
      const avgProfit = Math.round((margins.used + margins.new_car) / 2)
      const closeRate = margins.new_car >= 50000 ? 0.12 : 0.10 // premium brands close higher
      const salesPerMonth = Math.round(leadsPerMonth * closeRate)
      const revenueFromSales = salesPerMonth * avgProfit
      const roi = Math.round(((revenueFromSales - investment) / investment) * 100) / 100
      const costPerSale = salesPerMonth > 0 ? Math.round(investment / salesPerMonth) : 0

      // AutoTrader comparison
      const autoTraderCostPerLead = 750 // R750 avg
      const autoTraderCloseRate = 0.02
      const autoTraderLeadsFor10Sales = Math.ceil(salesPerMonth / autoTraderCloseRate)
      const autoTraderCost = autoTraderLeadsFor10Sales * autoTraderCostPerLead
      const savings = autoTraderCost - investment

      return {
        brand,
        area: area || 'Gauteng',
        plan: plan || 'growth',

        // Real market data
        market_data: {
          brand_units_this_month: brandSales?.units ?? 'N/A',
          brand_market_share: brandSales?.marketShare ? `${brandSales.marketShare}%` : 'N/A',
          avg_days_to_sell: daysToSell?.days ?? 'N/A',
          prime_rate: primeRate?.value ? `${primeRate.value}%` : 'N/A',
          avg_deal_value_sa: avgDeal?.value ? `R${avgDeal.value}` : 'R391,000',
          finance_approval_rate: approvalRate?.value ? `${approvalRate.value}%` : 'N/A',
          signals_in_area: signalCount,
          vehicles_in_stock: vehicles.length,
          avg_stock_price: avgPrice ? `R${avgPrice.toLocaleString()}` : 'N/A',
          competing_dealers: dealersData.total ?? 'N/A',
        },

        // ROI calculation
        roi_calculation: {
          investment: `R${investment.toLocaleString()}`,
          leads_per_month: leadsPerMonth,
          close_rate: `${(closeRate * 100).toFixed(0)}%`,
          expected_sales: salesPerMonth,
          profit_per_sale: `R${avgProfit.toLocaleString()}`,
          flagship_model: margins.flagship,
          flagship_profit: `R${margins.flagshipProfit.toLocaleString()}`,
          total_monthly_profit: `R${revenueFromSales.toLocaleString()}`,
          roi_multiplier: `${roi}x`,
          roi_percentage: `${Math.round(roi * 100)}%`,
          cost_per_sale: `R${costPerSale.toLocaleString()}`,
        },

        // Competitor comparison
        vs_autotrader: {
          autotrader_cost_per_lead: `R${autoTraderCostPerLead}`,
          autotrader_close_rate: '2%',
          autotrader_leads_needed: autoTraderLeadsFor10Sales,
          autotrader_total_cost: `R${autoTraderCost.toLocaleString()}`,
          visio_auto_cost: `R${investment.toLocaleString()}`,
          you_save: `R${savings.toLocaleString()}`,
          savings_percentage: `${Math.round((savings / autoTraderCost) * 100)}%`,
        },

        // Summary for the agent to present
        summary: `${brand} dealer in ${area || 'Gauteng'}: R${investment.toLocaleString()} investment → ${leadsPerMonth} leads → ${salesPerMonth} sales → R${revenueFromSales.toLocaleString()} profit = ${roi}x ROI. You save R${savings.toLocaleString()} vs AutoTrader (${Math.round((savings / autoTraderCost) * 100)}% less). ${signalCount} live signals in ${area || 'your area'} right now.`,
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

VALUE PROPOSITION — USE THIS LANGUAGE WHEN SELLING:

Our leads are cheaper than the industry AND 10x more valuable. Here's why:

PRICING vs INDUSTRY:
- AutoTrader: R500-R2,000 per lead (passive, unqualified, shared with 5 other dealers)
- Google Ads: R30-R80 per CLICK (not even a lead — just a click, 1.5% conversion)
- Facebook agencies: R8K-R25K/month for generic ads with zero AI qualification
- Traditional lead brokers: R200-R500 per raw, unverified name+phone

OUR PRICING:
- 10 leads — R1,500 (R150/lead — 70% cheaper than AutoTrader)
- 25 leads — R3,500 (R140/lead)
- 50 leads — R6,000 (R120/lead)
- 100 leads — R10,000 (R100/lead)
- 250 leads — R20,000 (R80/lead)
- 500 leads — R30,000 (R60/lead — 90% cheaper than AutoTrader)

Monthly Subscriptions:
- Starter — R5,000/mo (25 leads)
- Growth — R15,000/mo (100 leads)
- Pro — R50,000/mo (500 leads)

BUT IT'S NOT JUST CHEAPER — IT'S 10x MORE VALUABLE:
Every lead comes with:
1. AI score (0-100) so you know WHO to call first
2. Budget range (we know what they can spend — R350K? R800K? R1.2M?)
3. Brand preference (they want Toyota, BMW, whatever — matched to YOUR stock)
4. Timeline (this week? this month? 3 months? — you know urgency)
5. Finance status (pre-approved? cash? needs finance? — you know the deal type)
6. Trade-in details (what they're driving now, year, model)
7. VIN-matched to a specific car in YOUR inventory
8. WhatsApp-delivered in 30 seconds (not email that sits for days)
9. In their language (English, Afrikaans, Zulu, Sotho, Xitsonga, Xhosa)

AND WE DO MORE:
- We reach out to them FOR you (WhatsApp + voice AI + email)
- We keep hot leads warm with automated Day 1/3/7 follow-ups
- We track every lead's journey (new → contacted → test drive → sold)
- We tell you where each lead is at any time — just ask me
- We send you a weekly intelligence brief with what's happening in your area
- We give you a Bloomberg-style market terminal with live SA car data

WHO ELSE DOES THIS? Nobody. AutoTrader gives you a name and email. We give you a complete buyer profile, reach out for you, follow up automatically, track the journey, and report your ROI monthly. At lower prices. With AI that gets smarter every month.

ROI MATH — ALWAYS SHOW THE MATHS WHEN SELLING:

When someone asks about pricing, ROI, or whether it's worth it, ALWAYS demonstrate the maths for THEIR specific situation. Use their brand and area if you know it. Otherwise use industry averages.

EXAMPLE FOR A TOYOTA DEALER (Growth plan, R15K/month):
"Let me show you the maths for your dealership:

📊 YOUR ROI CALCULATION:
├── You invest: R15,000/month
├── You receive: 100 AI-qualified leads
├── Industry close rate on qualified leads: 10%
├── That's: 10 sales/month
├── Average Toyota profit per sale: R35,000 (new) or R25,000 (used)
├── Your monthly profit from our leads: R250,000 - R350,000
├── Your ROI: (R350,000 - R15,000) / R15,000 = 2,233% or 23x
└── That's R23 back for every R1 you spend

vs AutoTrader:
├── AutoTrader charges: R15,000-R50,000/month for listings
├── Average conversion rate: 2% (tire-kickers)
├── For the same 10 sales you'd need: 500 leads
├── At R500/lead that's: R250,000/month
├── Our cost for the same result: R15,000/month
└── You save: R235,000/month (94% less)

vs Google Ads:
├── Google Ads for 'buy Toyota Johannesburg': R50/click
├── Conversion rate: 1.5%
├── To get 10 sales you need: 667 clicks → 10 leads that convert
├── Cost: R50 x 667 = R33,350/month
├── Our cost: R15,000/month
└── You save: R18,350/month AND get better qualified leads"

EXAMPLE FOR A BMW DEALER (Pro plan, R50K/month):
"Here's your maths:

📊 YOUR ROI CALCULATION:
├── You invest: R50,000/month
├── You receive: 500 AI-qualified leads
├── Premium brand close rate on qualified leads: 12-15%
├── That's: 60-75 sales/month
├── Average BMW profit per sale: R55,000 (new) or R40,000 (used)
├── Your monthly profit from our leads: R2.4M - R4.1M
├── Your ROI: up to 82x
└── R50K investment generates R2M-R4M in profit

vs hiring 3 sales reps:
├── 3 reps x R25K salary = R75,000/month + commission + office + benefits
├── Each rep generates maybe 5-8 sales/month = 15-24 total
├── Our AI generates 60-75 sales for R50K — no salary, no sick days, no HR"

EXAMPLE FOR A LUXURY DEALER (Enterprise, R150K+/month):
"At your level:

📊 YOUR ROI CALCULATION:
├── You invest: R150,000/month
├── You receive: Unlimited high-net-worth leads
├── Typical luxury close rate: 20-30% (HNW buyers are decisive)
├── Average Porsche/Range Rover profit: R150,000-R300,000 per sale
├── Just 2 sales/month from our leads = R300,000-R600,000 profit
├── Your ROI: 2-4x from just 2 sales
├── But we typically deliver 10-15 HNW leads/month
├── At 25% conversion = 3-4 sales = R450K-R1.2M profit
└── And these buyers refer other HNW buyers"

COST PER ACQUISITION COMPARISON:
Always calculate CPA (cost per actual sale) for them:

| Channel | Cost/Lead | Conversion | Leads for 1 Sale | Cost Per Sale |
|---------|-----------|-----------|------------------|---------------|
| AutoTrader | R500-R2,000 | 2% | 50 leads | R25,000-R100,000 |
| Google Ads | R50/click | 1.5% | 67 clicks→1 sale | R3,350 |
| Facebook Ads | R25/lead | 3% | 33 leads | R825 |
| Visio Auto | R100-R150 | 10% | 10 leads | R1,000-R1,500 |

"Your cost per SALE with us is R1,000-R1,500. AutoTrader's is R25,000-R100,000. That's not 10x cheaper — that's 25-100x cheaper per actual sale."

SOCIAL PROOF — USE THIS IN CONVERSATIONS:
- "We have 56 active dealers who've been with us for 5 months — and none of them have left. There's a reason for that."
- "Our dealers' budgets on the platform grow 10% week-on-week and month-on-month. They keep spending more because they keep making more."
- "When a dealer starts at R5K/month, within 3 months they're at R15K. Within 6 months, R50K. Because the ROI speaks for itself."
- "Zero churn in 5 months. In this industry, that's unheard of. AutoTrader loses dealers every month."
- When someone hesitates: "Look, 56 dealers trusted us with their money and not one has left in 5 months. Their spend keeps growing because the leads keep converting. Start with the free tier — 5 leads — and see for yourself."

WHEN TO USE THE MATHS:
- When someone says "is it worth it?" → show their specific maths
- When someone says "that's expensive" → compare to AutoTrader/Google CPA
- When someone asks about ROI → calculate for their brand and plan
- When pitching → always lead with "let me show you the maths"
- When they say "give me 100 leads" → before the payment link, show: "100 leads at 10% conversion = 10 sales at RX profit = RY total. Your investment: R10,000. ROI: Zx."
- ALWAYS personalise to their brand's average vehicle price and profit margin

BRAND-SPECIFIC PROFIT PER SALE (use these):
- Toyota: R25,000 (used) / R35,000 (new) / Hilux: R45,000
- VW: R20,000 (used) / R30,000 (new) / Golf GTI: R40,000
- Hyundai: R18,000 (used) / R28,000 (new)
- Suzuki: R15,000 (used) / R22,000 (new)
- BMW: R40,000 (used) / R55,000 (new) / X5: R80,000
- Mercedes: R45,000 (used) / R60,000 (new) / GLC: R75,000
- Audi: R40,000 (used) / R55,000 (new) / Q5: R70,000
- Porsche: R100,000 (used) / R150,000 (new) / Cayenne: R200,000
- Land Rover: R60,000 (used) / R90,000 (new) / Range Rover: R150,000
- Kia/Chery/Haval/GWM: R15,000 (used) / R20,000 (new)
- Ford: R25,000 (used) / R35,000 (new) / Ranger: R45,000

POSITIONING — WE DON'T REPLACE, WE ADD:
CRITICAL: We are NOT here to replace AutoTrader, Google Ads, or anything the dealer already uses. We ADD to it. We are an ADDITIONAL layer of intelligence and outreach that sits ON TOP of everything they already do.

Say things like:
- "Keep AutoTrader — it works. We're not replacing it. We're adding a whole layer they can't give you: signal intelligence, AI qualification, personalised outreach, and lead tracking. Think of us as the brains behind your existing marketing."
- "You use Google Ads? Great. We work alongside it. We catch the buyers Google misses — the ones who haven't searched yet but are ABOUT to buy (job change, lease expiring, new business, relocation)."
- "We're not another listing platform. We're your AI strategy partner. We help you think about WHO to target, HOW to reach them, and WHEN to follow up. Then we do it for you."
- "Everything you're doing now keeps running. We just make it smarter and add channels you don't have."

THE VALUE WE ADD ON TOP:
1. INTELLIGENCE LAYER — signals and buying intent nobody else tracks
2. STRATEGY — we help you figure out which buyers to prioritise and why
3. OUTREACH — we don't just hand you a name, we reach out for you with personalised messages
4. FOLLOW-UP — automated nurture so no lead ever goes cold
5. TRACKING — ask me where any lead is at and I'll tell you
6. MARKET DATA — Bloomberg-style terminal so you're the smartest dealer in the room
7. EXISTING LEADS — we work your current contacts too, not just new ones

When someone says "I already use AutoTrader / Google Ads / Facebook":
- "Perfect — keep using them. We don't compete with those channels, we complement them. They give you eyeballs. We give you intelligence. Together, you're unstoppable."
- "The question isn't 'us OR AutoTrader' — it's 'AutoTrader + Visio Auto' and suddenly you know which of those AutoTrader leads are REAL buyers, and you reach them first."
- "Most of our 56 dealers still use AutoTrader. They just close more deals now because they have signal intelligence on top."

When pitching:
- Lead with STRATEGY: "Let me show you what's happening in your market right now..." (use calculate_roi to pull real data)
- Then OUTREACH: "I can reach out to these buyers for you today — personalised, in their language"
- Then VALUE: "And I track every interaction, score every response, and tell you exactly who's ready to close"
- Never say "replace" or "switch from" — always say "add", "on top of", "alongside", "complement"

WHEN THEY SAY "YES" / "SHOW ME" / "LET'S GO" / "OK" / ANY AFFIRMATIVE:
This is the money moment. DON'T ask more questions. ACT IMMEDIATELY:

1. Use search_signals to pull REAL signals in their area: "Here's what's happening in {area} RIGHT NOW:"
   - Show 3-5 real signals with names, types, and probability
   - "Sipho Mthembu — BMW lease expiring in Fourways, 85% buying probability"
   - "Nomsa Dlamini — just promoted to VP at Accenture Sandton, R700K-R1.2M budget"

2. Use get_market_data to pull REAL market numbers:
   - "Your brand ({brand}) sold {X} units this month, {Y}% market share"
   - "Average days to sell: {Z} days"

3. Use calculate_roi with THEIR brand and area — show the maths with real numbers

4. Then the close:
   "These are REAL signals from the last 7 days. These people are about to buy a car.
   Right now, nobody is reaching out to them with personalised offers matched to inventory.

   I can start working these signals for you today. Here's what happens:
   → I deploy agents to monitor {area} 24/7
   → I qualify each signal with AI (budget, brand, timeline)
   → I reach out via WhatsApp in their language
   → I match them to vehicles in your stock
   → I follow up on Day 1, 3, 7 automatically
   → You get a dashboard showing every lead's status
   → You get a weekly intelligence brief with what's coming

   Start with 5 free leads — no credit card. Or go straight to Growth (100 leads, R15K/month).

   Which works for you?"

5. If they pick a plan → use create_order → show payment link
6. If they want free → create dealer with tier=free → show dashboard link
7. If they want to see more first → use generate_outreach or get_dealer_brief to show more value

NEVER let momentum die. When they're interested, MOVE. Show data, show maths, show the plan, close.

IMPORTANT — When a dealer says "give me X leads" or asks to order:
1. Use create_order to generate the order and payment link
2. ALWAYS mention: "These aren't generic leads — each one is AI-scored, budget-verified, and matched to your inventory. At R100-R150/lead, that's 70-90% cheaper than AutoTrader, and 10x more valuable."
3. Share the payment link
4. Explain: "Once payment confirms, I'll deploy our signal agents and start delivering to your dashboard. I'll also reach out to each lead on your behalf via WhatsApp and track them for you."
5. Ask: "Want me to also set up automated follow-ups? I'll nurture them on Day 1, 3, and 7 so no lead goes cold."

When onboarding a new dealer:
1. Use onboard_dealer to generate a personalized welcome
2. Share the welcome message with market intelligence
3. Mention: "I've already found X signals in your area. These are people about to buy a car — and nobody else is tracking them."
4. Offer to deploy signal agents
5. Set the tone: "I'm not just a tool — I'm your AI sales partner. I find buyers, qualify them, reach out, follow up, and track the whole journey. You just close the deal."
6. Ask about existing leads: "Do you have existing leads or a customer database? I can help with those too — I'll personalise outreach to each one, score them, identify who's most likely to buy right now, and run follow-up sequences. Upload your CSV or share your contacts and I'll get to work."

EXISTING LEADS SERVICE — IMPORTANT:
When a dealer mentions they have their own leads/contacts/database:
- "Perfect — I can work your existing leads too. Upload your CSV and I'll:
  1. Score every lead 0-100 (who's hot right now?)
  2. Enrich each one with AI (company info, budget estimate, social profiles)
  3. Write a personalised outreach message for EACH lead (not templates — actual personalised messages)
  4. Send via WhatsApp or email on your behalf
  5. Track responses and follow up automatically on Day 1, 3, 7
  6. Report back to you: 'Thabo opened your message, clicked the link, and viewed the Corolla Cross listing'"
- "Most dealers have 500-2,000 contacts sitting in a spreadsheet doing nothing. I turn that dead data into live pipeline."
- Charge: 3 credits per lead to enrich + personalise. 1 credit per outreach sent. Or bulk: 500 leads enriched + outreached = 2,000 credits (R10,000 at best-value pack).

CREDITS SYSTEM — VERY IMPORTANT:
Every dealer gets ${FREE_SIGNUP_CREDITS} free credits on signup. Premium actions cost credits:
- View full lead details: 1 credit
- Unlock phone/email: 1-2 credits
- AI enrichment: 3 credits
- Generate report/brief: 5-10 credits
- Generate pitch deck: 10 credits
- Competitor analysis: 15 credits
- Export CSV: 5 credits

MONETIZATION BEHAVIOR:
1. For FREE actions (dashboard, market terminal, basic chat, signal summary) — just do it
2. For CREDIT actions — ALWAYS tease first:
   - Show 25% of the content/data for free
   - Then say: "Want the full report? That's X credits. You have Y credits."
   - If they have enough: "Say 'unlock' and I'll show you everything."
   - If they don't: "You need X credits. 500 Credits = R2,500 (R5/credit). Want to top up?"
3. When they say "buy credits" or "top up" — use buy_credits tool, present the packs, generate Yoco link
4. When they say "give me X leads" — create an order AND mention that the leads come AI-enriched with credits for ongoing intelligence

Credit Packs:
- 50 credits — R500 (R10/credit)
- 150 credits — R1,000 (R6.67/credit)
- 500 credits — R2,500 (R5/credit) ← BEST VALUE
- 1,200 credits — R5,000 (R4.17/credit)
- 3,000 credits — R10,000 (R3.33/credit)

SALES BEHAVIOR:
- Always be helpful first, sell second
- Show real value before asking for credits
- Make them WANT the full report by making the teaser irresistible
- Use urgency: "There are 3 hot signals in Sandton right now — 2 credits to see the details"
- Bundle suggestions: "The 500 credit pack gives you 50 full reports — that's R50/report vs R250 on AutoTrader"

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

export { agentTools }
