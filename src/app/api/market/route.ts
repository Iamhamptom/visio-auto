import { NextRequest, NextResponse } from "next/server"
import {
  MONTHLY_BRAND_SALES,
  MARKET_SHARE_DATA,
  PRICE_TREND_DATA,
  DAYS_TO_SELL_DATA,
  FINANCE_INDICATORS,
  SEGMENT_TREND_DATA,
  CHINESE_BRAND_DATA,
  REGIONAL_DATA,
  TICKER_DATA,
} from "@/lib/market/data"

// =============================================================================
// GET /api/market — Market data endpoint
// Query params: data_type, brand, period
// =============================================================================

const DATA_MAP: Record<string, unknown> = {
  ticker: TICKER_DATA,
  brand_sales: MONTHLY_BRAND_SALES,
  market_share: MARKET_SHARE_DATA,
  price_trends: PRICE_TREND_DATA,
  days_to_sell: DAYS_TO_SELL_DATA,
  finance: FINANCE_INDICATORS,
  segment_trends: SEGMENT_TREND_DATA,
  chinese_brands: CHINESE_BRAND_DATA,
  regional: REGIONAL_DATA,
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const dataType = searchParams.get("data_type")
  const brand = searchParams.get("brand")

  // If specific data type requested, return just that
  if (dataType && dataType in DATA_MAP) {
    let result = DATA_MAP[dataType]

    // Filter by brand if applicable
    if (brand && Array.isArray(result)) {
      result = (result as Array<Record<string, unknown>>).filter(
        (item) =>
          item.brand?.toString().toLowerCase() === brand.toLowerCase() ||
          item.model?.toString().toLowerCase().includes(brand.toLowerCase())
      )
    }

    return NextResponse.json({
      data_type: dataType,
      data: result,
      timestamp: new Date().toISOString(),
      source: "NAAMSA / Visio Auto Intelligence",
    })
  }

  // Default: return all market data
  return NextResponse.json({
    ticker: TICKER_DATA,
    brand_sales: MONTHLY_BRAND_SALES,
    market_share: MARKET_SHARE_DATA,
    price_trends: PRICE_TREND_DATA,
    days_to_sell: DAYS_TO_SELL_DATA,
    finance: FINANCE_INDICATORS,
    segment_trends: SEGMENT_TREND_DATA,
    chinese_brands: CHINESE_BRAND_DATA,
    regional: REGIONAL_DATA,
    timestamp: new Date().toISOString(),
    source: "NAAMSA / Visio Auto Intelligence",
    period: "March 2026",
  })
}
