/**
 * AI Newsletter Generator
 *
 * Generates personalized weekly intelligence briefs and market alerts
 * for Visio Auto dealer clients using Claude Sonnet 4.6.
 * Returns both HTML (email) and plain text (WhatsApp).
 */

import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import type { Dealer, Signal } from '@/lib/types'
import {
  TICKER_DATA,
  MONTHLY_BRAND_SALES,
  FINANCE_INDICATORS,
  DAYS_TO_SELL_DATA,
  CHINESE_BRAND_DATA,
  formatZAR,
} from '@/lib/market/data'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Newsletter {
  dealer_id: string
  dealer_name: string
  type: 'weekly' | 'market_alert'
  subject: string
  html: string
  plain_text: string
  generated_at: string
}

export interface MarketAlertEvent {
  event_type: 'interest_rate' | 'fuel_price' | 'model_launch' | 'competitor_action'
  title: string
  description: string
  impact_level: 'critical' | 'warning' | 'info'
  data?: Record<string, unknown>
}

export interface NewsItem {
  title: string
  summary: string
  category: 'sales' | 'regulation' | 'technology' | 'pricing'
  brands_mentioned: string[]
  relevance_score: number
  source: string
  date: string
}

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------

const MODEL = anthropic('claude-sonnet-4-6')

// ---------------------------------------------------------------------------
// SA Auto News — curated items (would be RSS/API in production)
// ---------------------------------------------------------------------------

export const SA_AUTO_NEWS: NewsItem[] = [
  {
    title: 'NAAMSA: New vehicle sales up 4.2% in March 2026',
    summary: 'Total industry sales reached 49,570 units in March, with passenger cars leading growth at 5.1%. SUVs and crossovers continue to dominate buyer preference.',
    category: 'sales',
    brands_mentioned: ['Toyota', 'Suzuki', 'VW', 'Hyundai'],
    relevance_score: 95,
    source: 'NAAMSA',
    date: '2026-03-28',
  },
  {
    title: 'BYD opens 12 new dealerships across Gauteng and Western Cape',
    summary: 'Chinese EV giant BYD accelerates SA expansion with 12 new showrooms. The Atto 3 and Dolphin Mini are driving demand, with 340% YoY growth.',
    category: 'sales',
    brands_mentioned: ['BYD'],
    relevance_score: 88,
    source: 'Automotive News SA',
    date: '2026-03-27',
  },
  {
    title: 'Fuel price increase: Petrol up R0.38/L from April 2',
    summary: 'DoE announces April fuel price adjustments. 95 ULP rises to R24.62/L. Analysts expect increased demand for fuel-efficient vehicles and hybrids.',
    category: 'pricing',
    brands_mentioned: ['Toyota', 'Suzuki'],
    relevance_score: 92,
    source: 'Department of Energy',
    date: '2026-03-26',
  },
  {
    title: 'Chery Tiggo 8 Pro Max launched at R599,900',
    summary: 'Chery SA expands its SUV lineup with the flagship Tiggo 8 Pro Max. 7-seater, 1.6T engine, 5-year/150,000km warranty. Targets Fortuner and Everest buyers.',
    category: 'technology',
    brands_mentioned: ['Chery', 'Toyota', 'Ford'],
    relevance_score: 85,
    source: 'Cars.co.za',
    date: '2026-03-25',
  },
  {
    title: 'SARB holds repo rate at 7.75% — prime stays at 11.50%',
    summary: 'Reserve Bank keeps rates steady for the third consecutive meeting. Vehicle finance approval rates remain at 67%, supporting steady buyer activity.',
    category: 'regulation',
    brands_mentioned: [],
    relevance_score: 90,
    source: 'SARB',
    date: '2026-03-24',
  },
  {
    title: '2026 Toyota Hilux GR-S pricing revealed',
    summary: 'Toyota SA confirms the 2026 Hilux GR-S at R895,900. New 2.8 GD-6 engine with 165kW. Pre-orders open April 1. Expected to be the fastest-selling Hilux variant.',
    category: 'technology',
    brands_mentioned: ['Toyota'],
    relevance_score: 93,
    source: 'Toyota SA',
    date: '2026-03-23',
  },
  {
    title: 'Used car prices climb 3.2% MoM — affordability squeeze continues',
    summary: 'TransUnion Auto Information Solutions reports used car values continue rising. Average used car price now R391,000. Budget segment (<R250K) seeing fastest growth.',
    category: 'pricing',
    brands_mentioned: ['VW', 'Suzuki', 'Hyundai'],
    relevance_score: 91,
    source: 'TransUnion',
    date: '2026-03-22',
  },
  {
    title: 'Suzuki overtakes VW as SA second-best seller for Q1 2026',
    summary: 'Suzuki Auto SA confirms Q1 2026 sales of 17,200 units, surpassing VW for the first time. Swift and Fronx lead the charge with combined 9,800 units.',
    category: 'sales',
    brands_mentioned: ['Suzuki', 'VW'],
    relevance_score: 94,
    source: 'Suzuki SA',
    date: '2026-03-21',
  },
]

// ---------------------------------------------------------------------------
// Weekly Newsletter Generator
// ---------------------------------------------------------------------------

export async function generateWeeklyNewsletter(
  dealer: Pick<Dealer, 'id' | 'name' | 'brands' | 'area' | 'city' | 'province' | 'tier'>,
  signals: Signal[],
  leadStats?: { delivered: number; contacted: number; converted: number }
): Promise<Newsletter> {
  const weekOf = new Date().toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Build context for Claude
  const topSignals = signals
    .sort((a, b) => b.buying_probability - a.buying_probability)
    .slice(0, 5)

  const dealerBrands = dealer.brands || []
  const brandSales = MONTHLY_BRAND_SALES.filter((b) =>
    dealerBrands.some((db) => b.brand.toLowerCase().includes(db.toLowerCase()))
  )

  const relevantTickers = TICKER_DATA.filter((t) =>
    dealerBrands.some(
      (db) =>
        t.model.toLowerCase().includes(db.toLowerCase()) ||
        db.toLowerCase().includes(t.model.split(' ')[0].toLowerCase())
    )
  )

  const relevantNews = SA_AUTO_NEWS.filter(
    (n) =>
      n.brands_mentioned.some((b) =>
        dealerBrands.some((db) => b.toLowerCase().includes(db.toLowerCase()))
      ) || n.relevance_score >= 90
  ).slice(0, 3)

  // Chinese brand opportunity detection
  const chineseOpportunity = CHINESE_BRAND_DATA.sort(
    (a, b) => b.yoyGrowth - a.yoyGrowth
  )[0]

  const signalContext = topSignals
    .map(
      (s, i) =>
        `${i + 1}. [${s.signal_type}] ${s.title}` +
        (s.person_name ? ` — ${s.person_name}` : '') +
        (s.area ? ` (${s.area})` : '') +
        ` | ${s.buying_probability}% probability` +
        (s.estimated_budget_min
          ? ` | Budget: R${s.estimated_budget_min.toLocaleString()}-R${(s.estimated_budget_max ?? s.estimated_budget_min).toLocaleString()}`
          : '')
    )
    .join('\n')

  const marketContext = [
    ...brandSales.map(
      (b) =>
        `${b.brand}: ${b.units.toLocaleString()} units (${b.units > b.prevUnits ? '+' : ''}${(((b.units - b.prevUnits) / b.prevUnits) * 100).toFixed(1)}% MoM), ${b.marketShare}% market share`
    ),
    ...relevantTickers.map(
      (t) =>
        `${t.model}: ${t.units.toLocaleString()} units, ${t.direction === 'up' ? '+' : '-'}${t.changePercent}%`
    ),
    `Finance indicators: Prime ${FINANCE_INDICATORS[0].value}%, Fuel R${FINANCE_INDICATORS[1].value}/L, Approval rate ${FINANCE_INDICATORS[4].value}%`,
  ].join('\n')

  const daysToSellContext = DAYS_TO_SELL_DATA.map(
    (d) => `${d.model}: ${d.days} days (${d.category})`
  ).join(', ')

  const newsContext = relevantNews
    .map((n) => `- ${n.title}: ${n.summary}`)
    .join('\n')

  try {
    const { text: aiContent } = await generateText({
      model: MODEL,
      system: `You are the Visio Auto AI Newsletter Writer. You produce premium weekly intelligence briefs for South African car dealers — think Bloomberg Terminal meets automotive CRM.

Rules:
- Use South African context (Rands, provinces, local market dynamics)
- Be data-driven — reference specific numbers, percentages, trends
- Be actionable — every section should tell the dealer what to DO
- Keep tone professional but energetic — this is intelligence that makes money
- Use "you/your" to address the dealer directly
- Format for readability — short paragraphs, bullet points
- Do NOT use markdown headers — output clean structured text sections`,
      prompt: `Generate the weekly intelligence brief content for ${dealer.name} (${dealer.area}, ${dealer.city}).
Brands: ${dealerBrands.join(', ') || 'Multi-brand'}
Tier: ${dealer.tier}

TOP SIGNALS THIS WEEK:
${signalContext || 'No signals detected this week.'}

MARKET DATA:
${marketContext}

DAYS TO SELL: ${daysToSellContext}

LEADS STATS:
${leadStats ? `Delivered: ${leadStats.delivered}, Contacted: ${leadStats.contacted}, Converted: ${leadStats.converted}` : 'No lead data this period.'}

OPPORTUNITY:
${chineseOpportunity.brand} is growing ${chineseOpportunity.yoyGrowth}% YoY with ${chineseOpportunity.units.toLocaleString()} units/month. Top model: ${chineseOpportunity.topModel}.
${chineseOpportunity.note || ''}

RELEVANT NEWS:
${newsContext}

Write 5 sections:
1. "This Week's Hot Signals" — top 5 signals with specific action items for each
2. "Market Pulse" — their brand performance, price trends, days-to-sell insights
3. "Your Leads Summary" — leads delivered, conversion stats, what to improve
4. "Opportunity Spotlight" — ONE specific opportunity with reasoning and action
5. "Industry News" — 3 news items with dealer-relevant takeaways

Write clean text. Each section title on its own line. Keep it tight — 400-600 words total.`,
    })

    // Build HTML email
    const html = buildNewsletterHTML(dealer.name, weekOf, aiContent, topSignals, leadStats)

    // Build plain text (WhatsApp-friendly)
    const plainText = buildPlainText(dealer.name, weekOf, aiContent)

    return {
      dealer_id: dealer.id,
      dealer_name: dealer.name,
      type: 'weekly',
      subject: `Weekly Intelligence Brief — ${dealer.name} — Week of ${weekOf}`,
      html,
      plain_text: plainText,
      generated_at: new Date().toISOString(),
    }
  } catch (err) {
    console.error('[newsletter] Generation failed:', err)
    // Return a basic fallback newsletter
    return buildFallbackNewsletter(dealer, weekOf, topSignals, leadStats)
  }
}

// ---------------------------------------------------------------------------
// Market Alert Generator
// ---------------------------------------------------------------------------

export async function generateMarketAlert(
  event: MarketAlertEvent,
  dealer: Pick<Dealer, 'id' | 'name' | 'brands' | 'area'>
): Promise<Newsletter> {
  try {
    const { text: analysis } = await generateText({
      model: MODEL,
      system: `You are Visio Auto's market alert analyst. Produce a concise, actionable market alert for a South African car dealer. Include: what happened, why it matters to their business specifically, and what they should do in the next 48 hours. Use Rands and SA context. Keep it to 150-200 words.`,
      prompt: `ALERT: ${event.title}
Details: ${event.description}
Impact level: ${event.impact_level}
Dealer: ${dealer.name} (${dealer.area}, brands: ${dealer.brands?.join(', ') || 'Multi-brand'})
${event.data ? `Data: ${JSON.stringify(event.data)}` : ''}

Write the alert analysis with recommended actions.`,
    })

    const severityEmoji =
      event.impact_level === 'critical' ? '🔴' : event.impact_level === 'warning' ? '🟡' : '🔵'

    const html = buildAlertHTML(dealer.name, event, analysis, severityEmoji)

    const plainText = [
      `${severityEmoji} VISIO AUTO MARKET ALERT`,
      '',
      `*${event.title}*`,
      '',
      analysis,
      '',
      `---`,
      `Powered by Visio Auto AI`,
      `visio-auto.vercel.app`,
    ].join('\n')

    return {
      dealer_id: dealer.id,
      dealer_name: dealer.name,
      type: 'market_alert',
      subject: `${severityEmoji} Market Alert: ${event.title}`,
      html,
      plain_text: plainText,
      generated_at: new Date().toISOString(),
    }
  } catch (err) {
    console.error('[newsletter] Alert generation failed:', err)
    return {
      dealer_id: dealer.id,
      dealer_name: dealer.name,
      type: 'market_alert',
      subject: `Market Alert: ${event.title}`,
      html: `<p>${event.description}</p>`,
      plain_text: `MARKET ALERT: ${event.title}\n\n${event.description}`,
      generated_at: new Date().toISOString(),
    }
  }
}

// ---------------------------------------------------------------------------
// HTML Builders
// ---------------------------------------------------------------------------

function buildNewsletterHTML(
  dealerName: string,
  weekOf: string,
  content: string,
  signals: Signal[],
  leadStats?: { delivered: number; contacted: number; converted: number }
): string {
  // Split content into sections and format
  const sections = content.split('\n\n').filter((s) => s.trim())
  const formattedContent = sections
    .map((section) => {
      const lines = section.split('\n')
      const firstLine = lines[0]
      // Check if first line is a section title
      const isSectionTitle =
        firstLine.includes('Hot Signals') ||
        firstLine.includes('Market Pulse') ||
        firstLine.includes('Leads Summary') ||
        firstLine.includes('Opportunity') ||
        firstLine.includes('Industry News')

      if (isSectionTitle) {
        return `<div class="section">
          <h2 class="section-title">${firstLine}</h2>
          <div class="section-body">${lines
            .slice(1)
            .map((l) => {
              if (l.startsWith('- ') || l.startsWith('* ')) {
                return `<div class="bullet">${l.slice(2)}</div>`
              }
              if (/^\d+\./.test(l)) {
                return `<div class="bullet">${l}</div>`
              }
              return `<p>${l}</p>`
            })
            .join('')}</div>
        </div>`
      }

      return `<div class="section"><div class="section-body">${section
        .split('\n')
        .map((l) => `<p>${l}</p>`)
        .join('')}</div></div>`
    })
    .join('')

  // KPI bar
  const kpiBar = leadStats
    ? `<div class="kpi-bar">
        <div class="kpi"><span class="kpi-value">${leadStats.delivered}</span><span class="kpi-label">Leads Delivered</span></div>
        <div class="kpi"><span class="kpi-value">${leadStats.contacted}</span><span class="kpi-label">Contacted</span></div>
        <div class="kpi"><span class="kpi-value">${leadStats.converted}</span><span class="kpi-label">Converted</span></div>
        <div class="kpi"><span class="kpi-value">${leadStats.delivered > 0 ? Math.round((leadStats.converted / leadStats.delivered) * 100) : 0}%</span><span class="kpi-label">Close Rate</span></div>
      </div>`
    : ''

  // Signal count badge
  const signalBadge = signals.length > 0
    ? `<div class="signal-badge">${signals.length} hot signals detected this week</div>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Weekly Intelligence Brief — ${dealerName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #09090b; color: #e4e4e7; line-height: 1.7; }
    .container { max-width: 680px; margin: 0 auto; padding: 0; }
    .header { background: linear-gradient(135deg, #064e3b 0%, #0a0f0d 100%); padding: 32px 28px; border-bottom: 2px solid #10b981; }
    .header-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    .logo-mark { width: 36px; height: 36px; background: #10b981; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #000; font-weight: 800; font-size: 16px; font-family: monospace; }
    .logo-text { font-size: 13px; color: #6ee7b7; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; }
    .header h1 { font-size: 22px; font-weight: 700; color: white; line-height: 1.3; }
    .header .meta { font-size: 12px; color: #6ee7b7; margin-top: 6px; font-family: monospace; }
    .signal-badge { background: #10b981; color: #000; font-size: 12px; font-weight: 700; padding: 6px 16px; text-align: center; font-family: monospace; text-transform: uppercase; letter-spacing: 1px; }
    .kpi-bar { display: flex; background: #18181b; border-bottom: 1px solid #27272a; }
    .kpi { flex: 1; padding: 16px 12px; text-align: center; border-right: 1px solid #27272a; }
    .kpi:last-child { border-right: none; }
    .kpi-value { display: block; font-size: 24px; font-weight: 700; color: #10b981; font-family: 'SF Mono', 'Fira Code', monospace; }
    .kpi-label { display: block; font-size: 10px; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
    .content { padding: 24px 28px; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 15px; font-weight: 700; color: #10b981; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #27272a; text-transform: uppercase; letter-spacing: 0.5px; }
    .section-body { font-size: 14px; color: #d4d4d8; }
    .section-body p { margin-bottom: 8px; }
    .bullet { padding: 6px 0 6px 16px; border-left: 2px solid #10b981; margin-bottom: 6px; font-size: 13px; color: #d4d4d8; }
    .footer { background: #18181b; padding: 20px 28px; text-align: center; border-top: 1px solid #27272a; }
    .footer p { font-size: 11px; color: #52525b; margin-bottom: 4px; }
    .footer a { color: #10b981; text-decoration: none; }
    @media (max-width: 600px) {
      .kpi-bar { flex-wrap: wrap; }
      .kpi { flex: 0 0 50%; border-bottom: 1px solid #27272a; }
      .header h1 { font-size: 18px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-logo">
        <div class="logo-mark">VA</div>
        <div class="logo-text">Visio Auto Intelligence</div>
      </div>
      <h1>Weekly Intelligence Brief &mdash; ${dealerName}</h1>
      <div class="meta">Week of ${weekOf} &bull; Confidential</div>
    </div>
    ${signalBadge}
    ${kpiBar}
    <div class="content">
      ${formattedContent}
    </div>
    <div class="footer">
      <p>Powered by <a href="https://visio-auto.vercel.app">Visio Auto AI</a> &bull; Upgrade your plan at visio-auto.vercel.app</p>
      <p>This brief is confidential and prepared exclusively for ${dealerName}.</p>
    </div>
  </div>
</body>
</html>`
}

function buildAlertHTML(
  dealerName: string,
  event: MarketAlertEvent,
  analysis: string,
  severityEmoji: string
): string {
  const severityColor =
    event.impact_level === 'critical' ? '#ef4444' : event.impact_level === 'warning' ? '#f59e0b' : '#3b82f6'
  const severityLabel = event.impact_level.toUpperCase()

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Market Alert — ${event.title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #09090b; color: #e4e4e7; line-height: 1.7; }
    .container { max-width: 680px; margin: 0 auto; }
    .alert-header { background: #18181b; padding: 24px 28px; border-left: 4px solid ${severityColor}; }
    .severity { display: inline-block; font-size: 10px; font-weight: 700; color: ${severityColor}; background: ${severityColor}22; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-family: monospace; }
    .alert-header h1 { font-size: 20px; font-weight: 700; color: white; }
    .alert-header .meta { font-size: 12px; color: #71717a; margin-top: 4px; font-family: monospace; }
    .content { padding: 24px 28px; font-size: 14px; color: #d4d4d8; }
    .content p { margin-bottom: 12px; }
    .footer { background: #18181b; padding: 16px 28px; text-align: center; border-top: 1px solid #27272a; }
    .footer p { font-size: 11px; color: #52525b; }
    .footer a { color: #10b981; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="alert-header">
      <div class="severity">${severityEmoji} ${severityLabel}</div>
      <h1>${event.title}</h1>
      <div class="meta">${new Date().toLocaleDateString('en-ZA')} &bull; ${dealerName}</div>
    </div>
    <div class="content">
      ${analysis.split('\n').map((p) => `<p>${p}</p>`).join('')}
    </div>
    <div class="footer">
      <p>Powered by <a href="https://visio-auto.vercel.app">Visio Auto AI</a></p>
    </div>
  </div>
</body>
</html>`
}

// ---------------------------------------------------------------------------
// Plain Text Builder (WhatsApp-friendly)
// ---------------------------------------------------------------------------

function buildPlainText(
  dealerName: string,
  weekOf: string,
  content: string
): string {
  return [
    `VISIO AUTO | WEEKLY INTELLIGENCE BRIEF`,
    `${dealerName} — Week of ${weekOf}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    '',
    content,
    '',
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `Powered by Visio Auto AI`,
    `Upgrade: visio-auto.vercel.app`,
  ].join('\n')
}

// ---------------------------------------------------------------------------
// Fallback Newsletter (when AI fails)
// ---------------------------------------------------------------------------

function buildFallbackNewsletter(
  dealer: Pick<Dealer, 'id' | 'name' | 'brands' | 'area' | 'city' | 'tier'>,
  weekOf: string,
  signals: Signal[],
  leadStats?: { delivered: number; contacted: number; converted: number }
): Newsletter {
  const urgent = signals.filter((s) => s.buying_probability >= 80).length
  const warm = signals.filter(
    (s) => s.buying_probability >= 50 && s.buying_probability < 80
  ).length

  const content = [
    `This Week's Hot Signals`,
    `${signals.length} buying signals detected in your area. ${urgent} urgent, ${warm} warm.`,
    signals.slice(0, 5).map((s) => `- ${s.title} (${s.buying_probability}% probability)`).join('\n'),
    '',
    `Market Pulse`,
    `Your brands: ${dealer.brands?.join(', ') || 'Multi-brand'}. Check the terminal for full market data.`,
    '',
    `Your Leads Summary`,
    leadStats
      ? `${leadStats.delivered} leads delivered this week. ${leadStats.contacted} contacted, ${leadStats.converted} converted.`
      : 'No lead data available for this period.',
    '',
    `Opportunity Spotlight`,
    `Check the Visio Auto terminal for AI-identified opportunities in your area.`,
    '',
    `Industry News`,
    `Visit visio-auto.vercel.app/dashboard/terminal/news for the latest SA automotive news.`,
  ].join('\n')

  return {
    dealer_id: dealer.id,
    dealer_name: dealer.name,
    type: 'weekly',
    subject: `Weekly Intelligence Brief — ${dealer.name} — Week of ${weekOf}`,
    html: buildNewsletterHTML(dealer.name, weekOf, content, signals, leadStats),
    plain_text: buildPlainText(dealer.name, weekOf, content),
    generated_at: new Date().toISOString(),
  }
}
