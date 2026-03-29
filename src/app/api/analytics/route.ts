import { NextRequest, NextResponse } from "next/server";

// Mock analytics data for dealer dashboard
function generateMockAnalytics(dealerId: string, period: string) {
  const now = new Date();

  // KPIs
  const kpis = {
    total_leads: 847,
    conversion_rate: 14.2,
    avg_response_time_seconds: 42,
    revenue_generated: 18_450_000,
    roi: 312,
    cost_per_lead: 285,
  };

  // Leads over time (last 30 days)
  const leadsOverTime = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split("T")[0],
      meta_ad: Math.floor(Math.random() * 12) + 5,
      google_ad: Math.floor(Math.random() * 8) + 3,
      whatsapp: Math.floor(Math.random() * 6) + 2,
      organic: Math.floor(Math.random() * 4) + 1,
      signal_engine: Math.floor(Math.random() * 15) + 8,
    };
  });

  // Lead funnel
  const funnel = [
    { stage: "New", count: 847, rate: 100 },
    { stage: "Contacted", count: 623, rate: 73.6 },
    { stage: "Qualified", count: 412, rate: 66.1 },
    { stage: "Test Drive", count: 198, rate: 48.1 },
    { stage: "Sold", count: 120, rate: 60.6 },
  ];

  // Score distribution
  const scoreDistribution = [
    { range: "0-20", count: 42 },
    { range: "20-40", count: 98 },
    { range: "40-60", count: 215 },
    { range: "60-80", count: 312 },
    { range: "80-100", count: 180 },
  ];

  // Sources performance
  const sources = [
    { source: "Signal Engine", leads: 342, conversions: 58, rate: 17.0 },
    { source: "Meta Ads", leads: 218, conversions: 28, rate: 12.8 },
    { source: "Google Ads", leads: 156, conversions: 19, rate: 12.2 },
    { source: "WhatsApp", leads: 87, conversions: 11, rate: 12.6 },
    { source: "Organic", leads: 44, conversions: 4, rate: 9.1 },
  ];

  // Top areas
  const areas = [
    { area: "Sandton", leads: 186, conversions: 32 },
    { area: "Bryanston", leads: 124, conversions: 19 },
    { area: "Centurion", leads: 112, conversions: 16 },
    { area: "Midrand", leads: 98, conversions: 14 },
    { area: "Fourways", leads: 89, conversions: 11 },
    { area: "Menlyn", leads: 78, conversions: 10 },
    { area: "Bedfordview", leads: 62, conversions: 8 },
  ];

  // Brand demand
  const brandDemand = [
    { brand: "Toyota", pct: 28 },
    { brand: "BMW", pct: 18 },
    { brand: "VW", pct: 15 },
    { brand: "Mercedes", pct: 12 },
    { brand: "Hyundai", pct: 8 },
    { brand: "Other", pct: 19 },
  ];

  // Monthly performance (last 6 months)
  const months = ["Oct 2025", "Nov 2025", "Dec 2025", "Jan 2026", "Feb 2026", "Mar 2026"];
  const monthlyPerformance = months.map((month, i) => ({
    month,
    leads: 120 + i * 15 + Math.floor(Math.random() * 30),
    test_drives: 28 + i * 4 + Math.floor(Math.random() * 8),
    sales: 16 + i * 2 + Math.floor(Math.random() * 5),
    revenue: 2_200_000 + i * 350_000 + Math.floor(Math.random() * 200_000),
    roi: 240 + i * 15 + Math.floor(Math.random() * 20),
  }));

  return {
    dealer_id: dealerId,
    period,
    generated_at: now.toISOString(),
    kpis,
    leads_over_time: leadsOverTime,
    funnel,
    score_distribution: scoreDistribution,
    sources,
    areas,
    brand_demand: brandDemand,
    monthly_performance: monthlyPerformance,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dealerId = searchParams.get("dealer_id") || "demo-dealer";
  const period = searchParams.get("period") || "monthly";

  const data = generateMockAnalytics(dealerId, period);

  return NextResponse.json(data);
}
