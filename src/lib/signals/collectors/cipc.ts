/**
 * CIPC / New Business Registration Signal Collector
 *
 * Since CIPC doesn't have a public API, we search Google News for
 * recently registered businesses and company launches in Gauteng.
 */

import { scoreSignal } from '@/lib/ai/scoring'
import type { CollectedSignal } from './types'
import {
  googleSearch,
  extractLocation,
  extractCompanyName,
  extractPersonName,
} from './search'

const SEARCH_QUERIES = [
  '"new business registered" Johannesburg 2026',
  '"company launch" Gauteng 2026',
  '"CIPC registration" Johannesburg',
  '"new company" "Gauteng" registered site:linkedin.com OR site:news24.com',
  '"PTY LTD" registered Johannesburg 2026',
  '"startup launched" Johannesburg OR Pretoria Gauteng',
]

// Industry → likely vehicle type + budget range
const INDUSTRY_SIGNALS: Record<
  string,
  { probability: number; vehicle: string; budgetMin: number; budgetMax: number }
> = {
  logistics: { probability: 80, vehicle: 'bakkie', budgetMin: 400_000, budgetMax: 800_000 },
  transport: { probability: 80, vehicle: 'van', budgetMin: 500_000, budgetMax: 1_200_000 },
  construction: { probability: 75, vehicle: 'bakkie', budgetMin: 350_000, budgetMax: 700_000 },
  mining: { probability: 70, vehicle: 'bakkie', budgetMin: 500_000, budgetMax: 1_000_000 },
  delivery: { probability: 75, vehicle: 'van', budgetMin: 300_000, budgetMax: 600_000 },
  consulting: { probability: 60, vehicle: 'sedan', budgetMin: 400_000, budgetMax: 900_000 },
  property: { probability: 65, vehicle: 'suv', budgetMin: 500_000, budgetMax: 1_200_000 },
  'real estate': { probability: 65, vehicle: 'suv', budgetMin: 500_000, budgetMax: 1_200_000 },
  security: { probability: 70, vehicle: 'suv', budgetMin: 300_000, budgetMax: 600_000 },
  catering: { probability: 60, vehicle: 'van', budgetMin: 250_000, budgetMax: 500_000 },
  cleaning: { probability: 55, vehicle: 'van', budgetMin: 200_000, budgetMax: 400_000 },
}

export async function collectCIPCSignals(): Promise<CollectedSignal[]> {
  console.log('[cipc] Starting CIPC/new business signal collection...')
  const signals: CollectedSignal[] = []
  const seenTitles = new Set<string>()

  for (const query of SEARCH_QUERIES) {
    try {
      const results = await googleSearch(query, 8)
      console.log(`[cipc] Query "${query}" returned ${results.length} results`)

      for (const result of results) {
        const combined = `${result.title} ${result.snippet}`

        // Skip if no Gauteng relevance
        const location = extractLocation(combined)
        if (!location.city) continue

        // Skip duplicates
        const normalTitle = result.title.toLowerCase().slice(0, 60)
        if (seenTitles.has(normalTitle)) continue
        seenTitles.add(normalTitle)

        // Detect industry
        const lowerText = combined.toLowerCase()
        let industry: string | null = null
        let industryData = INDUSTRY_SIGNALS['consulting'] // default
        for (const [key, data] of Object.entries(INDUSTRY_SIGNALS)) {
          if (lowerText.includes(key)) {
            industry = key
            industryData = data
            break
          }
        }

        const companyName = extractCompanyName(combined)
        const personName = extractPersonName(combined)
        const scoring = scoreSignal('new_business')

        signals.push({
          signal_type: 'new_business',
          title: result.title.slice(0, 200),
          description: `${result.snippet || 'New business detected via web search.'}${industry ? ` Industry: ${industry}.` : ''} Location: ${location.area || location.city}, Gauteng.`,
          person_name: personName,
          company_name: companyName,
          area: location.area,
          city: location.city,
          province: 'Gauteng',
          data_source: 'google_cipc_search',
          source_url: result.url,
          signal_strength: scoring.strength,
          buying_probability: industryData.probability,
          estimated_budget_min: industryData.budgetMin,
          estimated_budget_max: industryData.budgetMax,
          vehicle_type_likely: industryData.vehicle,
        })
      }
    } catch (err) {
      console.error(`[cipc] Error for query "${query}":`, err)
    }
  }

  console.log(`[cipc] Collected ${signals.length} new business signals`)
  return signals
}
