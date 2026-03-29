/**
 * ROI Report Generator
 *
 * Generates personalized ROI reports for dealers using real data
 * from Supabase + Claude for executive summaries and recommendations.
 */

import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { createServiceClient } from '@/lib/supabase/service'
import type { Dealer, DealerAnalytics } from '@/lib/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ROIReport {
  dealer: Pick<Dealer, 'id' | 'name' | 'tier' | 'monthly_fee' | 'brands' | 'area'>
  period: string
  period_label: string
  generated_at: string
  kpis: {
    leads_delivered: number
    leads_contacted: number
    contacted_rate: number
    test_drives_booked: number
    test_drive_rate: number
    sales_closed: number
    close_rate: number
    total_revenue: number
    avg_deal_value: number
    cost: number
    roi_pct: number
    roi_multiple: number
  }
  benchmarks: {
    autotrader_avg_close_rate: number
    google_ads_avg_close_rate: number
    industry_avg_cost_per_lead: number
    visio_cost_per_lead: number
    visio_cost_per_sale: number
  }
  funnel: {
    stage: string
    count: number
    pct: number
  }[]
  source_breakdown: { source: string; count: number; pct: number }[]
  executive_summary: string
  recommendations: string[]
}

// Industry benchmarks for SA automotive
const BENCHMARKS = {
  autotrader_avg_close_rate: 0.02, // ~2% leads to sale
  google_ads_avg_close_rate: 0.015, // ~1.5%
  industry_avg_cost_per_lead: 450, // R450/lead on AutoTrader
}

// ---------------------------------------------------------------------------
// Period helpers
// ---------------------------------------------------------------------------

type PeriodKey = 'this_month' | 'last_month' | 'last_3_months' | 'custom'

function getPeriodRange(period: PeriodKey, customStart?: string, customEnd?: string): {
  start: string
  end: string
  label: string
  periods: string[]
} {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth() // 0-indexed

  if (period === 'this_month') {
    const p = `${y}-${String(m + 1).padStart(2, '0')}`
    return {
      start: `${p}-01`,
      end: new Date(y, m + 1, 0).toISOString().split('T')[0],
      label: now.toLocaleString('en-ZA', { month: 'long', year: 'numeric' }),
      periods: [p],
    }
  }

  if (period === 'last_month') {
    const d = new Date(y, m - 1, 1)
    const p = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return {
      start: `${p}-01`,
      end: new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0],
      label: d.toLocaleString('en-ZA', { month: 'long', year: 'numeric' }),
      periods: [p],
    }
  }

  if (period === 'last_3_months') {
    const periods: string[] = []
    for (let i = 3; i >= 1; i--) {
      const d = new Date(y, m - i, 1)
      periods.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    }
    const startDate = new Date(y, m - 3, 1)
    const endDate = new Date(y, m, 0)
    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
      label: `${startDate.toLocaleString('en-ZA', { month: 'short' })} – ${endDate.toLocaleString('en-ZA', { month: 'short', year: 'numeric' })}`,
      periods,
    }
  }

  // Custom
  return {
    start: customStart || `${y}-01-01`,
    end: customEnd || now.toISOString().split('T')[0],
    label: `${customStart || 'Start'} to ${customEnd || 'Today'}`,
    periods: [],
  }
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

export async function generateROIReport(
  dealerId: string,
  period: PeriodKey = 'last_month',
  customStart?: string,
  customEnd?: string
): Promise<ROIReport> {
  const supabase = createServiceClient()
  const range = getPeriodRange(period, customStart, customEnd)

  // Fetch dealer
  const { data: dealer, error: dealerErr } = await supabase
    .from('va_dealers')
    .select('id, name, tier, monthly_fee, brands, area, leads_quota')
    .eq('id', dealerId)
    .single()

  if (dealerErr || !dealer) {
    throw new Error(`Dealer not found: ${dealerErr?.message || dealerId}`)
  }

  // Fetch leads for this dealer in the period
  const { data: leads, error: leadsErr } = await supabase
    .from('va_leads')
    .select('id, status, source, ai_score, sale_amount, created_at')
    .eq('assigned_dealer_id', dealerId)
    .gte('created_at', range.start)
    .lte('created_at', range.end + 'T23:59:59Z')

  if (leadsErr) {
    throw new Error(`Failed to fetch leads: ${leadsErr.message}`)
  }

  const allLeads = leads || []
  const contacted = allLeads.filter((l) =>
    ['contacted', 'qualified', 'test_drive_booked', 'test_drive_done', 'negotiating', 'sold'].includes(l.status)
  )
  const testDrives = allLeads.filter((l) =>
    ['test_drive_booked', 'test_drive_done', 'negotiating', 'sold'].includes(l.status)
  )
  const sold = allLeads.filter((l) => l.status === 'sold')
  const totalRevenue = sold.reduce((sum, l) => sum + (l.sale_amount || 0), 0)

  const monthlyCost = dealer.monthly_fee || 10000
  const periodMonths = Math.max(1, range.periods.length || 1)
  const totalCost = monthlyCost * periodMonths

  const contactedRate = allLeads.length > 0 ? contacted.length / allLeads.length : 0
  const testDriveRate = allLeads.length > 0 ? testDrives.length / allLeads.length : 0
  const closeRate = allLeads.length > 0 ? sold.length / allLeads.length : 0
  const roiPct = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0
  const roiMultiple = totalCost > 0 ? totalRevenue / totalCost : 0

  const visioCPL = allLeads.length > 0 ? totalCost / allLeads.length : 0
  const visioCPS = sold.length > 0 ? totalCost / sold.length : 0

  // Source breakdown
  const sourceMap = new Map<string, number>()
  for (const l of allLeads) {
    const src = l.source || 'unknown'
    sourceMap.set(src, (sourceMap.get(src) || 0) + 1)
  }
  const sourceBreakdown = Array.from(sourceMap.entries())
    .map(([source, count]) => ({
      source,
      count,
      pct: allLeads.length > 0 ? Math.round((count / allLeads.length) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)

  // Funnel
  const funnel = [
    { stage: 'Delivered', count: allLeads.length, pct: 100 },
    { stage: 'Contacted', count: contacted.length, pct: allLeads.length > 0 ? Math.round((contacted.length / allLeads.length) * 100) : 0 },
    { stage: 'Test Drive', count: testDrives.length, pct: allLeads.length > 0 ? Math.round((testDrives.length / allLeads.length) * 100) : 0 },
    { stage: 'Sold', count: sold.length, pct: allLeads.length > 0 ? Math.round((sold.length / allLeads.length) * 100) : 0 },
  ]

  // Claude executive summary
  let executiveSummary = ''
  let recommendations: string[] = []

  try {
    const summaryResult = await generateText({
      model: anthropic('claude-sonnet-4-6'),
      system: `You are an automotive business analyst writing a concise executive summary for a South African car dealership ROI report. Be direct, use Rands (R), and reference SA market context. Keep it to 3-4 sentences.`,
      prompt: `Write an executive summary for ${dealer.name} (${dealer.area}, brands: ${dealer.brands?.join(', ')}).
Period: ${range.label}
Leads delivered: ${allLeads.length}
Contacted: ${contacted.length} (${Math.round(contactedRate * 100)}%)
Test drives: ${testDrives.length}
Sales closed: ${sold.length}
Revenue: R${totalRevenue.toLocaleString()}
Monthly fee: R${monthlyCost.toLocaleString()}
ROI: ${roiPct.toFixed(0)}% (${roiMultiple.toFixed(1)}x)
Industry avg close rate: 2% (AutoTrader), 1.5% (Google Ads)
Their close rate: ${(closeRate * 100).toFixed(1)}%`,
    })
    executiveSummary = summaryResult.text

    const recsResult = await generateText({
      model: anthropic('claude-sonnet-4-6'),
      system: `You are an automotive sales consultant. Give 3-5 specific, actionable recommendations to improve this dealership's lead conversion. Be concise — one sentence each. Reference their actual data.`,
      prompt: `Dealer: ${dealer.name} (${dealer.tier} tier, ${dealer.brands?.join(', ')})
Contact rate: ${Math.round(contactedRate * 100)}%
Test drive rate: ${Math.round(testDriveRate * 100)}%
Close rate: ${(closeRate * 100).toFixed(1)}%
Best source: ${sourceBreakdown[0]?.source || 'N/A'}
Avg deal value: R${sold.length > 0 ? Math.round(totalRevenue / sold.length).toLocaleString() : '0'}
Response time: Unknown (need tracking)`,
    })
    recommendations = recsResult.text.split('\n').filter((l) => l.trim().length > 10)
  } catch (err) {
    console.error('[roi-report] Claude generation failed, using fallback:', err)
    executiveSummary = `${dealer.name} received ${allLeads.length} leads during ${range.label}, converting ${sold.length} into sales generating R${totalRevenue.toLocaleString()} in revenue — a ${roiMultiple.toFixed(1)}x return on their R${totalCost.toLocaleString()} investment.`
    recommendations = [
      'Improve lead contact rate by responding within 5 minutes of delivery.',
      'Book test drives for all qualified leads — test drives convert at 3x the rate.',
      'Focus on your best-performing lead source and request more from that channel.',
    ]
  }

  return {
    dealer: {
      id: dealer.id,
      name: dealer.name,
      tier: dealer.tier,
      monthly_fee: dealer.monthly_fee,
      brands: dealer.brands,
      area: dealer.area,
    },
    period: range.periods[0] || range.start,
    period_label: range.label,
    generated_at: new Date().toISOString(),
    kpis: {
      leads_delivered: allLeads.length,
      leads_contacted: contacted.length,
      contacted_rate: Math.round(contactedRate * 100),
      test_drives_booked: testDrives.length,
      test_drive_rate: Math.round(testDriveRate * 100),
      sales_closed: sold.length,
      close_rate: Math.round(closeRate * 1000) / 10,
      total_revenue: totalRevenue,
      avg_deal_value: sold.length > 0 ? Math.round(totalRevenue / sold.length) : 0,
      cost: totalCost,
      roi_pct: Math.round(roiPct),
      roi_multiple: Math.round(roiMultiple * 10) / 10,
    },
    benchmarks: {
      autotrader_avg_close_rate: BENCHMARKS.autotrader_avg_close_rate * 100,
      google_ads_avg_close_rate: BENCHMARKS.google_ads_avg_close_rate * 100,
      industry_avg_cost_per_lead: BENCHMARKS.industry_avg_cost_per_lead,
      visio_cost_per_lead: Math.round(visioCPL),
      visio_cost_per_sale: Math.round(visioCPS),
    },
    funnel,
    source_breakdown: sourceBreakdown,
    executive_summary: executiveSummary,
    recommendations,
  }
}

// ---------------------------------------------------------------------------
// Monthly HTML Report
// ---------------------------------------------------------------------------

export async function generateMonthlyHTML(dealerId: string): Promise<string> {
  const report = await generateROIReport(dealerId, 'last_month')
  const k = report.kpis
  const b = report.benchmarks

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Visio Auto — Monthly Report for ${report.dealer.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #09090b; color: #e4e4e7; line-height: 1.6; }
    .container { max-width: 800px; margin: 0 auto; padding: 40px 24px; }
    .header { display: flex; align-items: center; gap: 12px; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #27272a; }
    .logo { width: 40px; height: 40px; background: #10b981; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px; }
    .header-text h1 { font-size: 20px; font-weight: 700; color: white; }
    .header-text p { font-size: 13px; color: #71717a; }
    .section { margin-bottom: 32px; }
    .section-title { font-size: 16px; font-weight: 600; color: white; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #27272a; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .kpi-card { background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 16px; }
    .kpi-card .label { font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px; }
    .kpi-card .value { font-size: 28px; font-weight: 700; color: white; font-family: 'SF Mono', monospace; margin-top: 4px; }
    .kpi-card .sub { font-size: 12px; color: #10b981; margin-top: 2px; }
    .funnel { display: flex; flex-direction: column; gap: 8px; }
    .funnel-row { display: flex; align-items: center; gap: 12px; }
    .funnel-label { width: 100px; font-size: 13px; color: #a1a1aa; }
    .funnel-bar-bg { flex: 1; height: 28px; background: #27272a; border-radius: 6px; overflow: hidden; }
    .funnel-bar { height: 100%; background: #10b981; border-radius: 6px; display: flex; align-items: center; padding-left: 10px; font-size: 12px; font-weight: 600; color: white; min-width: 40px; }
    .funnel-count { width: 50px; text-align: right; font-size: 13px; font-weight: 600; color: white; font-family: monospace; }
    .benchmark-table { width: 100%; border-collapse: collapse; }
    .benchmark-table th, .benchmark-table td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #27272a; font-size: 13px; }
    .benchmark-table th { color: #71717a; font-weight: 500; }
    .benchmark-table td { color: #e4e4e7; }
    .benchmark-table .highlight { color: #10b981; font-weight: 600; }
    .source-list { display: flex; flex-direction: column; gap: 8px; }
    .source-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #18181b; border-radius: 8px; }
    .source-name { font-size: 13px; color: #a1a1aa; }
    .source-count { font-size: 14px; font-weight: 600; color: white; font-family: monospace; }
    .summary-box { background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 20px; font-size: 14px; color: #d4d4d8; line-height: 1.7; }
    .recs-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
    .recs-list li { padding: 12px 16px; background: #18181b; border: 1px solid #27272a; border-radius: 8px; font-size: 13px; color: #d4d4d8; }
    .recs-list li::before { content: '→ '; color: #10b981; font-weight: 600; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #27272a; text-align: center; font-size: 12px; color: #52525b; }
    @media print { body { background: white; color: #18181b; } .kpi-card, .summary-box, .source-row, .recs-list li { background: #f4f4f5; border-color: #e4e4e7; } .kpi-card .value, .funnel-count, .source-count { color: #18181b; } .header-text h1 { color: #18181b; } .section-title { color: #18181b; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">VA</div>
      <div class="header-text">
        <h1>${report.dealer.name} — Monthly ROI Report</h1>
        <p>${report.period_label} &middot; ${report.dealer.area} &middot; ${report.dealer.brands?.join(', ') || 'All Brands'} &middot; ${report.dealer.tier.toUpperCase()} tier</p>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Key Performance Indicators</div>
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="label">Leads Delivered</div>
          <div class="value">${k.leads_delivered}</div>
          <div class="sub">${k.contacted_rate}% contacted</div>
        </div>
        <div class="kpi-card">
          <div class="label">Test Drives</div>
          <div class="value">${k.test_drives_booked}</div>
          <div class="sub">${k.test_drive_rate}% of leads</div>
        </div>
        <div class="kpi-card">
          <div class="label">Sales Closed</div>
          <div class="value">${k.sales_closed}</div>
          <div class="sub">${k.close_rate}% close rate</div>
        </div>
        <div class="kpi-card">
          <div class="label">Revenue</div>
          <div class="value">R${k.total_revenue.toLocaleString()}</div>
          <div class="sub">Avg R${k.avg_deal_value.toLocaleString()}/deal</div>
        </div>
        <div class="kpi-card">
          <div class="label">Monthly Fee</div>
          <div class="value">R${k.cost.toLocaleString()}</div>
          <div class="sub">R${b.visio_cost_per_lead}/lead</div>
        </div>
        <div class="kpi-card">
          <div class="label">ROI</div>
          <div class="value" style="color:#10b981">${k.roi_multiple}x</div>
          <div class="sub">${k.roi_pct}% return</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Lead Funnel</div>
      <div class="funnel">
        ${report.funnel
          .map(
            (f) => `
        <div class="funnel-row">
          <div class="funnel-label">${f.stage}</div>
          <div class="funnel-bar-bg">
            <div class="funnel-bar" style="width:${Math.max(f.pct, 5)}%">${f.pct}%</div>
          </div>
          <div class="funnel-count">${f.count}</div>
        </div>`
          )
          .join('')}
      </div>
    </div>

    <div class="section">
      <div class="section-title">Benchmark Comparison</div>
      <table class="benchmark-table">
        <tr><th>Metric</th><th>Visio Auto</th><th>AutoTrader Avg</th><th>Google Ads Avg</th></tr>
        <tr><td>Close Rate</td><td class="highlight">${k.close_rate}%</td><td>${b.autotrader_avg_close_rate}%</td><td>${b.google_ads_avg_close_rate}%</td></tr>
        <tr><td>Cost per Lead</td><td class="highlight">R${b.visio_cost_per_lead}</td><td>R${b.industry_avg_cost_per_lead}</td><td>R${Math.round(b.industry_avg_cost_per_lead * 1.2)}</td></tr>
        <tr><td>Cost per Sale</td><td class="highlight">R${b.visio_cost_per_sale}</td><td>R${Math.round(b.industry_avg_cost_per_lead / 0.02)}</td><td>R${Math.round(b.industry_avg_cost_per_lead * 1.2 / 0.015)}</td></tr>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Lead Sources</div>
      <div class="source-list">
        ${report.source_breakdown
          .map(
            (s) => `
        <div class="source-row">
          <span class="source-name">${s.source.replace(/_/g, ' ')}</span>
          <span class="source-count">${s.count} (${s.pct}%)</span>
        </div>`
          )
          .join('')}
        ${report.source_breakdown.length === 0 ? '<div class="source-row"><span class="source-name">No leads yet</span><span class="source-count">0</span></div>' : ''}
      </div>
    </div>

    <div class="section">
      <div class="section-title">Executive Summary</div>
      <div class="summary-box">${report.executive_summary}</div>
    </div>

    <div class="section">
      <div class="section-title">Recommendations</div>
      <ul class="recs-list">
        ${report.recommendations.map((r) => `<li>${r.replace(/^[\d\-.*]+\s*/, '')}</li>`).join('')}
      </ul>
    </div>

    <div class="footer">
      <p>Generated by Visio Auto AI &middot; ${new Date().toLocaleDateString('en-ZA')} &middot; visioauto.co.za</p>
      <p style="margin-top:4px">This report is confidential and intended for ${report.dealer.name} only.</p>
    </div>
  </div>
</body>
</html>`
}
