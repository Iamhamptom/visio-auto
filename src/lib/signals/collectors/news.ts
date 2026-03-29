/**
 * News & Events Signal Collector
 *
 * Searches Google News for funding rounds, contracts won,
 * hail/flood damage, interest rate changes, and competitor closings
 * in the Gauteng automotive market.
 */

import { scoreSignal } from '@/lib/ai/scoring'
import type { SignalType } from '@/lib/types'
import type { CollectedSignal } from './types'
import { googleSearch, extractLocation, extractCompanyName, extractPersonName } from './search'

interface NewsQuery {
  query: string
  signalType: SignalType
  vehicleType: string | null
  budgetMin: number | null
  budgetMax: number | null
}

const NEWS_QUERIES: NewsQuery[] = [
  // Funding rounds
  {
    query: '"funding round" OR "series A" OR "series B" OR "raised" Johannesburg OR Gauteng 2026',
    signalType: 'funding_round',
    vehicleType: 'suv',
    budgetMin: 500_000,
    budgetMax: 1_500_000,
  },
  {
    query: '"secured funding" OR "investment round" Gauteng startup 2026',
    signalType: 'funding_round',
    vehicleType: 'suv',
    budgetMin: 400_000,
    budgetMax: 1_000_000,
  },
  // Contracts won
  {
    query: '"contract awarded" OR "won contract" OR "secured contract" Johannesburg OR Gauteng 2026',
    signalType: 'contract_won',
    vehicleType: 'bakkie',
    budgetMin: 400_000,
    budgetMax: 800_000,
  },
  {
    query: '"tender awarded" Gauteng OR Johannesburg OR Pretoria 2026',
    signalType: 'contract_won',
    vehicleType: 'bakkie',
    budgetMin: 350_000,
    budgetMax: 700_000,
  },
  // Insurance claims / weather damage
  {
    query: '"hail damage" OR "hailstorm" Gauteng cars 2026',
    signalType: 'insurance_claim',
    vehicleType: null,
    budgetMin: 250_000,
    budgetMax: 600_000,
  },
  {
    query: '"flood damage" OR "flooding" Johannesburg cars vehicles 2026',
    signalType: 'insurance_claim',
    vehicleType: null,
    budgetMin: 200_000,
    budgetMax: 500_000,
  },
  // Interest rate changes
  {
    query: '"interest rate" "repo rate" SARB South Africa 2026 cut OR increase',
    signalType: 'interest_rate_change',
    vehicleType: null,
    budgetMin: null,
    budgetMax: null,
  },
  // Competitor closings
  {
    query: '"dealership closing" OR "dealer closed" OR "shutting down" Gauteng automotive 2026',
    signalType: 'competitor_closing',
    vehicleType: null,
    budgetMin: null,
    budgetMax: null,
  },
  {
    query: '"dealership" "closing down" OR "liquidation" Johannesburg OR Pretoria 2026',
    signalType: 'competitor_closing',
    vehicleType: null,
    budgetMin: null,
    budgetMax: null,
  },
]

export async function collectNewsSignals(): Promise<CollectedSignal[]> {
  console.log('[news] Starting news & events signal collection...')
  const signals: CollectedSignal[] = []
  const seenTitles = new Set<string>()

  for (const nq of NEWS_QUERIES) {
    try {
      const results = await googleSearch(nq.query, 6)
      console.log(`[news] Query "${nq.query.slice(0, 50)}..." returned ${results.length} results (type: ${nq.signalType})`)

      for (const result of results) {
        const combined = `${result.title} ${result.snippet}`

        // For interest rate changes, don't require Gauteng location
        const location = extractLocation(combined)
        if (nq.signalType !== 'interest_rate_change' && !location.city) {
          // Check for South Africa mention at least
          if (!combined.toLowerCase().includes('south africa') && !combined.toLowerCase().includes('gauteng')) {
            continue
          }
        }

        const normalTitle = result.title.toLowerCase().slice(0, 60)
        if (seenTitles.has(normalTitle)) continue
        seenTitles.add(normalTitle)

        const scoring = scoreSignal(nq.signalType)
        const companyName = extractCompanyName(combined)
        const personName = extractPersonName(combined)

        // Extract funding amount if present
        let fundingNote = ''
        const amountMatch = combined.match(/[R$]\s?(\d+(?:\.\d+)?)\s*(?:million|m|billion|b)/i)
        if (amountMatch) {
          fundingNote = ` Amount: ${amountMatch[0].trim()}.`
        }

        signals.push({
          signal_type: nq.signalType,
          title: result.title.slice(0, 200),
          description: `${result.snippet || `${nq.signalType.replace(/_/g, ' ')} detected.`}${fundingNote}${companyName ? ` Company: ${companyName}.` : ''} Location: ${location.area || location.city || 'Gauteng'}.`,
          person_name: personName,
          company_name: companyName,
          area: location.area,
          city: location.city || (nq.signalType === 'interest_rate_change' ? null : 'Johannesburg'),
          province: 'Gauteng',
          data_source: 'google_news_search',
          source_url: result.url,
          signal_strength: scoring.strength,
          buying_probability: scoring.probability,
          estimated_budget_min: nq.budgetMin,
          estimated_budget_max: nq.budgetMax,
          vehicle_type_likely: nq.vehicleType,
        })
      }
    } catch (err) {
      console.error(`[news] Error for query:`, err)
    }
  }

  console.log(`[news] Collected ${signals.length} news signals`)
  return signals
}
