import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import type { Dealer, DealerTier } from "@/lib/types"

// =============================================================================
// GET /api/dealers — List dealers with filters
// POST /api/dealers — Create new dealer (onboarding)
// =============================================================================

const TIER_PRICING: Record<DealerTier, { fee: number; quota: number }> = {
  free: { fee: 0, quota: 5 },
  starter: { fee: 7500, quota: 50 },
  growth: { fee: 15000, quota: 100 },
  pro: { fee: 25000, quota: 200 },
  enterprise: { fee: 45000, quota: 500 },
}

// ---------------------------------------------------------------------------
// Mock data fallback — used when Supabase is unavailable or during dev
// ---------------------------------------------------------------------------

const MOCK_DEALERS: Dealer[] = [
  {
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
  {
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
  {
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
]

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const dealerFilterSchema = z.object({
  tier: z.enum(["starter", "growth", "pro", "enterprise"]).optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  brand: z.string().optional(),
  is_active: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

const createDealerSchema = z.object({
  name: z.string().min(2, "Dealer name is required"),
  group_name: z.string().nullable().optional(),
  brands: z.array(z.string()).optional(),
  brands_sold: z.string().optional(), // comma-separated string from signup form
  area: z.string().min(1, "Area is required"),
  city: z.string().optional().default("Johannesburg"),
  province: z.string().optional().default("Gauteng"),
  phone: z.string().nullable().optional(),
  email: z.string().email("Valid email required").nullable().optional(),
  website: z.string().url().nullable().optional(),
  dealer_principal: z.string().nullable().optional(),
  principal_name: z.string().nullable().optional(), // alias from signup form
  tier: z.enum(["free", "starter", "growth", "pro", "enterprise"]).default("starter"),
  whatsapp_number: z.string().nullable().optional(),
  inventory_feed_url: z.string().url().nullable().optional(),
  status: z.string().optional(), // pending_payment, active
})

// ---------------------------------------------------------------------------
// GET /api/dealers
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const params = Object.fromEntries(searchParams.entries())

  const parsed = dealerFilterSchema.safeParse(params)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.issues },
      { status: 400 }
    )
  }

  const { tier, city, province, brand, is_active, page, limit } = parsed.data

  // TODO: Replace with Supabase query when DB is connected
  let dealers = [...MOCK_DEALERS]

  // Apply filters
  if (tier) {
    dealers = dealers.filter((d) => d.tier === tier)
  }
  if (city) {
    dealers = dealers.filter((d) =>
      d.city.toLowerCase().includes(city.toLowerCase())
    )
  }
  if (province) {
    dealers = dealers.filter((d) =>
      d.province.toLowerCase().includes(province.toLowerCase())
    )
  }
  if (brand) {
    dealers = dealers.filter((d) =>
      d.brands.some((b) => b.toLowerCase().includes(brand.toLowerCase()))
    )
  }
  if (is_active !== undefined) {
    dealers = dealers.filter((d) => d.is_active === (is_active === "true"))
  }

  // Pagination
  const total = dealers.length
  const start = (page - 1) * limit
  const paginated = dealers.slice(start, start + limit)

  return NextResponse.json({
    dealers: paginated,
    total,
    page,
    limit,
    total_pages: Math.ceil(total / limit),
  })
}

// ---------------------------------------------------------------------------
// POST /api/dealers — Onboard a new dealer
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = createDealerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    )
  }

  const data = parsed.data
  const pricing = TIER_PRICING[data.tier]

  // Normalize brands: accept brands[] array or brands_sold comma string
  const brands = data.brands?.length
    ? data.brands
    : data.brands_sold
      ? data.brands_sold.split(',').map((b: string) => b.trim()).filter(Boolean)
      : []

  // Normalize principal name (accept both field names from form)
  const principal = data.dealer_principal ?? data.principal_name ?? null

  const newDealer: Dealer = {
    id: `d-${Date.now().toString(36)}`,
    name: data.name,
    group_name: data.group_name ?? null,
    brands,
    area: data.area,
    city: data.city ?? 'Johannesburg',
    province: data.province ?? 'Gauteng',
    phone: data.phone ?? null,
    email: data.email ?? null,
    website: data.website ?? null,
    dealer_principal: principal,
    tier: data.tier,
    monthly_fee: pricing.fee,
    leads_quota: pricing.quota,
    is_active: data.tier === 'free' || data.status === 'active',
    whatsapp_number: data.whatsapp_number ?? null,
    inventory_feed_url: data.inventory_feed_url ?? null,
    created_at: new Date().toISOString(),
  }

  // Insert into Supabase
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: inserted, error } = await supabase
      .from('va_dealers')
      .insert({
        name: newDealer.name,
        group_name: newDealer.group_name,
        brands: newDealer.brands,
        area: newDealer.area,
        city: newDealer.city,
        province: newDealer.province,
        phone: newDealer.phone,
        email: newDealer.email,
        website: newDealer.website,
        dealer_principal: newDealer.dealer_principal,
        tier: newDealer.tier,
        monthly_fee: newDealer.monthly_fee,
        leads_quota: newDealer.leads_quota,
        is_active: newDealer.is_active,
        whatsapp_number: newDealer.whatsapp_number,
      })
      .select()
      .single()

    if (!error && inserted) {
      return NextResponse.json(
        { dealer: inserted, id: inserted.id, pricing: { monthly_fee: pricing.fee, leads_quota: pricing.quota } },
        { status: 201 }
      )
    }
  } catch {
    // Supabase unavailable — fall through to mock response
  }

  return NextResponse.json(
    {
      dealer: newDealer,
      pricing: {
        monthly_fee: pricing.fee,
        leads_quota: pricing.quota,
        cost_per_lead: Math.round(pricing.fee / pricing.quota),
      },
      message: `Welcome aboard, ${data.name}! Your ${data.tier} plan includes ${pricing.quota} AI-qualified leads/month.`,
    },
    { status: 201 }
  )
}
