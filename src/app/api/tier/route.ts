import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getTierUsage, upgradeTier, TIER_LIMITS, type TierName } from '@/lib/tiers/freemium'

// ---------------------------------------------------------------------------
// Tier Management API
// GET  — Get dealer's current tier + usage
// POST — Upgrade/downgrade tier (includes Yoco payment link)
// ---------------------------------------------------------------------------

const UpgradeSchema = z.object({
  dealer_id: z.string().min(1, 'dealer_id is required'),
  tier: z.enum(['free', 'starter', 'growth', 'pro', 'enterprise']),
})

// ---------------------------------------------------------------------------
// Yoco payment link generation
// ---------------------------------------------------------------------------

function generateYocoPaymentLink(dealerId: string, tier: TierName): string | null {
  const config = TIER_LIMITS[tier]
  if (config.price === 0) return null

  const yocoBaseUrl = process.env.YOCO_PAYMENT_URL ?? 'https://pay.yoco.com/visio-auto'

  // Build Yoco payment link with metadata
  const params = new URLSearchParams({
    amount: String(config.price), // amount in ZAR cents
    currency: 'ZAR',
    description: `Visio Auto — ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan (monthly)`,
    metadata_dealer_id: dealerId,
    metadata_tier: tier,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://visio-auto.vercel.app'}/dashboard/billing?success=true&tier=${tier}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://visio-auto.vercel.app'}/dashboard/billing?cancelled=true`,
  })

  return `${yocoBaseUrl}?${params.toString()}`
}

// ---------------------------------------------------------------------------
// GET — Get dealer's current tier + usage
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const dealerId = request.nextUrl.searchParams.get('dealer_id')

  if (!dealerId) {
    return NextResponse.json({ error: 'dealer_id query param is required' }, { status: 400 })
  }

  try {
    const usage = await getTierUsage(dealerId)

    // Include upgrade options with pricing
    const tiers = (Object.entries(TIER_LIMITS) as [TierName, (typeof TIER_LIMITS)[TierName]][]).map(
      ([name, config]) => ({
        name,
        price_zar: config.price / 100, // convert cents to rands
        price_cents: config.price,
        leads_per_month: config.leads_per_month === -1 ? 'unlimited' : config.leads_per_month,
        signals_per_day: config.signals_per_day === -1 ? 'unlimited' : config.signals_per_day,
        features: {
          export: config.export_enabled,
          whatsapp: config.whatsapp_enabled,
          voice: config.voice_enabled,
          marketplace: config.marketplace_enabled,
          enrichment: config.enrichment_enabled,
          brief: config.brief_enabled,
        },
        is_current: name === usage.tier,
        payment_link: name !== usage.tier ? generateYocoPaymentLink(dealerId, name) : null,
      })
    )

    return NextResponse.json({
      dealer_id: dealerId,
      current: usage,
      available_tiers: tiers,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// POST — Upgrade/downgrade tier
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = UpgradeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.format() },
      { status: 400 }
    )
  }

  const { dealer_id, tier } = parsed.data

  try {
    const result = await upgradeTier(dealer_id, tier)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? 'Upgrade failed' },
        { status: 400 }
      )
    }

    // Get updated usage for confirmation
    const usage = await getTierUsage(dealer_id)

    // Generate payment link if upgrading to a paid tier
    const paymentLink = generateYocoPaymentLink(dealer_id, tier)

    return NextResponse.json({
      status: 'upgraded',
      previous_tier: result.previous_tier,
      new_tier: result.new_tier,
      usage,
      payment_link: paymentLink,
      new_limits: TIER_LIMITS[tier],
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
