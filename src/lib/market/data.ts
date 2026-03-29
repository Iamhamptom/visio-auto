// =============================================================================
// VISIO AUTO — Market Data Layer
// Real SA automotive market data based on NAAMSA reports (2025/2026)
// =============================================================================

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type BrandSales = {
  brand: string
  units: number
  prevUnits: number
  marketShare: number
}

export type ModelTicker = {
  model: string
  units: number
  changePercent: number
  direction: "up" | "down"
}

export type PriceTrendPoint = {
  month: string
  hilux: number
  poloVivo: number
  corollaCross: number
  creta: number
}

export type DaysToSellEntry = {
  model: string
  days: number
  category: "fast" | "average" | "slow"
}

export type FinanceIndicator = {
  label: string
  value: string
  change?: string
  direction?: "up" | "down" | "neutral"
  unit?: string
}

export type SegmentTrendPoint = {
  month: string
  suvCrossover: number
  bakkieLcv: number
  hatchback: number
  sedan: number
  other: number
}

export type ChineseBrandEntry = {
  brand: string
  units: number
  yoyGrowth: number
  marketShare: number
  topModel: string
  note?: string
}

export type RegionalEntry = {
  province: string
  abbrev: string
  share: number
  units: number
}

// -----------------------------------------------------------------------------
// Ticker Data — Top movers
// -----------------------------------------------------------------------------

export const TICKER_DATA: ModelTicker[] = [
  { model: "HILUX", units: 4847, changePercent: 12, direction: "up" },
  { model: "POLO VIVO", units: 2173, changePercent: 3, direction: "down" },
  { model: "COROLLA CROSS", units: 1849, changePercent: 8, direction: "up" },
  { model: "SWIFT", units: 1992, changePercent: 15, direction: "up" },
  { model: "TIGGO 4", units: 1515, changePercent: 39, direction: "up" },
  { model: "FORTUNER", units: 1687, changePercent: 5, direction: "up" },
  { model: "STARLET", units: 1423, changePercent: 11, direction: "up" },
  { model: "FRONX", units: 1308, changePercent: 22, direction: "up" },
  { model: "i20", units: 1044, changePercent: 4, direction: "down" },
  { model: "RANGER", units: 1567, changePercent: 7, direction: "down" },
  { model: "CRETA", units: 1189, changePercent: 6, direction: "up" },
  { model: "BALENO", units: 1156, changePercent: 18, direction: "up" },
]

// -----------------------------------------------------------------------------
// Monthly Brand Sales — Top 10 (current month)
// -----------------------------------------------------------------------------

export const MONTHLY_BRAND_SALES: BrandSales[] = [
  { brand: "Toyota", units: 12344, prevUnits: 11200, marketShare: 24.8 },
  { brand: "Suzuki", units: 5963, prevUnits: 5100, marketShare: 13.0 },
  { brand: "VW", units: 5001, prevUnits: 5200, marketShare: 10.0 },
  { brand: "Hyundai", units: 3034, prevUnits: 2900, marketShare: 6.1 },
  { brand: "Ford", units: 2886, prevUnits: 3100, marketShare: 5.8 },
  { brand: "GWM", units: 2267, prevUnits: 1800, marketShare: 4.6 },
  { brand: "Isuzu", units: 1833, prevUnits: 1750, marketShare: 3.7 },
  { brand: "Chery", units: 1667, prevUnits: 1100, marketShare: 3.3 },
  { brand: "Kia", units: 1543, prevUnits: 1400, marketShare: 3.1 },
  { brand: "Mahindra", units: 1508, prevUnits: 1200, marketShare: 3.0 },
]

// -----------------------------------------------------------------------------
// Market Share — Donut chart
// -----------------------------------------------------------------------------

export const MARKET_SHARE_DATA = [
  { brand: "Toyota", share: 24.8, fill: "var(--color-toyota)" },
  { brand: "Suzuki", share: 13.0, fill: "var(--color-suzuki)" },
  { brand: "VW", share: 10.0, fill: "var(--color-vw)" },
  { brand: "Hyundai", share: 6.1, fill: "var(--color-hyundai)" },
  { brand: "Ford", share: 5.8, fill: "var(--color-ford)" },
  { brand: "GWM", share: 4.6, fill: "var(--color-gwm)" },
  { brand: "Others", share: 35.7, fill: "var(--color-others)" },
]

// -----------------------------------------------------------------------------
// Price Trends — 6 months, realistic SA used car prices (Rands)
// -----------------------------------------------------------------------------

export const PRICE_TREND_DATA: PriceTrendPoint[] = [
  { month: "Oct", hilux: 458000, poloVivo: 185000, corollaCross: 389000, creta: 355000 },
  { month: "Nov", hilux: 465000, poloVivo: 188000, corollaCross: 395000, creta: 362000 },
  { month: "Dec", hilux: 478000, poloVivo: 192000, corollaCross: 405000, creta: 370000 },
  { month: "Jan", hilux: 490000, poloVivo: 198000, corollaCross: 415000, creta: 378000 },
  { month: "Feb", hilux: 505000, poloVivo: 205000, corollaCross: 428000, creta: 388000 },
  { month: "Mar", hilux: 518000, poloVivo: 212000, corollaCross: 438000, creta: 395000 },
]

// -----------------------------------------------------------------------------
// Days to Sell — Average days on lot
// -----------------------------------------------------------------------------

export const DAYS_TO_SELL_DATA: DaysToSellEntry[] = [
  { model: "Polo Vivo", days: 12, category: "fast" },
  { model: "Corolla Cross", days: 14, category: "fast" },
  { model: "Swift", days: 16, category: "fast" },
  { model: "Hilux", days: 18, category: "average" },
  { model: "Tiggo 4", days: 22, category: "average" },
  { model: "Creta", days: 24, category: "average" },
  { model: "Fortuner", days: 28, category: "slow" },
]

// -----------------------------------------------------------------------------
// Finance & Economic Indicators
// -----------------------------------------------------------------------------

export const FINANCE_INDICATORS: FinanceIndicator[] = [
  { label: "Prime Rate", value: "11.50", unit: "%", direction: "neutral" },
  { label: "Fuel (95 ULP)", value: "24.62", unit: "R/L", change: "+0.38", direction: "up" },
  { label: "Fuel (Diesel)", value: "23.11", unit: "R/L", change: "+0.22", direction: "up" },
  { label: "Used Car Index", value: "103.2", change: "+3.2% MoM", direction: "up" },
  { label: "Finance Approval", value: "67", unit: "%", change: "+2% MoM", direction: "up" },
  { label: "Avg Deal Value", value: "391,000", unit: "R", direction: "neutral" },
]

// -----------------------------------------------------------------------------
// Segment Trends — Monthly breakdown by vehicle category
// -----------------------------------------------------------------------------

export const SEGMENT_TREND_DATA: SegmentTrendPoint[] = [
  { month: "Oct", suvCrossover: 14200, bakkieLcv: 12800, hatchback: 9500, sedan: 5200, other: 3100 },
  { month: "Nov", suvCrossover: 14800, bakkieLcv: 13100, hatchback: 9300, sedan: 5000, other: 3200 },
  { month: "Dec", suvCrossover: 15500, bakkieLcv: 13600, hatchback: 9100, sedan: 4800, other: 3400 },
  { month: "Jan", suvCrossover: 15100, bakkieLcv: 12900, hatchback: 8800, sedan: 4600, other: 3100 },
  { month: "Feb", suvCrossover: 16200, bakkieLcv: 13400, hatchback: 8900, sedan: 4500, other: 3300 },
  { month: "Mar", suvCrossover: 16800, bakkieLcv: 13800, hatchback: 9000, sedan: 4400, other: 3500 },
]

// -----------------------------------------------------------------------------
// Chinese Brand Tracker
// -----------------------------------------------------------------------------

export const CHINESE_BRAND_DATA: ChineseBrandEntry[] = [
  { brand: "Chery", units: 1667, yoyGrowth: 52, marketShare: 3.3, topModel: "Tiggo 4 Pro" },
  { brand: "GWM", units: 2267, yoyGrowth: 26, marketShare: 4.6, topModel: "P-Series" },
  { brand: "Haval", units: 1120, yoyGrowth: 18, marketShare: 2.2, topModel: "Jolion" },
  { brand: "BYD", units: 487, yoyGrowth: 340, marketShare: 1.0, topModel: "Atto 3", note: "60-70 new dealerships planned" },
  { brand: "BAIC", units: 389, yoyGrowth: 45, marketShare: 0.8, topModel: "D20" },
]

// -----------------------------------------------------------------------------
// Regional Distribution — Units by province
// -----------------------------------------------------------------------------

export const REGIONAL_DATA: RegionalEntry[] = [
  { province: "Gauteng", abbrev: "GP", share: 45.2, units: 22400 },
  { province: "Western Cape", abbrev: "WC", share: 15.1, units: 7490 },
  { province: "KwaZulu-Natal", abbrev: "KZN", share: 12.3, units: 6100 },
  { province: "Eastern Cape", abbrev: "EC", share: 6.8, units: 3370 },
  { province: "Free State", abbrev: "FS", share: 4.9, units: 2430 },
  { province: "Mpumalanga", abbrev: "MP", share: 4.7, units: 2330 },
  { province: "Limpopo", abbrev: "LP", share: 4.2, units: 2080 },
  { province: "North West", abbrev: "NW", share: 3.9, units: 1930 },
  { province: "Northern Cape", abbrev: "NC", share: 2.9, units: 1440 },
]

// -----------------------------------------------------------------------------
// Chart Configs (for shadcn ChartContainer)
// -----------------------------------------------------------------------------

export const BRAND_SALES_CHART_CONFIG = {
  units: { label: "Units Sold", color: "#10b981" },
} as const

export const MARKET_SHARE_CHART_CONFIG = {
  toyota: { label: "Toyota", color: "#10b981" },
  suzuki: { label: "Suzuki", color: "#059669" },
  vw: { label: "VW", color: "#047857" },
  hyundai: { label: "Hyundai", color: "#065f46" },
  ford: { label: "Ford", color: "#064e3b" },
  gwm: { label: "GWM", color: "#6ee7b7" },
  others: { label: "Others", color: "#1e293b" },
} as const

export const PRICE_TREND_CHART_CONFIG = {
  hilux: { label: "Hilux", color: "#10b981" },
  poloVivo: { label: "Polo Vivo", color: "#f59e0b" },
  corollaCross: { label: "Corolla Cross", color: "#3b82f6" },
  creta: { label: "Creta", color: "#8b5cf6" },
} as const

export const DAYS_TO_SELL_CHART_CONFIG = {
  days: { label: "Days", color: "#10b981" },
} as const

export const SEGMENT_TREND_CHART_CONFIG = {
  suvCrossover: { label: "SUV/Crossover", color: "#10b981" },
  bakkieLcv: { label: "Bakkie/LCV", color: "#f59e0b" },
  hatchback: { label: "Hatchback", color: "#3b82f6" },
  sedan: { label: "Sedan", color: "#8b5cf6" },
  other: { label: "Other", color: "#6b7280" },
} as const

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

export function formatZAR(value: number): string {
  return `R${value.toLocaleString("en-ZA")}`
}

export function formatCompact(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toString()
}
