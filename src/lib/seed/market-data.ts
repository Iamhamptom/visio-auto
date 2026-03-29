import type { MarketData } from "@/lib/types"

// =============================================================================
// VISIO AUTO — Seed Market Data
// Realistic NAAMSA-based SA automotive market data for Jan-Mar 2026
// Used for demos, dashboard charts, and AI agent context
// =============================================================================

// ---------------------------------------------------------------------------
// Monthly brand sales — Jan, Feb, Mar 2026
// Based on real NAAMSA reporting patterns and market trends
// ---------------------------------------------------------------------------

type MonthlySales = {
  brand: string
  jan: number
  feb: number
  mar: number
}

const MONTHLY_BRAND_SALES: MonthlySales[] = [
  { brand: "Toyota",     jan: 11200, feb: 11800, mar: 12344 },
  { brand: "Suzuki",     jan: 5100,  feb: 5500,  mar: 5963 },
  { brand: "Volkswagen", jan: 5200,  feb: 5050,  mar: 5001 },
  { brand: "Hyundai",    jan: 2900,  feb: 2980,  mar: 3034 },
  { brand: "Ford",       jan: 3100,  feb: 2950,  mar: 2886 },
  { brand: "GWM",        jan: 1800,  feb: 2050,  mar: 2267 },
  { brand: "Isuzu",      jan: 1750,  feb: 1800,  mar: 1833 },
  { brand: "Chery",      jan: 1100,  feb: 1380,  mar: 1667 },
  { brand: "Kia",        jan: 1400,  feb: 1470,  mar: 1543 },
  { brand: "Mahindra",   jan: 1200,  feb: 1340,  mar: 1508 },
  { brand: "BMW",        jan: 1350,  feb: 1400,  mar: 1480 },
  { brand: "Mercedes-Benz", jan: 1100, feb: 1180, mar: 1260 },
  { brand: "Haval",      jan: 980,   feb: 1050,  mar: 1120 },
  { brand: "Nissan",     jan: 920,   feb: 970,   mar: 1010 },
  { brand: "Audi",       jan: 680,   feb: 720,   mar: 790 },
  { brand: "Renault",    jan: 620,   feb: 650,   mar: 680 },
  { brand: "Land Rover", jan: 350,   feb: 380,   mar: 420 },
  { brand: "Porsche",    jan: 180,   feb: 195,   mar: 215 },
]

// ---------------------------------------------------------------------------
// Price trends — Top 10 models, monthly avg used car prices (Rands)
// ---------------------------------------------------------------------------

type PriceTrend = {
  model: string
  brand: string
  jan: number
  feb: number
  mar: number
  segment: string
}

const PRICE_TRENDS: PriceTrend[] = [
  { model: "Hilux 2.8 GD-6",     brand: "Toyota",  jan: 490000, feb: 505000, mar: 518000, segment: "bakkie" },
  { model: "Polo Vivo 1.4",      brand: "VW",      jan: 198000, feb: 205000, mar: 212000, segment: "hatch" },
  { model: "Corolla Cross 1.8",  brand: "Toyota",  jan: 415000, feb: 428000, mar: 438000, segment: "suv" },
  { model: "Creta 1.5 Executive",brand: "Hyundai", jan: 378000, feb: 388000, mar: 395000, segment: "suv" },
  { model: "Swift 1.2 GL",       brand: "Suzuki",  jan: 215000, feb: 222000, mar: 228000, segment: "hatch" },
  { model: "Ranger 2.0 BiT",     brand: "Ford",    jan: 520000, feb: 535000, mar: 548000, segment: "bakkie" },
  { model: "Fortuner 2.4 GD-6",  brand: "Toyota",  jan: 580000, feb: 595000, mar: 610000, segment: "suv" },
  { model: "Tiggo 4 Pro 1.5T",   brand: "Chery",   jan: 310000, feb: 318000, mar: 325000, segment: "suv" },
  { model: "3 Series 320i",      brand: "BMW",     jan: 620000, feb: 635000, mar: 648000, segment: "sedan" },
  { model: "C-Class C200",       brand: "Mercedes-Benz", jan: 680000, feb: 695000, mar: 710000, segment: "sedan" },
]

// ---------------------------------------------------------------------------
// Days to sell — Average days on lot by model
// ---------------------------------------------------------------------------

type DaysToSell = {
  model: string
  brand: string
  days: number
  trend: "improving" | "stable" | "worsening"
  segment: string
}

const DAYS_TO_SELL: DaysToSell[] = [
  { model: "Polo Vivo",       brand: "VW",      days: 12, trend: "improving", segment: "hatch" },
  { model: "Swift",           brand: "Suzuki",  days: 14, trend: "improving", segment: "hatch" },
  { model: "Corolla Cross",   brand: "Toyota",  days: 14, trend: "stable",    segment: "suv" },
  { model: "Starlet",         brand: "Toyota",  days: 16, trend: "improving", segment: "hatch" },
  { model: "Hilux",           brand: "Toyota",  days: 18, trend: "stable",    segment: "bakkie" },
  { model: "Creta",           brand: "Hyundai", days: 22, trend: "stable",    segment: "suv" },
  { model: "Tiggo 4 Pro",     brand: "Chery",   days: 22, trend: "improving", segment: "suv" },
  { model: "Jolion",          brand: "Haval",   days: 25, trend: "improving", segment: "suv" },
  { model: "Ranger",          brand: "Ford",    days: 24, trend: "worsening", segment: "bakkie" },
  { model: "Fortuner",        brand: "Toyota",  days: 28, trend: "stable",    segment: "suv" },
  { model: "3 Series",        brand: "BMW",     days: 32, trend: "stable",    segment: "sedan" },
  { model: "C-Class",         brand: "Mercedes-Benz", days: 35, trend: "worsening", segment: "sedan" },
  { model: "X5",              brand: "BMW",     days: 38, trend: "stable",    segment: "suv" },
  { model: "Amarok",          brand: "VW",      days: 20, trend: "improving", segment: "bakkie" },
]

// ---------------------------------------------------------------------------
// Finance rates and fuel prices — March 2026
// ---------------------------------------------------------------------------

type FinanceData = {
  metric: string
  value: number
  unit: string
  prev_value: number
  change_pct: number
  direction: "up" | "down" | "flat"
  source: string
}

const FINANCE_DATA: FinanceData[] = [
  { metric: "Prime Rate",                value: 11.50, unit: "%",    prev_value: 11.75, change_pct: -2.1, direction: "down", source: "SARB" },
  { metric: "Repo Rate",                 value: 8.00,  unit: "%",    prev_value: 8.25,  change_pct: -3.0, direction: "down", source: "SARB" },
  { metric: "Vehicle Finance Rate (avg)",value: 12.50, unit: "%",    prev_value: 12.75, change_pct: -2.0, direction: "down", source: "WesBank" },
  { metric: "Finance Approval Rate",     value: 67.0,  unit: "%",    prev_value: 65.0,  change_pct: 3.1,  direction: "up",   source: "TransUnion" },
  { metric: "Avg Finance Term",          value: 72,    unit: "months", prev_value: 72,  change_pct: 0,    direction: "flat", source: "WesBank" },
  { metric: "Avg Balloon Payment",       value: 30,    unit: "%",    prev_value: 28,    change_pct: 7.1,  direction: "up",   source: "WesBank" },
  { metric: "Fuel 95 ULP (Gauteng)",     value: 24.62, unit: "R/L",  prev_value: 24.24, change_pct: 1.6,  direction: "up",   source: "DoE" },
  { metric: "Fuel 93 ULP (Gauteng)",     value: 24.21, unit: "R/L",  prev_value: 23.85, change_pct: 1.5,  direction: "up",   source: "DoE" },
  { metric: "Diesel 50ppm (Gauteng)",    value: 23.11, unit: "R/L",  prev_value: 22.89, change_pct: 1.0,  direction: "up",   source: "DoE" },
  { metric: "USD/ZAR Exchange",          value: 18.35, unit: "R/$",  prev_value: 18.12, change_pct: 1.3,  direction: "up",   source: "SARB" },
  { metric: "CPI (headline)",            value: 4.8,   unit: "%",    prev_value: 5.0,   change_pct: -4.0, direction: "down", source: "Stats SA" },
  { metric: "Avg Deal Value (new)",      value: 452000,unit: "R",    prev_value: 438000,change_pct: 3.2,  direction: "up",   source: "NAAMSA" },
  { metric: "Avg Deal Value (used)",     value: 291000,unit: "R",    prev_value: 285000,change_pct: 2.1,  direction: "up",   source: "TransUnion" },
  { metric: "Used Car Price Index",      value: 103.2, unit: "index",prev_value: 100.0, change_pct: 3.2,  direction: "up",   source: "AutoTrader" },
]

// ---------------------------------------------------------------------------
// Segment breakdown — Q1 2026 unit share
// ---------------------------------------------------------------------------

type SegmentBreakdown = {
  segment: string
  jan_units: number
  feb_units: number
  mar_units: number
  share_pct: number
  yoy_change_pct: number
  top_model: string
}

const SEGMENT_BREAKDOWN: SegmentBreakdown[] = [
  { segment: "SUV/Crossover",  jan_units: 15100, feb_units: 16200, mar_units: 16800, share_pct: 33.8, yoy_change_pct: 8.2,  top_model: "Corolla Cross" },
  { segment: "Bakkie/LCV",     jan_units: 12900, feb_units: 13400, mar_units: 13800, share_pct: 27.8, yoy_change_pct: 3.1,  top_model: "Hilux" },
  { segment: "Hatchback",      jan_units: 8800,  feb_units: 8900,  mar_units: 9000,  share_pct: 18.1, yoy_change_pct: -4.5, top_model: "Swift" },
  { segment: "Sedan",          jan_units: 4600,  feb_units: 4500,  mar_units: 4400,  share_pct: 8.9,  yoy_change_pct: -8.2, top_model: "Polo Sedan" },
  { segment: "Light Commercial",jan_units: 3100, feb_units: 3300,  mar_units: 3500,  share_pct: 7.0,  yoy_change_pct: 12.0, top_model: "P-Series" },
  { segment: "MPV/Van",        jan_units: 1200,  feb_units: 1250,  mar_units: 1300,  share_pct: 2.6,  yoy_change_pct: -2.1, top_model: "Staria" },
  { segment: "Sports/Coupe",   jan_units: 480,   feb_units: 510,   mar_units: 540,   share_pct: 1.1,  yoy_change_pct: 5.0,  top_model: "GR86" },
  { segment: "EV/Hybrid",      jan_units: 320,   feb_units: 390,   mar_units: 460,   share_pct: 0.9,  yoy_change_pct: 145.0,top_model: "BYD Atto 3" },
]

// ---------------------------------------------------------------------------
// seedMarketData() — Build MarketData records for Supabase
// ---------------------------------------------------------------------------

export function seedMarketData(): {
  records: MarketData[]
  summary: {
    total_records: number
    data_types: string[]
    brands_covered: number
    models_covered: number
    period: string
  }
} {
  const records: MarketData[] = []
  let idCounter = 1

  function nextId(): string {
    return `md-${String(idCounter++).padStart(4, "0")}`
  }

  // --- Monthly brand sales ---
  const months = ["2026-01", "2026-02", "2026-03"] as const
  const monthKeys = ["jan", "feb", "mar"] as const

  for (const sales of MONTHLY_BRAND_SALES) {
    for (let i = 0; i < months.length; i++) {
      const month = months[i]
      const key = monthKeys[i]
      const units = sales[key]
      const prevUnits = i > 0 ? sales[monthKeys[i - 1]] : null

      records.push({
        id: nextId(),
        data_type: "monthly_sales",
        brand: sales.brand,
        model: null,
        area: null,
        period: month,
        value: units,
        value_previous: prevUnits,
        change_pct: prevUnits ? Math.round(((units - prevUnits) / prevUnits) * 1000) / 10 : null,
        unit: "units",
        source: "NAAMSA",
        metadata: {},
        created_at: new Date().toISOString(),
      })
    }
  }

  // --- Price trends ---
  for (const pt of PRICE_TRENDS) {
    for (let i = 0; i < months.length; i++) {
      const month = months[i]
      const key = monthKeys[i]
      const price = pt[key]
      const prevPrice = i > 0 ? pt[monthKeys[i - 1]] : null

      records.push({
        id: nextId(),
        data_type: "price_trend",
        brand: pt.brand,
        model: pt.model,
        area: null,
        period: month,
        value: price,
        value_previous: prevPrice,
        change_pct: prevPrice ? Math.round(((price - prevPrice) / prevPrice) * 1000) / 10 : null,
        unit: "ZAR",
        source: "AutoTrader/TransUnion",
        metadata: { segment: pt.segment },
        created_at: new Date().toISOString(),
      })
    }
  }

  // --- Days to sell ---
  for (const dts of DAYS_TO_SELL) {
    records.push({
      id: nextId(),
      data_type: "days_to_sell",
      brand: dts.brand,
      model: dts.model,
      area: null,
      period: "2026-03",
      value: dts.days,
      value_previous: null,
      change_pct: null,
      unit: "days",
      source: "AutoTrader/Dealer Data",
      metadata: { trend: dts.trend, segment: dts.segment },
      created_at: new Date().toISOString(),
    })
  }

  // --- Finance & economic data ---
  for (const fd of FINANCE_DATA) {
    records.push({
      id: nextId(),
      data_type: "finance_indicator",
      brand: null,
      model: null,
      area: fd.metric.includes("Gauteng") ? "Gauteng" : null,
      period: "2026-03",
      value: fd.value,
      value_previous: fd.prev_value,
      change_pct: fd.change_pct,
      unit: fd.unit,
      source: fd.source,
      metadata: { metric: fd.metric, direction: fd.direction },
      created_at: new Date().toISOString(),
    })
  }

  // --- Segment breakdown ---
  for (const seg of SEGMENT_BREAKDOWN) {
    for (let i = 0; i < months.length; i++) {
      const month = months[i]
      const unitsKey = `${monthKeys[i]}_units` as keyof SegmentBreakdown
      const units = seg[unitsKey] as number
      const prevUnits = i > 0 ? (seg[`${monthKeys[i - 1]}_units` as keyof SegmentBreakdown] as number) : null

      records.push({
        id: nextId(),
        data_type: "segment_breakdown",
        brand: null,
        model: null,
        area: null,
        period: month,
        value: units,
        value_previous: prevUnits,
        change_pct: prevUnits ? Math.round(((units - prevUnits) / prevUnits) * 1000) / 10 : null,
        unit: "units",
        source: "NAAMSA",
        metadata: {
          segment: seg.segment,
          share_pct: seg.share_pct,
          yoy_change_pct: seg.yoy_change_pct,
          top_model: seg.top_model,
        },
        created_at: new Date().toISOString(),
      })
    }
  }

  // --- Summary ---
  const uniqueBrands = new Set(records.filter((r) => r.brand).map((r) => r.brand))
  const uniqueModels = new Set(records.filter((r) => r.model).map((r) => r.model))
  const dataTypes = [...new Set(records.map((r) => r.data_type))]

  return {
    records,
    summary: {
      total_records: records.length,
      data_types: dataTypes,
      brands_covered: uniqueBrands.size,
      models_covered: uniqueModels.size,
      period: "Q1 2026 (Jan-Mar)",
    },
  }
}

// ---------------------------------------------------------------------------
// Convenience exports for direct use in components/APIs
// ---------------------------------------------------------------------------

export { MONTHLY_BRAND_SALES as SEED_BRAND_SALES }
export { PRICE_TRENDS as SEED_PRICE_TRENDS }
export { DAYS_TO_SELL as SEED_DAYS_TO_SELL }
export { FINANCE_DATA as SEED_FINANCE_DATA }
export { SEGMENT_BREAKDOWN as SEED_SEGMENT_BREAKDOWN }
