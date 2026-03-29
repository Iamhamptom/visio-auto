/**
 * RSS Feed Signal Collector
 *
 * Fetches Google Alerts RSS feeds and public SA business news RSS feeds,
 * parses XML entries, and converts them to signals based on keyword matching.
 *
 * Uses regex-based XML parsing — no external XML dependencies required.
 */

import { scoreSignal } from '@/lib/ai/scoring'
import type { SignalType } from '@/lib/types'
import type { CollectedSignal } from './types'
import { extractLocation, extractCompanyName, extractPersonName } from './search'

// ---------------------------------------------------------------------------
// RSS feed sources
// ---------------------------------------------------------------------------

function getRSSFeeds(): string[] {
  const feeds: string[] = []

  // Google Alerts (user-configured via env vars)
  for (let i = 1; i <= 5; i++) {
    const url = process.env[`GOOGLE_ALERTS_RSS_${i}`]
    if (url) feeds.push(url)
  }

  // Public SA business news RSS
  feeds.push(
    'https://www.news24.com/fin24/rss',
    'https://www.itweb.co.za/rss',
    'https://www.bizcommunity.com/RSS/196/1.xml',
  )

  return feeds
}

// ---------------------------------------------------------------------------
// Keyword → SignalType mapping
// ---------------------------------------------------------------------------

interface KeywordRule {
  keywords: RegExp
  signalType: SignalType
  vehicleType: string | null
  budgetMin: number | null
  budgetMax: number | null
}

const KEYWORD_RULES: KeywordRule[] = [
  {
    keywords: /\b(registered|new company|cipc|pty\b|new business)/i,
    signalType: 'new_business',
    vehicleType: 'suv',
    budgetMin: 400_000,
    budgetMax: 900_000,
  },
  {
    keywords: /\b(funding|series [abc]|raised|investment round|secured funding)/i,
    signalType: 'funding_round',
    vehicleType: 'suv',
    budgetMin: 500_000,
    budgetMax: 1_500_000,
  },
  {
    keywords: /\b(contract|tender|awarded)/i,
    signalType: 'contract_won',
    vehicleType: 'bakkie',
    budgetMin: 350_000,
    budgetMax: 700_000,
  },
  {
    keywords: /\b(hired|hiring|fleet manager|vacancy|vacancies|recruiting)/i,
    signalType: 'hiring',
    vehicleType: null,
    budgetMin: 250_000,
    budgetMax: 500_000,
  },
  {
    keywords: /\b(hail|flood|accident|write-off|write off|damaged|collision)/i,
    signalType: 'insurance_claim',
    vehicleType: null,
    budgetMin: 200_000,
    budgetMax: 600_000,
  },
  {
    keywords: /\b(interest rate|sarb|repo rate)/i,
    signalType: 'interest_rate_change',
    vehicleType: null,
    budgetMin: null,
    budgetMax: null,
  },
  {
    keywords: /\b(dealership.{0,15}clos|shut\s*down|liquidat)/i,
    signalType: 'competitor_closing',
    vehicleType: null,
    budgetMin: null,
    budgetMax: null,
  },
  {
    keywords: /\b(housing|estate|development|apartments|residential)/i,
    signalType: 'housing_development',
    vehicleType: 'suv',
    budgetMin: 300_000,
    budgetMax: 700_000,
  },
  {
    keywords: /\b(relocated|moving to|expat|immigrat)/i,
    signalType: 'relocation',
    vehicleType: 'suv',
    budgetMin: 350_000,
    budgetMax: 800_000,
  },
]

// ---------------------------------------------------------------------------
// Lightweight XML parsing (no dependencies)
// ---------------------------------------------------------------------------

interface RSSItem {
  title: string
  description: string
  link: string
  pubDate: string | null
}

/** Extract text content between XML tags */
function xmlTag(xml: string, tag: string): string {
  // Try CDATA first
  const cdataRe = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i')
  const cdataMatch = xml.match(cdataRe)
  if (cdataMatch) return cdataMatch[1].trim()

  // Plain text
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
  const match = xml.match(re)
  return match ? match[1].replace(/<[^>]+>/g, '').trim() : ''
}

/** Extract href from Atom <link> elements */
function atomLink(xml: string): string {
  const match = xml.match(/<link[^>]+href="([^"]+)"[^>]*\/?>/)
  return match ? match[1] : xmlTag(xml, 'link')
}

/** Parse RSS 2.0 or Atom feed XML into items */
function parseFeed(xml: string): RSSItem[] {
  const items: RSSItem[] = []

  // RSS 2.0: <item>...</item>
  const rssItems = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || []
  for (const chunk of rssItems) {
    items.push({
      title: xmlTag(chunk, 'title'),
      description: xmlTag(chunk, 'description') || xmlTag(chunk, 'content:encoded'),
      link: xmlTag(chunk, 'link'),
      pubDate: xmlTag(chunk, 'pubDate') || xmlTag(chunk, 'dc:date') || null,
    })
  }

  // Atom: <entry>...</entry>
  if (items.length === 0) {
    const atomEntries = xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || []
    for (const chunk of atomEntries) {
      items.push({
        title: xmlTag(chunk, 'title'),
        description: xmlTag(chunk, 'summary') || xmlTag(chunk, 'content'),
        link: atomLink(chunk),
        pubDate: xmlTag(chunk, 'published') || xmlTag(chunk, 'updated') || null,
      })
    }
  }

  return items
}

// ---------------------------------------------------------------------------
// Classify an RSS item into a signal type
// ---------------------------------------------------------------------------

function classifyItem(text: string): KeywordRule | null {
  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.test(text)) return rule
  }
  return null
}

// ---------------------------------------------------------------------------
// Strip HTML entities
// ---------------------------------------------------------------------------

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

// ---------------------------------------------------------------------------
// Main collector
// ---------------------------------------------------------------------------

export async function collectRSSSignals(): Promise<CollectedSignal[]> {
  const feeds = getRSSFeeds()
  console.log(`[rss] Starting RSS collection from ${feeds.length} feeds...`)

  const signals: CollectedSignal[] = []
  const seenTitles = new Set<string>()

  for (const feedUrl of feeds) {
    try {
      const res = await fetch(feedUrl, {
        signal: AbortSignal.timeout(15_000),
        headers: { 'User-Agent': 'VisioAuto/1.0 RSS Reader' },
      })

      if (!res.ok) {
        console.warn(`[rss] Feed ${feedUrl} returned ${res.status}`)
        continue
      }

      const xml = await res.text()
      const items = parseFeed(xml)
      console.log(`[rss] Feed ${feedUrl.slice(0, 60)}... returned ${items.length} items`)

      for (const item of items) {
        if (!item.title) continue

        const title = decodeEntities(item.title)
        const description = decodeEntities(item.description || '')
        const combined = `${title} ${description}`

        // Deduplicate by normalized title
        const normalKey = title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 80)
        if (seenTitles.has(normalKey)) continue
        seenTitles.add(normalKey)

        // Classify by keywords
        const rule = classifyItem(combined)
        if (!rule) continue // No matching signal type — skip

        const scoring = scoreSignal(rule.signalType)
        const location = extractLocation(combined)
        const companyName = extractCompanyName(combined)
        const personName = extractPersonName(combined)

        signals.push({
          signal_type: rule.signalType,
          title: title.slice(0, 200),
          description: `${description.slice(0, 300)}${companyName ? ` Company: ${companyName}.` : ''} Location: ${location.area || location.city || 'South Africa'}.`,
          person_name: personName,
          company_name: companyName,
          area: location.area,
          city: location.city || null,
          province: 'Gauteng',
          data_source: 'rss_feed',
          source_url: item.link || feedUrl,
          signal_strength: scoring.strength,
          buying_probability: scoring.probability,
          estimated_budget_min: rule.budgetMin,
          estimated_budget_max: rule.budgetMax,
          vehicle_type_likely: rule.vehicleType,
        })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[rss] Error fetching ${feedUrl}:`, msg)
    }

    // Brief pause between feeds
    await new Promise((r) => setTimeout(r, 500))
  }

  console.log(`[rss] Collected ${signals.length} RSS signals from ${feeds.length} feeds`)
  return signals
}
