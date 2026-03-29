import { NextResponse } from "next/server"
import { scoreLead } from "@/lib/ai/scoring"
import type { Lead, VehicleType, Language, LeadStatus } from "@/lib/types"

// =============================================================================
// POST /api/dealers/seed-leads — Seed 30 realistic demo leads
// Names, phones, areas, budgets all SA-authentic
// Runs through scoreLead for real AI scores
// =============================================================================

type LeadSeed = {
  name: string
  phone: string
  email: string | null
  area: string
  city: string
  budget_min: number
  budget_max: number
  preferred_brand: string
  preferred_model: string | null
  preferred_type: VehicleType
  new_or_used: "new" | "used" | "any"
  has_trade_in: boolean
  trade_in_brand: string | null
  trade_in_model: string | null
  trade_in_year: number | null
  timeline: "this_week" | "this_month" | "three_months" | "just_browsing"
  finance_status: "pre_approved" | "needs_finance" | "cash" | "unknown"
  source: string
  language: Language
  status: LeadStatus
}

const LEAD_DATA: LeadSeed[] = [
  // --- THIS WEEK (5) — Hot buyers ---
  {
    name: "Thabo Molefe", phone: "082 445 7812", email: "thabo.molefe@gmail.com",
    area: "Sandton", city: "Johannesburg", budget_min: 450000, budget_max: 600000,
    preferred_brand: "Toyota", preferred_model: "Fortuner", preferred_type: "suv",
    new_or_used: "new", has_trade_in: true, trade_in_brand: "Toyota", trade_in_model: "RAV4", trade_in_year: 2021,
    timeline: "this_week", finance_status: "pre_approved", source: "google_ad", language: "en", status: "qualified",
  },
  {
    name: "Pieter van der Merwe", phone: "071 338 9021", email: "pieter.vdm@vodamail.co.za",
    area: "Centurion", city: "Pretoria", budget_min: 350000, budget_max: 450000,
    preferred_brand: "Volkswagen", preferred_model: "Amarok", preferred_type: "bakkie",
    new_or_used: "used", has_trade_in: true, trade_in_brand: "VW", trade_in_model: "Polo", trade_in_year: 2019,
    timeline: "this_week", finance_status: "pre_approved", source: "meta_ad", language: "af", status: "test_drive_booked",
  },
  {
    name: "Naledi Khumalo", phone: "073 901 4455", email: "naledi.k@outlook.com",
    area: "Bryanston", city: "Johannesburg", budget_min: 800000, budget_max: 1200000,
    preferred_brand: "BMW", preferred_model: "X5", preferred_type: "suv",
    new_or_used: "new", has_trade_in: true, trade_in_brand: "BMW", trade_in_model: "X3", trade_in_year: 2022,
    timeline: "this_week", finance_status: "cash", source: "signal_engine", language: "en", status: "negotiating",
  },
  {
    name: "Rentia Botha", phone: "082 667 3341", email: "rentia.botha@absa.co.za",
    area: "Menlyn", city: "Pretoria", budget_min: 280000, budget_max: 380000,
    preferred_brand: "Suzuki", preferred_model: "Fronx", preferred_type: "suv",
    new_or_used: "new", has_trade_in: false, trade_in_brand: null, trade_in_model: null, trade_in_year: null,
    timeline: "this_week", finance_status: "pre_approved", source: "google_ad", language: "af", status: "test_drive_done",
  },
  {
    name: "Sipho Nkosi", phone: "076 112 8834", email: null,
    area: "Midrand", city: "Johannesburg", budget_min: 220000, budget_max: 300000,
    preferred_brand: "Hyundai", preferred_model: "Creta", preferred_type: "suv",
    new_or_used: "any", has_trade_in: false, trade_in_brand: null, trade_in_model: null, trade_in_year: null,
    timeline: "this_week", finance_status: "needs_finance", source: "whatsapp", language: "zu", status: "contacted",
  },

  // --- THIS MONTH (12) — Warm pipeline ---
  {
    name: "Lerato Dlamini", phone: "084 223 5567", email: "lerato.d@discovery.co.za",
    area: "Fourways", city: "Johannesburg", budget_min: 500000, budget_max: 700000,
    preferred_brand: "Mercedes-Benz", preferred_model: "GLC", preferred_type: "suv",
    new_or_used: "new", has_trade_in: true, trade_in_brand: "Hyundai", trade_in_model: "Tucson", trade_in_year: 2021,
    timeline: "this_month", finance_status: "pre_approved", source: "meta_ad", language: "en", status: "qualified",
  },
  {
    name: "Kagiso Mthembu", phone: "079 445 6612", email: "kagiso.m@gmail.com",
    area: "Sandton", city: "Johannesburg", budget_min: 300000, budget_max: 420000,
    preferred_brand: "Toyota", preferred_model: "Corolla Cross", preferred_type: "suv",
    new_or_used: "new", has_trade_in: false, trade_in_brand: null, trade_in_model: null, trade_in_year: null,
    timeline: "this_month", finance_status: "needs_finance", source: "meta_ad", language: "en", status: "new",
  },
  {
    name: "Zanele Ndlovu", phone: "072 889 3345", email: "zanele.ndlovu@fnb.co.za",
    area: "Bedfordview", city: "Johannesburg", budget_min: 180000, budget_max: 260000,
    preferred_brand: "Suzuki", preferred_model: "Swift", preferred_type: "hatch",
    new_or_used: "new", has_trade_in: false, trade_in_brand: null, trade_in_model: null, trade_in_year: null,
    timeline: "this_month", finance_status: "needs_finance", source: "meta_ad", language: "zu", status: "contacted",
  },
  {
    name: "Jacques du Plessis", phone: "083 556 1290", email: "jacques.dp@sanlam.co.za",
    area: "Centurion", city: "Pretoria", budget_min: 900000, budget_max: 1500000,
    preferred_brand: "Audi", preferred_model: "Q7", preferred_type: "suv",
    new_or_used: "new", has_trade_in: true, trade_in_brand: "Audi", trade_in_model: "Q5", trade_in_year: 2022,
    timeline: "this_month", finance_status: "cash", source: "signal_engine", language: "af", status: "test_drive_booked",
  },
  {
    name: "Nomsa Sithole", phone: "078 990 2234", email: null,
    area: "Kempton Park", city: "Johannesburg", budget_min: 250000, budget_max: 350000,
    preferred_brand: "Haval", preferred_model: "Jolion", preferred_type: "suv",
    new_or_used: "new", has_trade_in: false, trade_in_brand: null, trade_in_model: null, trade_in_year: null,
    timeline: "this_month", finance_status: "needs_finance", source: "meta_ad", language: "en", status: "new",
  },
  {
    name: "Bongani Mahlangu", phone: "081 334 7788", email: "bongani.m@standardbank.co.za",
    area: "Randburg", city: "Johannesburg", budget_min: 380000, budget_max: 520000,
    preferred_brand: "Ford", preferred_model: "Ranger", preferred_type: "bakkie",
    new_or_used: "used", has_trade_in: true, trade_in_brand: "Toyota", trade_in_model: "Hilux", trade_in_year: 2018,
    timeline: "this_month", finance_status: "needs_finance", source: "whatsapp", language: "en", status: "qualified",
  },
  {
    name: "Fatima Ahmed", phone: "074 556 9901", email: "fatima.ahmed@gmail.com",
    area: "Sandton", city: "Johannesburg", budget_min: 600000, budget_max: 850000,
    preferred_brand: "BMW", preferred_model: "3 Series", preferred_type: "sedan",
    new_or_used: "new", has_trade_in: true, trade_in_brand: "Mercedes-Benz", trade_in_model: "C-Class", trade_in_year: 2021,
    timeline: "this_month", finance_status: "pre_approved", source: "google_ad", language: "en", status: "test_drive_done",
  },
  {
    name: "David Naidoo", phone: "083 221 4456", email: "david.naidoo@deloitte.com",
    area: "Menlyn", city: "Pretoria", budget_min: 400000, budget_max: 550000,
    preferred_brand: "Kia", preferred_model: "Sportage", preferred_type: "suv",
    new_or_used: "new", has_trade_in: false, trade_in_brand: null, trade_in_model: null, trade_in_year: null,
    timeline: "this_month", finance_status: "needs_finance", source: "meta_ad", language: "en", status: "contacted",
  },
  {
    name: "Lindiwe Cele", phone: "072 445 8823", email: null,
    area: "Fourways", city: "Johannesburg", budget_min: 200000, budget_max: 280000,
    preferred_brand: "Chery", preferred_model: "Tiggo 4 Pro", preferred_type: "suv",
    new_or_used: "new", has_trade_in: false, trade_in_brand: null, trade_in_model: null, trade_in_year: null,
    timeline: "this_month", finance_status: "needs_finance", source: "meta_ad", language: "zu", status: "new",
  },
  {
    name: "Johan Pretorius", phone: "082 778 3312", email: "johan.p@exxaro.com",
    area: "Centurion", city: "Pretoria", budget_min: 500000, budget_max: 680000,
    preferred_brand: "Toyota", preferred_model: "Hilux", preferred_type: "bakkie",
    new_or_used: "new", has_trade_in: true, trade_in_brand: "Ford", trade_in_model: "Ranger", trade_in_year: 2020,
    timeline: "this_month", finance_status: "cash", source: "referral", language: "af", status: "negotiating",
  },
  {
    name: "Mpho Mokoena", phone: "076 889 1123", email: "mpho.mokoena@multichoice.co.za",
    area: "Midrand", city: "Johannesburg", budget_min: 350000, budget_max: 480000,
    preferred_brand: "Hyundai", preferred_model: "Tucson", preferred_type: "suv",
    new_or_used: "new", has_trade_in: false, trade_in_brand: null, trade_in_model: null, trade_in_year: null,
    timeline: "this_month", finance_status: "needs_finance", source: "organic", language: "en", status: "new",
  },

  // --- THREE MONTHS (8) — Building pipeline ---
  {
    name: "Precious Mabaso", phone: "079 112 5567", email: "precious.m@nedbank.co.za",
    area: "Sandton", city: "Johannesburg", budget_min: 700000, budget_max: 950000,
    preferred_brand: "Mercedes-Benz", preferred_model: "C-Class", preferred_type: "sedan",
    new_or_used: "new", has_trade_in: true, trade_in_brand: "BMW", trade_in_model: "1 Series", trade_in_year: 2020,
    timeline: "three_months", finance_status: "unknown", source: "meta_ad", language: "en", status: "contacted",
  },
  {
    name: "Willem Joubert", phone: "071 667 8899", email: "willem.j@gmail.com",
    area: "Bryanston", city: "Johannesburg", budget_min: 250000, budget_max: 350000,
    preferred_brand: "Volkswagen", preferred_model: "Polo", preferred_type: "hatch",
    new_or_used: "new", has_trade_in: false, trade_in_brand: null, trade_in_model: null, trade_in_year: null,
    timeline: "three_months", finance_status: "needs_finance", source: "organic", language: "af", status: "new",
  },
  {
    name: "Tshepo Letsoko", phone: "084 334 2201", email: null,
    area: "Kempton Park", city: "Johannesburg", budget_min: 180000, budget_max: 250000,
    preferred_brand: "GWM", preferred_model: "P-Series", preferred_type: "bakkie",
    new_or_used: "used", has_trade_in: false, trade_in_brand: null, trade_in_model: null, trade_in_year: null,
    timeline: "three_months", finance_status: "unknown", source: "signal_engine", language: "st", status: "new",
  },
  {
    name: "Ayanda Zulu", phone: "073 556 7734", email: "ayanda.zulu@outlook.com",
    area: "Randburg", city: "Johannesburg", budget_min: 300000, budget_max: 400000,
    preferred_brand: "Toyota", preferred_model: "Starlet", preferred_type: "hatch",
    new_or_used: "new", has_trade_in: false, trade_in_brand: null, trade_in_model: null, trade_in_year: null,
    timeline: "three_months", finance_status: "needs_finance", source: "meta_ad", language: "zu", status: "new",
  },
  {
    name: "Sandra Ferreira", phone: "082 112 6678", email: "sandra.f@sappi.com",
    area: "Bedfordview", city: "Johannesburg", budget_min: 450000, budget_max: 600000,
    preferred_brand: "BMW", preferred_model: "X1", preferred_type: "suv",
    new_or_used: "new", has_trade_in: true, trade_in_brand: "Kia", trade_in_model: "Seltos", trade_in_year: 2022,
    timeline: "three_months", finance_status: "unknown", source: "organic", language: "en", status: "contacted",
  },
  {
    name: "Tshegofatso Maluleke", phone: "076 223 4489", email: null,
    area: "Midrand", city: "Johannesburg", budget_min: 220000, budget_max: 320000,
    preferred_brand: "Haval", preferred_model: "H6", preferred_type: "suv",
    new_or_used: "new", has_trade_in: false, trade_in_brand: null, trade_in_model: null, trade_in_year: null,
    timeline: "three_months", finance_status: "unknown", source: "signal_engine", language: "en", status: "new",
  },
  {
    name: "Marius Venter", phone: "083 445 9012", email: "marius.v@absa.co.za",
    area: "Menlyn", city: "Pretoria", budget_min: 550000, budget_max: 750000,
    preferred_brand: "Audi", preferred_model: "A4", preferred_type: "sedan",
    new_or_used: "new", has_trade_in: true, trade_in_brand: "VW", trade_in_model: "Passat", trade_in_year: 2019,
    timeline: "three_months", finance_status: "needs_finance", source: "whatsapp", language: "af", status: "contacted",
  },
  {
    name: "Nomvula Dube", phone: "074 889 3356", email: "nomvula.d@gmail.com",
    area: "Fourways", city: "Johannesburg", budget_min: 350000, budget_max: 480000,
    preferred_brand: "Ford", preferred_model: "Everest", preferred_type: "suv",
    new_or_used: "used", has_trade_in: false, trade_in_brand: null, trade_in_model: null, trade_in_year: null,
    timeline: "three_months", finance_status: "unknown", source: "organic", language: "en", status: "new",
  },

  // --- JUST BROWSING (5) — Long-term nurture ---
  {
    name: "Andile Mabena", phone: "078 112 4423", email: null,
    area: "Sandton", city: "Johannesburg", budget_min: 400000, budget_max: 600000,
    preferred_brand: "BMW", preferred_model: null, preferred_type: "suv",
    new_or_used: "any", has_trade_in: false, trade_in_brand: null, trade_in_model: null, trade_in_year: null,
    timeline: "just_browsing", finance_status: "unknown", source: "meta_ad", language: "en", status: "new",
  },
  {
    name: "Christo Swanepoel", phone: "082 778 1156", email: "christo.s@outlook.com",
    area: "Centurion", city: "Pretoria", budget_min: 250000, budget_max: 400000,
    preferred_brand: "Toyota", preferred_model: null, preferred_type: "bakkie",
    new_or_used: "any", has_trade_in: false, trade_in_brand: null, trade_in_model: null, trade_in_year: null,
    timeline: "just_browsing", finance_status: "unknown", source: "whatsapp", language: "af", status: "new",
  },
  {
    name: "Nokuphila Mkhize", phone: "073 445 2290", email: null,
    area: "Kempton Park", city: "Johannesburg", budget_min: 180000, budget_max: 280000,
    preferred_brand: "Suzuki", preferred_model: null, preferred_type: "hatch",
    new_or_used: "new", has_trade_in: false, trade_in_brand: null, trade_in_model: null, trade_in_year: null,
    timeline: "just_browsing", finance_status: "unknown", source: "meta_ad", language: "zu", status: "new",
  },
  {
    name: "Kobus Coetzee", phone: "071 889 5534", email: "kobus.c@gmail.com",
    area: "Randburg", city: "Johannesburg", budget_min: 500000, budget_max: 800000,
    preferred_brand: "Land Rover", preferred_model: null, preferred_type: "suv",
    new_or_used: "used", has_trade_in: true, trade_in_brand: "Toyota", trade_in_model: "Fortuner", trade_in_year: 2020,
    timeline: "just_browsing", finance_status: "unknown", source: "referral", language: "af", status: "new",
  },
  {
    name: "Palesa Kgosana", phone: "084 223 7701", email: "palesa.k@standardbank.co.za",
    area: "Midrand", city: "Johannesburg", budget_min: 300000, budget_max: 450000,
    preferred_brand: "Kia", preferred_model: null, preferred_type: "sedan",
    new_or_used: "new", has_trade_in: false, trade_in_brand: null, trade_in_model: null, trade_in_year: null,
    timeline: "just_browsing", finance_status: "unknown", source: "whatsapp", language: "st", status: "new",
  },
]

// ---------------------------------------------------------------------------
// Build full Lead objects with AI scoring
// ---------------------------------------------------------------------------

function buildLeads(): Lead[] {
  const now = new Date()

  return LEAD_DATA.map((d, i) => {
    const { score, tier } = scoreLead({
      budget_min: d.budget_min,
      budget_max: d.budget_max,
      timeline: d.timeline,
      finance_status: d.finance_status,
      has_trade_in: d.has_trade_in,
      preferred_brand: d.preferred_brand,
      preferred_model: d.preferred_model,
      preferred_type: d.preferred_type,
      source: d.source,
    })

    const id = `l-${String(i + 1).padStart(3, "0")}`

    // Stagger creation dates for realism (recent leads first)
    const daysAgo = d.timeline === "this_week" ? Math.floor(Math.random() * 3)
      : d.timeline === "this_month" ? 3 + Math.floor(Math.random() * 14)
      : d.timeline === "three_months" ? 17 + Math.floor(Math.random() * 30)
      : 30 + Math.floor(Math.random() * 30)

    const createdAt = new Date(now.getTime() - daysAgo * 86400000)

    // Set contacted/test_drive dates based on status
    let contacted_at: string | null = null
    let test_drive_at: string | null = null
    let sold_at: string | null = null
    let sale_amount: number | null = null

    if (["contacted", "qualified", "test_drive_booked", "test_drive_done", "negotiating", "sold"].includes(d.status)) {
      contacted_at = new Date(createdAt.getTime() + 3600000 * (1 + Math.random() * 4)).toISOString()
    }
    if (["test_drive_booked", "test_drive_done", "negotiating", "sold"].includes(d.status)) {
      test_drive_at = new Date(createdAt.getTime() + 86400000 * (1 + Math.random() * 3)).toISOString()
    }
    if (d.status === "sold") {
      sold_at = new Date(createdAt.getTime() + 86400000 * (3 + Math.random() * 7)).toISOString()
      sale_amount = d.budget_min + Math.round((d.budget_max - d.budget_min) * 0.6)
    }

    return {
      id,
      name: d.name,
      phone: d.phone,
      email: d.email,
      whatsapp: d.phone.replace(/\s/g, ""),
      area: d.area,
      city: d.city,
      province: "Gauteng",
      budget_min: d.budget_min,
      budget_max: d.budget_max,
      preferred_brand: d.preferred_brand,
      preferred_model: d.preferred_model,
      preferred_type: d.preferred_type,
      new_or_used: d.new_or_used,
      has_trade_in: d.has_trade_in,
      trade_in_brand: d.trade_in_brand,
      trade_in_model: d.trade_in_model,
      trade_in_year: d.trade_in_year,
      timeline: d.timeline,
      finance_status: d.finance_status,
      ai_score: score,
      score_tier: tier,
      source: d.source,
      source_detail: null,
      language: d.language,
      assigned_dealer_id: null,
      matched_vin: null,
      matched_vehicle: null,
      status: d.status,
      contacted_at,
      test_drive_at,
      sold_at,
      sale_amount,
      created_at: createdAt.toISOString(),
    } satisfies Lead
  })
}

// ---------------------------------------------------------------------------
// POST /api/dealers/seed-leads
// ---------------------------------------------------------------------------

export async function POST() {
  const leads = buildLeads()

  // TODO: Insert into Supabase
  // const { error } = await supabase.from('va_leads').upsert(leads, { onConflict: 'id' })

  // Summary stats
  const byStatus = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1
    return acc
  }, {})

  const byTier = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.score_tier] = (acc[l.score_tier] ?? 0) + 1
    return acc
  }, {})

  const bySource = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.source] = (acc[l.source] ?? 0) + 1
    return acc
  }, {})

  const byTimeline = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.timeline] = (acc[l.timeline] ?? 0) + 1
    return acc
  }, {})

  const byLanguage = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.language] = (acc[l.language] ?? 0) + 1
    return acc
  }, {})

  const avgScore = Math.round(leads.reduce((sum, l) => sum + l.ai_score, 0) / leads.length)
  const totalPipelineValue = leads.reduce((sum, l) => sum + (l.budget_max ?? 0), 0)

  return NextResponse.json({
    success: true,
    count: leads.length,
    avg_ai_score: avgScore,
    total_pipeline_value: totalPipelineValue,
    summary: {
      by_status: byStatus,
      by_tier: byTier,
      by_source: bySource,
      by_timeline: byTimeline,
      by_language: byLanguage,
    },
    sample: leads.slice(0, 5).map((l) => ({
      name: l.name,
      brand: l.preferred_brand,
      model: l.preferred_model,
      budget: `R${l.budget_min?.toLocaleString("en-ZA")} - R${l.budget_max?.toLocaleString("en-ZA")}`,
      ai_score: l.ai_score,
      tier: l.score_tier,
      timeline: l.timeline,
      status: l.status,
    })),
    message: `Seeded ${leads.length} demo leads. Average AI score: ${avgScore}. Pipeline value: R${totalPipelineValue.toLocaleString("en-ZA")}.`,
  })
}
