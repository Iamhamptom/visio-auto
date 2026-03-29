import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import type { Dealer, DealerAnalytics } from "@/lib/types"

// =============================================================================
// GET /api/dealers/[id] — Single dealer with stats
// PATCH /api/dealers/[id] — Update dealer
// =============================================================================

// ---------------------------------------------------------------------------
// Mock data — single dealer lookup with analytics
// ---------------------------------------------------------------------------

const MOCK_DEALERS: Record<string, Dealer> = {
  "d-001": {
    id: "d-001",
    name: "Motus Toyota Kempton Park",
    group_name: "Motus Group",
    brands: ["Toyota"],
    area: "Kempton Park",
    city: "Johannesburg",
    province: "Gauteng",
    phone: "011 970 3930",
    email: "info@motustoyotakp.co.za",
    website: "https://www.motustoyotakemptonpark.co.za",
    dealer_principal: "Werner van Rooyen",
    tier: "growth",
    monthly_fee: 15000,
    leads_quota: 100,
    is_active: true,
    whatsapp_number: "+27119703930",
    inventory_feed_url: null,
    created_at: "2026-01-15T08:00:00Z",
  },
  "d-002": {
    id: "d-002",
    name: "BMW Bryanston (JSN Motors)",
    group_name: "JSN Motors Group",
    brands: ["BMW"],
    area: "Bryanston",
    city: "Johannesburg",
    province: "Gauteng",
    phone: "011 700 9000",
    email: "sales@jsnbmw.co.za",
    website: "https://www.jsnmotors.co.za",
    dealer_principal: "Johan Smit",
    tier: "pro",
    monthly_fee: 25000,
    leads_quota: 200,
    is_active: true,
    whatsapp_number: "+27117009000",
    inventory_feed_url: null,
    created_at: "2026-01-20T08:00:00Z",
  },
  "d-003": {
    id: "d-003",
    name: "Audi Centre Sandton",
    group_name: "Motus",
    brands: ["Audi"],
    area: "Sandton",
    city: "Johannesburg",
    province: "Gauteng",
    phone: "011 591 3000",
    email: "sandton@audicentre.co.za",
    website: null,
    dealer_principal: "Michael Fourie",
    tier: "pro",
    monthly_fee: 25000,
    leads_quota: 200,
    is_active: true,
    whatsapp_number: null,
    inventory_feed_url: null,
    created_at: "2026-02-01T08:00:00Z",
  },
}

const MOCK_ANALYTICS: Record<string, DealerAnalytics> = {
  "d-001": {
    id: "a-001",
    dealer_id: "d-001",
    period: "2026-03",
    leads_delivered: 87,
    leads_contacted: 72,
    test_drives_booked: 28,
    test_drives_done: 22,
    sales_closed: 9,
    total_revenue: 3_420_000,
    avg_response_time_seconds: 127,
    ai_score_avg: 68,
    best_source: "meta_ad",
    best_brand: "Toyota",
  },
  "d-002": {
    id: "a-002",
    dealer_id: "d-002",
    period: "2026-03",
    leads_delivered: 156,
    leads_contacted: 134,
    test_drives_booked: 45,
    test_drives_done: 38,
    sales_closed: 14,
    total_revenue: 8_960_000,
    avg_response_time_seconds: 89,
    ai_score_avg: 74,
    best_source: "google_ad",
    best_brand: "BMW",
  },
  "d-003": {
    id: "a-003",
    dealer_id: "d-003",
    period: "2026-03",
    leads_delivered: 112,
    leads_contacted: 95,
    test_drives_booked: 32,
    test_drives_done: 27,
    sales_closed: 11,
    total_revenue: 7_150_000,
    avg_response_time_seconds: 203,
    ai_score_avg: 71,
    best_source: "signal_engine",
    best_brand: "Audi",
  },
}

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const updateDealerSchema = z.object({
  name: z.string().min(2).optional(),
  group_name: z.string().nullable().optional(),
  brands: z.array(z.string()).min(1).optional(),
  area: z.string().min(2).optional(),
  city: z.string().min(2).optional(),
  province: z.string().min(2).optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  website: z.string().url().nullable().optional(),
  dealer_principal: z.string().nullable().optional(),
  tier: z.enum(["starter", "growth", "pro", "enterprise"]).optional(),
  is_active: z.boolean().optional(),
  whatsapp_number: z.string().nullable().optional(),
  inventory_feed_url: z.string().url().nullable().optional(),
})

// ---------------------------------------------------------------------------
// GET /api/dealers/[id]
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // TODO: Replace with Supabase query
  const dealer = MOCK_DEALERS[id]
  if (!dealer) {
    return NextResponse.json(
      { error: "Dealer not found", id },
      { status: 404 }
    )
  }

  const analytics = MOCK_ANALYTICS[id]

  // Compute derived stats
  const leadCount = analytics?.leads_delivered ?? 0
  const salesClosed = analytics?.sales_closed ?? 0
  const conversionRate = leadCount > 0
    ? Math.round((salesClosed / leadCount) * 1000) / 10
    : 0
  const revenueThisMonth = analytics?.total_revenue ?? 0
  const avgResponseTime = analytics?.avg_response_time_seconds ?? null
  const costPerLead = dealer.leads_quota > 0
    ? Math.round(dealer.monthly_fee / dealer.leads_quota)
    : 0
  const roi = dealer.monthly_fee > 0
    ? Math.round((revenueThisMonth / dealer.monthly_fee) * 10) / 10
    : 0

  return NextResponse.json({
    dealer,
    stats: {
      period: "2026-03",
      leads_delivered: leadCount,
      leads_contacted: analytics?.leads_contacted ?? 0,
      test_drives_booked: analytics?.test_drives_booked ?? 0,
      test_drives_done: analytics?.test_drives_done ?? 0,
      sales_closed: salesClosed,
      conversion_rate: conversionRate,
      revenue_this_month: revenueThisMonth,
      avg_response_time_seconds: avgResponseTime,
      avg_ai_score: analytics?.ai_score_avg ?? null,
      best_source: analytics?.best_source ?? null,
      best_brand: analytics?.best_brand ?? null,
      cost_per_lead: costPerLead,
      roi_multiple: roi,
    },
  })
}

// ---------------------------------------------------------------------------
// PATCH /api/dealers/[id]
// ---------------------------------------------------------------------------

const TIER_PRICING: Record<string, { fee: number; quota: number }> = {
  starter: { fee: 7500, quota: 50 },
  growth: { fee: 15000, quota: 100 },
  pro: { fee: 25000, quota: 200 },
  enterprise: { fee: 45000, quota: 500 },
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const dealer = MOCK_DEALERS[id]
  if (!dealer) {
    return NextResponse.json(
      { error: "Dealer not found", id },
      { status: 404 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = updateDealerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    )
  }

  const updates = parsed.data

  // Apply updates
  const updated: Dealer = { ...dealer, ...updates }

  // Recalculate pricing if tier changed
  if (updates.tier && updates.tier !== dealer.tier) {
    const pricing = TIER_PRICING[updates.tier]
    updated.monthly_fee = pricing.fee
    updated.leads_quota = pricing.quota
  }

  // TODO: Update in Supabase
  // const { data, error } = await supabase.from('va_dealers').update(updated).eq('id', id).select().single()

  return NextResponse.json({
    dealer: updated,
    message: `Dealer ${updated.name} updated successfully.`,
  })
}
