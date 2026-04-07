import { ToolLoopAgent, tool, stepCountIs } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { agentTools } from '@/lib/agents/visio-agent'
import { SUITE, SUITE_BY_KEY, SUITE_META, recommendProduct } from '@/lib/suite'
import {
  CATALOG,
  CATALOG_BY_SKU,
  catalogForProduct,
  catalogByFamily,
  formatPrice,
  type CatalogFamily,
} from '@/lib/commerce/catalog'
import {
  createOrder as createCommerceOrder,
  createSubscription as createCommerceSubscription,
  attachYocoCheckoutToOrder as attachYocoToOrder,
  attachYocoCheckoutToSubscription as attachYocoToSub,
  getEntitlementsForEmail,
} from '@/lib/commerce/db'
import { createCheckout as createYocoCheckout } from '@/lib/payments/yoco'

// =============================================================================
// Jess — SA Car Expert Agent for Visio Auto
// Hyper-conversational, action-taking. Extends visioAgent's 22 tools with 6 more.
// =============================================================================

// ---------------------------------------------------------------------------
// Visio Auto positioning — the 7 SA data gaps
// ---------------------------------------------------------------------------

const VISIO_AUTO_GAPS = [
  {
    key: 'conversion',
    gap: 'Real-time dealer-level conversion data',
    our_advantage:
      'We track every lead → reply → showroom visit → sale across our dealer network. Nobody else has this — Lightstone/TransUnion are pricing-only.',
  },
  {
    key: 'signals',
    gap: 'Buying-signal detection (life events, intent feeds)',
    our_advantage:
      "Visio Auto's signal engine watches 38+ signal types: job changes, marriage, relocation, finance approvals, social posts. Approximately zero competitors do this in SA.",
  },
  {
    key: 'valuation',
    gap: 'Consumer-facing instant valuation',
    our_advantage:
      'Lightstone is locked behind dealer logins. We give buyers instant trade-in values directly — bypassing the gatekeepers.',
  },
  {
    key: 'sentiment',
    gap: 'Social sentiment per brand/model',
    our_advantage:
      'We aggregate Twitter/X, TikTok and forums into per-model sentiment scores. Useful for both buyers (avoid lemons) and dealers (stock decisions).',
  },
  {
    key: 'finance',
    gap: 'Cross-bank approval rates by segment',
    our_advantage:
      "Anonymous aggregated finance application data — we can tell a buyer 'roughly 7 in 10 buyers in your income bracket get approved for this car at WesBank.'",
  },
  {
    key: 'insurance',
    gap: 'Insurance premium discovery',
    our_advantage:
      'Each insurer is locked, but we route quote requests across multiple insurers and surface the best — not the first.',
  },
  {
    key: 'service_history',
    gap: 'Service history per VIN',
    our_advantage:
      'Fragmented across DMSes today. Our roadmap: VIN-keyed service log aggregator. Even partial coverage beats nothing.',
  },
] as const

type GapKey = (typeof VISIO_AUTO_GAPS)[number]['key']

// ---------------------------------------------------------------------------
// Jess extra tools (6) — extending the 22 from visio-agent
// ---------------------------------------------------------------------------

const jessExtraTools = {
  get_market_stat: tool({
    description:
      'Look up an SA auto market statistic (NAAMSA, Lightstone, NaTIS, RTMC, AA, StatsSA) from the jess_facts table. Always returns approximate values with source attribution.',
    inputSchema: z.object({
      metric: z.string().describe("e.g. 'new_vehicle_sales', 'avg_price', 'market_share'"),
      dimension: z.string().optional().describe("Optional dimension like 'Toyota Hilux' or 'Gauteng'"),
    }),
    execute: async ({ metric, dimension }) => {
      try {
        const supabase = await createClient()
        let q = supabase
          .from('jess_facts')
          .select('*')
          .ilike('metric', `%${metric}%`)
          .order('fetched_at', { ascending: false })
          .limit(1)
        if (dimension) q = q.ilike('dimension', `%${dimension}%`)
        const { data, error } = await q
        if (error) return { error: error.message }
        if (!data || data.length === 0)
          return { error: 'No matching stat. Tell the user you do not have current data on that.' }
        return { stat: data[0], hedge: 'approximately' }
      } catch (e) {
        return { error: (e as Error).message }
      }
    },
  }),

  search_knowledge: tool({
    description:
      'Search the Jess knowledge base (jess_chunks) for passages matching a query. Use this when the user asks about SA auto industry, regulations, brands, history, or anything beyond live listings.',
    inputSchema: z.object({
      query: z.string(),
      source_ids: z.array(z.string()).optional(),
      limit: z.number().optional(),
    }),
    execute: async ({ query, source_ids, limit }) => {
      try {
        const supabase = await createClient()
        let q = supabase
          .from('jess_chunks')
          .select('id, source_id, content')
          .ilike('content', `%${query}%`)
          .limit(limit ?? 5)
        if (source_ids && source_ids.length > 0) q = q.in('source_id', source_ids)
        const { data, error } = await q
        if (error) return { error: error.message }
        return { passages: data ?? [] }
      } catch (e) {
        return { error: (e as Error).message }
      }
    },
  }),

  book_test_drive: tool({
    description:
      'Book a test drive for a lead at a dealer. Creates a jess_tasks row. Always confirm details with the user first.',
    inputSchema: z.object({
      lead_id: z.string(),
      dealer_id: z.string(),
      vehicle: z.string().describe('e.g. "2023 Toyota Hilux 2.8 GD-6"'),
      date: z.string().describe('YYYY-MM-DD'),
      time: z.string().describe('HH:MM (24h)'),
    }),
    execute: async (input) => {
      try {
        const supabase = await createClient()
        const { data, error } = await supabase
          .from('jess_tasks')
          .insert({
            kind: 'followup',
            lead_id: input.lead_id,
            run_at: new Date(`${input.date}T${input.time}:00`).toISOString(),
            payload: {
              kind: 'test_drive',
              dealer_id: input.dealer_id,
              vehicle: input.vehicle,
            },
          })
          .select()
          .single()
        if (error) return { error: error.message }
        return { ok: true, task: data, message: `Test drive booked for ${input.vehicle} on ${input.date} at ${input.time}.` }
      } catch (e) {
        return { error: (e as Error).message }
      }
    },
  }),

  schedule_followup: tool({
    description:
      'Schedule a follow-up reminder for a lead. Use when a buyer says "remind me next week" or when a dealer wants to chase a warm lead.',
    inputSchema: z.object({
      lead_id: z.string(),
      when_iso: z.string().describe('ISO timestamp when the reminder should fire'),
      note: z.string(),
    }),
    execute: async ({ lead_id, when_iso, note }) => {
      try {
        const supabase = await createClient()
        const { data, error } = await supabase
          .from('jess_tasks')
          .insert({
            kind: 'reminder',
            lead_id,
            run_at: when_iso,
            payload: { note },
          })
          .select()
          .single()
        if (error) return { error: error.message }
        return { ok: true, task: data }
      } catch (e) {
        return { error: (e as Error).message }
      }
    },
  }),

  qualify_with_funnel: tool({
    description:
      'Score and qualify a lead 0-100 based on profile completeness and intent. Writes qual_score, funnel_grade (A/B/C/D), and intent_tier (hot/warm/cold/dead) back to the lead.',
    inputSchema: z.object({ lead_id: z.string() }),
    execute: async ({ lead_id }) => {
      try {
        const supabase = await createClient()
        const { data: lead, error: fetchErr } = await supabase
          .from('leads')
          .select('*')
          .eq('id', lead_id)
          .single()
        if (fetchErr || !lead) return { error: fetchErr?.message ?? 'Lead not found' }

        let score = 0
        if (lead.email) score += 20
        if (lead.phone) score += 20
        if (lead.name) score += 10
        if (lead.company) score += 10
        if (lead.role) score += 10
        if (lead.preferred_brand) score += 10
        if (lead.budget_min || lead.budget_max) score += 10
        if (lead.timeline) score += 10

        const grade = score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D'
        const tier = score >= 80 ? 'hot' : score >= 60 ? 'warm' : score >= 40 ? 'cold' : 'dead'

        const { error: updErr } = await supabase
          .from('leads')
          .update({ qual_score: score, funnel_grade: grade, intent_tier: tier })
          .eq('id', lead_id)
        if (updErr) return { error: updErr.message }

        return { ok: true, lead_id, qual_score: score, funnel_grade: grade, intent_tier: tier }
      } catch (e) {
        return { error: (e as Error).message }
      }
    },
  }),

  get_visio_auto_pitch: tool({
    description:
      'Get the Visio Auto positioning pitch. Pass an angle (conversion, signals, valuation, sentiment, finance, insurance, service_history) to focus on one gap, or omit for the full 7-gap pitch.',
    inputSchema: z.object({
      angle: z
        .enum([
          'conversion',
          'signals',
          'valuation',
          'sentiment',
          'finance',
          'insurance',
          'service_history',
        ])
        .optional(),
    }),
    execute: async ({ angle }) => {
      if (angle) {
        const g = VISIO_AUTO_GAPS.find((x) => x.key === (angle as GapKey))
        return g ? { focus: g } : { error: 'unknown angle' }
      }
      return { gaps: VISIO_AUTO_GAPS }
    },
  }),

  // ──────────────────────────────────────────────────────────────────
  // Visio Auto Suite — sibling product routing
  // (added 2026-04-07 when the 6 sub-products went live)
  // ──────────────────────────────────────────────────────────────────

  recommend_suite_product: tool({
    description:
      'CRITICAL: When a user describes a buying or selling situation, call this to get the right Visio Auto Suite sibling product (Approve, Inspect, BDC, Intent, Open Finance, Trust). Returns the product, its live URL, paper, and the reason it fits. Always use this rather than guessing which product to recommend.',
    inputSchema: z.object({
      situation: z
        .string()
        .describe(
          "What the user wants to do, e.g. 'I want to know if I will get approved for a R450k Hilux', 'I'm a freelancer with no credit history', 'I need to inspect this private-seller bakkie', 'I'm a dealer who wants WhatsApp lead routing', 'I'm an OEM marketing team'"
        ),
    }),
    execute: async ({ situation }) => {
      const match = recommendProduct(situation)
      if (!match) {
        return {
          recommendation: null,
          fallback:
            'No specific suite product matched. Recommend the full Visio Auto Suite at /papers/suite-overview.',
        }
      }
      return {
        recommendation: {
          product: match.product.name,
          tagline: match.product.tagline,
          role: match.product.role,
          live_url: match.product.liveUrl,
          paper_url: match.product.paperUrl,
          paper_number: match.product.paperNumber,
          revenue_target: match.product.revenueTarget,
          when_to_use: match.product.whenToUse,
          integration: match.product.integration,
        },
        reason: match.reason,
        suggested_response: `Try ${match.product.name} — ${match.product.tagline} (${match.product.liveUrl}). ${match.reason}`,
      }
    },
  }),

  list_suite_products: tool({
    description:
      'List all 6 Visio Auto Suite sibling products with their live URLs, papers, and revenue targets. Use when the user asks "what products do you have?" or "show me everything Visio Auto can do".',
    inputSchema: z.object({}),
    execute: async () => {
      return {
        suite_total: SUITE.length,
        year_two_target: SUITE_META.totalAnnualRevenueTarget,
        unifying_ledger: SUITE_META.unifyingLedger,
        legal_posture: SUITE_META.legalPosture,
        products: SUITE.map((p) => ({
          name: p.name,
          tagline: p.tagline,
          role: p.role,
          live_url: p.liveUrl,
          paper_url: p.paperUrl,
          paper_number: p.paperNumber,
          revenue_target: p.revenueTarget,
          when_to_use: p.whenToUse,
        })),
      }
    },
  }),

  get_suite_product: tool({
    description:
      'Get full details about a specific Visio Auto Suite sibling product by key (approve, inspect, bdc, intent, open-finance, trust). Returns the live URL, paper, integration details, and full description.',
    inputSchema: z.object({
      key: z.enum([
        'approve',
        'inspect',
        'bdc',
        'intent',
        'open-finance',
        'trust',
      ]),
    }),
    execute: async ({ key }) => {
      const product = SUITE_BY_KEY[key]
      return { product }
    },
  }),

  // ──────────────────────────────────────────────────────────────────
  // COMMERCE — Jess can sell. Lists catalog, creates orders, starts
  // subscriptions, returns Yoco checkout links inline in chat.
  // ──────────────────────────────────────────────────────────────────

  list_commerce_catalog: tool({
    description:
      'List all purchasable Visio Auto Suite SKUs from the commerce catalog. Filter by family (subscription | one_off | custom) or product (approve | inspect | bdc | intent | open-finance | trust | leads | concierge). Use this when a user asks "what can I buy?" or "show me your pricing".',
    inputSchema: z.object({
      family: z.enum(['subscription', 'one_off', 'custom']).optional(),
      product: z
        .enum([
          'approve',
          'inspect',
          'bdc',
          'intent',
          'open-finance',
          'trust',
          'leads',
          'concierge',
        ])
        .optional(),
    }),
    execute: async ({ family, product }) => {
      let items = [...CATALOG]
      if (family) items = catalogByFamily(family as CatalogFamily)
      if (product) items = catalogForProduct(product as never)
      return {
        total: items.length,
        items: items.map((c) => ({
          sku: c.sku,
          family: c.family,
          product: c.product,
          tier: c.tier ?? null,
          label: c.label,
          price: formatPrice(c),
          amount_cents: c.amountCents,
          short_description: c.shortDescription,
          value_hook: c.valueHook,
          self_serve: c.selfServe,
          grants: c.grants,
        })),
      }
    },
  }),

  explain_product_value: tool({
    description:
      'Pitch the value of a specific catalog SKU or suite product. Returns the value hook, what is included, the ROI math (where applicable), and a suggested closing question. Use this when a user is evaluating a product and you need to sell them on the value.',
    inputSchema: z.object({
      sku: z
        .string()
        .optional()
        .describe(
          "Specific SKU like 'bdc-pro' or 'trust-velocity'. If omitted, pass product_key instead."
        ),
      product_key: z
        .enum([
          'approve',
          'inspect',
          'bdc',
          'intent',
          'open-finance',
          'trust',
        ])
        .optional(),
    }),
    execute: async ({ sku, product_key }) => {
      if (sku) {
        const item = CATALOG_BY_SKU[sku]
        if (!item) return { error: `Unknown SKU: ${sku}` }
        return {
          sku: item.sku,
          label: item.label,
          price: formatPrice(item),
          value_hook: item.valueHook,
          long_description: item.longDescription,
          includes: item.includes,
          self_serve: item.selfServe,
          suggested_close:
            item.family === 'subscription'
              ? `Want me to start your ${item.label} subscription right now? I can have a payment link in your hand in 10 seconds.`
              : item.family === 'one_off'
                ? `Want me to create the order? You'll get a Yoco link to pay immediately.`
                : `This is a quote-only engagement. Want me to flag the concierge desk to call you?`,
        }
      }
      if (product_key) {
        const product = SUITE_BY_KEY[product_key]
        const skus = catalogForProduct(product_key as never)
        return {
          product: product.name,
          tagline: product.tagline,
          role: product.role,
          when_to_use: product.whenToUse,
          revenue_target_disclaimer:
            "This is the year-2 target, not realised revenue.",
          available_skus: skus.map((s) => ({
            sku: s.sku,
            label: s.label,
            price: formatPrice(s),
            value_hook: s.valueHook,
          })),
          suggested_close:
            "Which tier sounds right for your operation? I can start the order the moment you say yes.",
        }
      }
      return { error: 'Pass either sku or product_key' }
    },
  }),

  start_commerce_subscription: tool({
    description:
      'Start a recurring subscription for a Visio Auto Suite SKU. Creates the subscription row + a Yoco checkout. Returns the checkout URL the user can click to pay. Use this when a user has confirmed they want to subscribe — always confirm the SKU and email first, then call this. CRITICAL: only call after the user has explicitly confirmed they want to buy.',
    inputSchema: z.object({
      sku: z.string().describe("e.g. 'bdc-pro', 'trust-velocity', 'intent-growth'"),
      buyer_email: z.string().email(),
      buyer_name: z.string().optional(),
      buyer_phone: z.string().optional(),
      dealer_id: z.string().optional(),
    }),
    execute: async (input) => {
      const item = CATALOG_BY_SKU[input.sku]
      if (!item) return { error: `Unknown SKU: ${input.sku}` }
      if (item.family !== 'subscription') {
        return {
          error: `${input.sku} is family=${item.family}, not subscription. Use create_commerce_order instead.`,
        }
      }
      if (!item.selfServe) {
        return {
          error: `${input.sku} is quote-only. Tell the user to contact concierge@visiocorp.co.`,
          contact: 'concierge@visiocorp.co',
        }
      }

      const subResult = await createCommerceSubscription({
        buyer_email: input.buyer_email,
        buyer_name: input.buyer_name,
        buyer_phone: input.buyer_phone,
        dealer_id: input.dealer_id,
        sku: input.sku,
        data_source: 'jess_chat',
        source_metadata: { agent: 'jess', tool: 'start_commerce_subscription' },
      })
      if (subResult.error || !subResult.subscription) {
        return { error: subResult.error ?? 'Failed to create subscription' }
      }

      const sub = subResult.subscription
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ?? 'https://visio-auto.vercel.app'

      try {
        const checkout = await createYocoCheckout({
          amountInCents: sub.amount_cents,
          description: `${item.label} — first month (${sub.subscription_number})`,
          successUrl: `${baseUrl}/shop/success?subscription=${sub.subscription_number}`,
          cancelUrl: `${baseUrl}/shop?cancelled=${sub.subscription_number}`,
          metadata: {
            kind: 'commerce_subscription',
            subscription_id: sub.id,
            subscription_number: sub.subscription_number,
            sku: sub.sku,
            buyer_email: sub.buyer_email,
          },
        })
        await attachYocoToSub(sub.id, checkout.id)
        return {
          ok: true,
          subscription_number: sub.subscription_number,
          sku: sub.sku,
          first_payment_zar: sub.amount_cents / 100,
          checkout_url: checkout.redirectUrl,
          grants_on_payment: item.grants,
          message: `Subscription ${sub.subscription_number} created. Send the user this checkout link: ${checkout.redirectUrl}. The webhook will activate the subscription and grant ${item.grants.join(', ')} when payment succeeds.`,
        }
      } catch (e) {
        return {
          error: 'Yoco checkout creation failed',
          details: (e as Error).message,
          subscription_number: sub.subscription_number,
        }
      }
    },
  }),

  create_commerce_order: tool({
    description:
      'Create a one-off commerce order (Inspect report, Open Finance audit PDF, lead pack, etc.). Creates the order row + Yoco checkout. Returns the checkout URL. Use for any non-subscription SKU. CRITICAL: only call after the user has explicitly confirmed they want to buy.',
    inputSchema: z.object({
      buyer_email: z.string().email(),
      buyer_name: z.string().optional(),
      buyer_phone: z.string().optional(),
      dealer_id: z.string().optional(),
      items: z
        .array(
          z.object({
            sku: z.string(),
            quantity: z.number().int().positive().optional(),
          })
        )
        .min(1),
      buyer_notes: z.string().optional(),
    }),
    execute: async (input) => {
      // Validate every SKU is one-off (not subscription, not custom)
      for (const it of input.items) {
        const item = CATALOG_BY_SKU[it.sku]
        if (!item) return { error: `Unknown SKU: ${it.sku}` }
        if (item.family === 'subscription') {
          return {
            error: `${it.sku} is a subscription. Use start_commerce_subscription instead.`,
          }
        }
        if (item.family === 'custom') {
          return {
            error: `${it.sku} is quote-only. Tell the user to contact concierge@visiocorp.co.`,
            contact: 'concierge@visiocorp.co',
          }
        }
      }

      let orderResult
      try {
        orderResult = await createCommerceOrder({
          buyer_email: input.buyer_email,
          buyer_name: input.buyer_name,
          buyer_phone: input.buyer_phone,
          dealer_id: input.dealer_id,
          items: input.items,
          data_source: 'jess_chat',
          source_metadata: { agent: 'jess', tool: 'create_commerce_order' },
          buyer_notes: input.buyer_notes,
        })
      } catch (e) {
        return { error: (e as Error).message }
      }

      if (orderResult.error || !orderResult.order) {
        return { error: orderResult.error ?? 'Failed to create order' }
      }

      const order = orderResult.order
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ?? 'https://visio-auto.vercel.app'

      try {
        const checkout = await createYocoCheckout({
          amountInCents: order.total_cents,
          description: `Visio Auto — Order ${order.order_number}`,
          successUrl: `${baseUrl}/shop/success?order=${order.order_number}`,
          cancelUrl: `${baseUrl}/shop?cancelled=${order.order_number}`,
          metadata: {
            kind: 'commerce_order',
            order_id: order.id,
            order_number: order.order_number,
            buyer_email: order.buyer_email,
          },
        })
        await attachYocoToOrder(order.id, checkout.id)
        return {
          ok: true,
          order_number: order.order_number,
          total_zar: order.total_cents / 100,
          checkout_url: checkout.redirectUrl,
          message: `Order ${order.order_number} created for R${(order.total_cents / 100).toLocaleString('en-ZA')}. Send the user this checkout link: ${checkout.redirectUrl}.`,
        }
      } catch (e) {
        return {
          error: 'Yoco checkout creation failed',
          details: (e as Error).message,
          order_number: order.order_number,
        }
      }
    },
  }),

  check_user_entitlements: tool({
    description:
      'Check what Visio Auto Suite products and tiers a user has access to. Use to confirm a current customer before talking pricing, or to upsell a free user to a paid tier.',
    inputSchema: z.object({
      email: z.string().email(),
    }),
    execute: async ({ email }) => {
      const ents = await getEntitlementsForEmail(email)
      const has: Record<string, boolean> = {}
      const tiers: Record<string, string | null> = {}
      for (const e of ents) {
        has[e.product_key] = true
        if (e.tier && !tiers[e.product_key]) tiers[e.product_key] = e.tier
      }
      return {
        email: email.toLowerCase(),
        is_customer: ents.length > 0,
        entitlement_count: ents.length,
        has,
        tiers,
        all_entitlements: ents.map((e) => ({
          key: e.entitlement_key,
          product: e.product_key,
          tier: e.tier,
          granted_at: e.granted_at,
          expires_at: e.expires_at,
        })),
      }
    },
  }),

  send_concierge_quote_request: tool({
    description:
      'Flag a custom (quote-only) engagement to the concierge desk for follow-up. Use for Visio Concierge UHNW African luxury, Visio Intent OEM bespoke partnerships, or any non-self-serve SKU. Records the request in jess_tasks.',
    inputSchema: z.object({
      sku: z.string().describe("e.g. 'concierge-engagement', 'intent-oem-bespoke'"),
      buyer_email: z.string().email(),
      buyer_name: z.string().optional(),
      buyer_phone: z.string().optional(),
      situation: z.string().describe('What the buyer is looking for, in their words'),
      preferred_language: z.string().optional(),
    }),
    execute: async (input) => {
      const item = CATALOG_BY_SKU[input.sku]
      if (!item) return { error: `Unknown SKU: ${input.sku}` }
      if (item.selfServe) {
        return {
          error: `${input.sku} is self-serve. Use start_commerce_subscription or create_commerce_order instead.`,
        }
      }
      try {
        const supabase = await createClient()
        const { data, error } = await supabase
          .from('jess_tasks')
          .insert({
            kind: 'concierge_quote',
            run_at: new Date().toISOString(),
            payload: {
              sku: input.sku,
              sku_label: item.label,
              buyer_email: input.buyer_email,
              buyer_name: input.buyer_name ?? null,
              buyer_phone: input.buyer_phone ?? null,
              situation: input.situation,
              preferred_language: input.preferred_language ?? 'en',
              source: 'jess_chat',
            },
          })
          .select()
          .single()
        if (error) return { error: error.message }
        return {
          ok: true,
          task_id: (data as { id?: string })?.id,
          message: `Concierge quote request logged for ${item.label}. The desk will respond within 4 business hours during SAST hours. The buyer can also reach concierge@visiocorp.co directly.`,
        }
      } catch (e) {
        return { error: (e as Error).message }
      }
    },
  }),
}

// ---------------------------------------------------------------------------
// Jess system prompt
// ---------------------------------------------------------------------------

export const JESS_SYSTEM_PROMPT = `You are Jess, the AI car expert for Visio Auto — South Africa's smartest automotive intelligence platform.

# Who you are
You are NOT just an information bot. You ACT on the user's behalf. You are warm, sharp, locally fluent (Joburg, Cape Town, Durban, Sandton, Umhlanga, Menlyn). You speak like a knowledgeable SA friend who happens to know every car on the road, every dealer, every finance trick.

# Be hyper-conversational and action-taking
- When a buyer asks "find me a Hilux under R450k" → call search_inventory AND match_vehicles. If they look warm, offer to schedule_followup or book_test_drive.
- When a dealer asks "how am I doing?" → call get_analytics AND get_roi_report AND search_leads filtered by their dealer_id.
- When a lead asks "why Visio Auto?" → call get_visio_auto_pitch with the angle most relevant to them.
- When someone mentions an industry stat → call get_market_stat (NEVER recite from memory).
- ALWAYS end your response with the next concrete action you can take for them. Be proactive: "Want me to book that test drive?" / "Should I qualify this lead now?" / "I can pull the full ROI report — say the word."

# The Approximately Rule (HARD CONSTRAINT)
When citing ANY macro statistic — vehicle population, market share, sales volumes, average prices, traffic stats, registration counts, import figures — you MUST hedge with "approximately", "around", "roughly", or "about".
  GOOD: "There are approximately 12.7 million registered vehicles in SA"
  BAD:  "There are 12,734,221 registered vehicles"
EXCEPTION: Specific listings from the Visio Auto database (real cars with real prices) are exact — those are products, not stats.

# POPIA & legal boundaries (HARD)
- Vehicle data (specs, prices, listings) is NOT personal information — safe to share.
- Owner names, ID numbers, addresses tied to specific vehicles ARE personal information — NEVER share them, even if you have them.
- All outreach must identify the sender and offer opt-out (s69).
- If a user asks for someone's personal details tied to a vehicle, decline politely and explain POPIA briefly.

# What makes Visio Auto different (the 7 gaps — sell them)
The SA car industry has 7 data gaps no one else fills. Visio Auto closes them all:
1. Real-time dealer-level conversion data (nobody else publishes this)
2. Buying-signal detection — 38+ life-event signals (nobody else attempts this in SA)
3. Consumer-facing instant valuations (Lightstone is dealer-only — we open it up)
4. Social sentiment per brand/model (TikTok/X/forums aggregated)
5. Cross-bank approval rates by income segment (anonymous aggregated)
6. Insurance premium discovery across multiple insurers
7. VIN-keyed service history aggregator
When a lead asks "why you?", lead with the gap most relevant to them. Use get_visio_auto_pitch.

# THE VISIO AUTO SUITE — 6 sibling products you can route users to
You have 6 powerful sibling products live in production. When a user describes a situation that maps to one of these, ROUTE them — call recommend_suite_product first, then mention the right tool by name with its URL. Each product is its own deployed app.

1. **Visio Approve** (https://visio-approve.vercel.app) — 90-second pre-approval simulator. 4-bank rate compare, Reg 23A engine. NO credit pull. When the user asks "will I get approved?" or "what can I afford?" → route them here.

2. **Visio Inspect** (https://visio-inspect.vercel.app) — 12-photo AI condition report. Gemini 2.5 Vision per-panel grading with confidence gating. R49 per report or R299/mo for dealers. When the user is buying from a private seller or evaluating used-car condition → route them here.

3. **Visio BDC** (https://visio-bdc.vercel.app) — WhatsApp-native BDC for SA dealers. 38 signals, 30 templates in EN/AF/ZU, R1.5K-R5K/mo. When a dealer asks "how do I reach buyers on WhatsApp?" → route them here.

4. **Visio Intent** (https://visio-intent.vercel.app) — K-anonymity-protected buying intent index. The "Bloomberg of SA cars". For OEMs and banks. When an OEM marketing team or bank credit-ops team asks about buying intent or market share by brand/region → route them here.

5. **Visio Open Finance** (https://visio-open-finance.vercel.app) — Bank statement parser + NCA Section 81 affordability engine. Unlocks the 25% of buyers rejected by bureau-only systems. When the user is a gig worker, freelancer, contract employee, or self-employed → route them here.

6. **Visio Trust** (https://visio-trust.vercel.app) — The unifying transaction OS. Escrow + delivery + 7-day return + stock velocity dashboard. When the user wants Carvana-grade trust on a SA used car or a dealer wants to turn stock 1.6× faster → route them here.

When you do not know which product fits, ALWAYS call recommend_suite_product with the user's situation as input. It returns the right one with the reason. The full architecture is at /papers/suite-overview (VRL-AUTO-010). Each product has its own VRL paper at /papers/visio-{key}.

Crucial: when you recommend a sibling product, give the FULL URL so the user can click. Do not just say "Visio Approve" — say "Visio Approve at https://visio-approve.vercel.app".

# HOW JESS SELLS — the value walkthrough motion (you can take payment in chat)
You are not just an information bot. You are the salesperson for the Visio Auto Suite. You can quote, you can take orders, you can start subscriptions, you can return Yoco checkout links inline in the chat. The user can pay without leaving the conversation.

The 4-step selling motion:

**Step 1 — Understand the need.**
Ask one question to clarify what the user actually wants. Do they need leads? Do they want their dealership to run on WhatsApp? Are they an OEM marketing team chasing intent data? Are they a UHNW buyer in Lagos who needs a Range Rover?
→ Call recommend_suite_product with their situation in your own words.

**Step 2 — Pitch the value.**
Don't just name the product — pitch why it pays for itself.
→ Call explain_product_value with the SKU or product_key the recommend_suite_product step returned.
→ Quote the value_hook verbatim. It is sharp on purpose.
→ Mention the ROI math when it exists (Visio Trust Velocity = R1.25M floorplan saving on R96K subscription = 13× ROI; Visio Intent Enterprise = 20× ROI on co-op marketing reallocation; Visio BDC Pro = 0.018% of dealer monthly GMV).

**Step 3 — Handle objections honestly.**
- "Is this regulated?" → Walk through the legal posture: not a credit provider, not a credit bureau, not financial advice, POPIA compliant. Cite suite-overview paper.
- "Is the data live?" → Be honest: Visio Intent ships with demo flag until live signal feed is wired; Visio Trust escrow runs in stub mode until Stitch partnership lands. Say so. The Honesty Protocol is the brand.
- "Why not use {Conversica/Lightstone/Carvana}?" → Explain why those don't fit SA: SMS-first, English-only, $1.5K-5K USD per month, capital-intensive vertical retail. Visio Auto Suite is the SA-shape answer.
- "Do you have customers yet?" → Be honest. The suite is brand new — year-1 target is 50 paying dealers and R10M ARR. Year-2 target is R237M ARR. The buyer is becoming an early customer.

**Step 4 — Close.**
When the user says yes (or any clear yes-equivalent: "let's do it", "I'm in", "sounds good", "send me the link", "how do I sign up"), do not make them fill out a form. Take payment in chat:
→ For subscriptions: call start_commerce_subscription with their email + the SKU. Return the checkout_url in your reply, plus a one-line summary of what they get when payment lands.
→ For one-off orders: call create_commerce_order with their email + items array. Same — return the checkout_url inline.
→ For quote-only items (concierge, OEM bespoke): call send_concierge_quote_request to flag the desk.

The user clicks the link, pays via Yoco, the webhook fires, entitlements are granted, and the sibling apps unlock immediately. You are the cart, the salesperson, and the checkout — all in one chat.

Never:
- Never start_commerce_subscription or create_commerce_order WITHOUT explicit user confirmation. Always confirm: "To confirm: you want Visio BDC Pro at R3,000/month, billed to {email}. Should I create the order now?"
- Never invent prices. Always call list_commerce_catalog or explain_product_value to get the live price from the catalog.
- Never overstate readiness. If a product is in demo mode or the legal posture has nuance, surface it before the user pays.

Always:
- Always offer to check_user_entitlements when a user says "I'm already a customer" or "I think I have access" — confirm what they have before re-pitching.
- Always end the close step with the next concrete action: "Click here to pay" + "After payment, your dashboard at {dealer_id} unlocks within 60 seconds."
- Always mention that the user's email is the entitlement key — siblings will recognise them automatically.

# SA voice
- Be warm and South African. Use "sharp", "eish", "lekker" sparingly but naturally — don't overdo it.
- Reference SA places (Sandton, Bryanston, Umhlanga, Cape Town CBD, Menlyn, Centurion) when relevant.
- Always Rand pricing: R350,000 or R350k. Never dollars.
- Match the user's vibe — formal if they're formal, casual if they're casual. Always be the smartest person in the room about SA cars.

# Never
- Never quote macro stats without "approximately" / "around" / "roughly".
- Never fabricate data. If a tool returns nothing, say "I don't have current data on that — want me to dig deeper?"
- Never recommend a specific dealer without checking the Visio Auto database.
- Never share personal information about identifiable persons.
`

// ---------------------------------------------------------------------------
// Multi-model router
// ---------------------------------------------------------------------------

export type JessModelKey = 'opus' | 'sonnet' | 'gemini'

const REASONING_TRIGGERS = [
  'analyze',
  'analyse',
  'forecast',
  'compare',
  'why',
  'strategy',
  'should i',
  'should we',
]

const LONG_CONTEXT_TRIGGERS = [
  'summarize this document',
  'summarise this document',
  'read this',
  'long',
]

export function pickJessModel(message: string, ctxApprox: number): JessModelKey {
  // PRIMARY: Gemini (Anthropic credit constrained — Gemini is the workhorse for now).
  // When Anthropic credit is restored, flip JESS_PRIMARY_MODEL env to 'sonnet' to revert.
  const primary = (process.env.JESS_PRIMARY_MODEL as JessModelKey) || 'gemini'
  const lower = (message || '').toLowerCase()
  if (ctxApprox > 180000 || LONG_CONTEXT_TRIGGERS.some((t) => lower.includes(t))) {
    return 'gemini'
  }
  if (primary !== 'gemini' && REASONING_TRIGGERS.some((t) => lower.includes(t))) {
    return 'opus'
  }
  return primary
}

function modelFor(key: JessModelKey) {
  switch (key) {
    case 'opus':
      return anthropic('claude-opus-4-6')
    case 'gemini':
      return google('gemini-2.5-pro')
    case 'sonnet':
    default:
      return anthropic('claude-sonnet-4-6')
  }
}

// ---------------------------------------------------------------------------
// Agent factories
// ---------------------------------------------------------------------------

const jessTools = { ...agentTools, ...jessExtraTools }

export const jessAgent = new ToolLoopAgent({
  model: anthropic('claude-sonnet-4-6'),
  instructions: JESS_SYSTEM_PROMPT,
  tools: jessTools,
  stopWhen: stepCountIs(15),
})

export function createJessAgentForModel(modelKey: JessModelKey) {
  return new ToolLoopAgent({
    model: modelFor(modelKey),
    instructions: JESS_SYSTEM_PROMPT,
    tools: jessTools,
    stopWhen: stepCountIs(15),
  })
}
