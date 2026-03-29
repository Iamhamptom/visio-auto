/**
 * Property / Relocation Signal Collector
 *
 * Finds new housing developments, apartment completions,
 * relocation announcements, and expat arrivals in Gauteng.
 * People who move NEED cars.
 */

import { scoreSignal } from '@/lib/ai/scoring'
import type { CollectedSignal } from './types'
import { googleSearch, extractLocation, extractPersonName } from './search'

const SEARCH_QUERIES = [
  '"new housing development" Johannesburg 2026',
  '"apartments completed" OR "new estate" Gauteng 2026',
  '"relocating to Johannesburg" OR "moving to Johannesburg" 2026',
  '"expat" Johannesburg OR Pretoria "moving to" OR "relocating" 2026',
  '"Steyn City" OR "Waterfall" OR "Midstream" "new phase" OR "launched" 2026',
  '"new development" Sandton OR Centurion OR Midrand "units" OR "homes"',
  'site:internations.org "Johannesburg" "moving" OR "relocating"',
  '"transferred to" Johannesburg OR Pretoria OR Gauteng 2026',
]

// Development size heuristics
function estimateDevelopmentSize(text: string): number {
  const lower = text.toLowerCase()
  const numberMatch = lower.match(/(\d+)\s*(?:units?|homes?|plots?|apartments?|houses?)/i)
  if (numberMatch) return parseInt(numberMatch[1])
  if (lower.includes('estate') || lower.includes('complex')) return 50
  return 10
}

export async function collectPropertySignals(): Promise<CollectedSignal[]> {
  console.log('[property] Starting property/relocation signal collection...')
  const signals: CollectedSignal[] = []
  const seenTitles = new Set<string>()

  for (const query of SEARCH_QUERIES) {
    try {
      const results = await googleSearch(query, 8)
      console.log(`[property] Query "${query.slice(0, 50)}..." returned ${results.length} results`)

      for (const result of results) {
        const combined = `${result.title} ${result.snippet}`
        const lower = combined.toLowerCase()

        const location = extractLocation(combined)
        if (!location.city) continue

        const normalTitle = result.title.toLowerCase().slice(0, 60)
        if (seenTitles.has(normalTitle)) continue
        seenTitles.add(normalTitle)

        // Determine signal type
        let signalType: 'housing_development' | 'new_apartment' | 'relocation' | 'expat_arrival' =
          'relocation'

        if (lower.includes('expat') || lower.includes('internations') || lower.includes('emigrat')) {
          signalType = 'expat_arrival'
        } else if (lower.includes('development') || lower.includes('estate') || lower.includes('phase')) {
          signalType = 'housing_development'
        } else if (lower.includes('apartment') || lower.includes('flat') || lower.includes('unit')) {
          signalType = 'new_apartment'
        }

        const scoring = scoreSignal(signalType)
        const personName = extractPersonName(combined)
        const devSize = estimateDevelopmentSize(combined)

        // Budget estimate varies by signal type
        let budgetMin = 300_000
        let budgetMax = 600_000
        let vehicleType = 'sedan'

        if (signalType === 'expat_arrival') {
          budgetMin = 500_000
          budgetMax = 1_200_000
          vehicleType = 'suv'
        } else if (signalType === 'housing_development') {
          // Luxury developments = higher budget
          if (lower.includes('luxury') || lower.includes('steyn') || lower.includes('waterfall')) {
            budgetMin = 700_000
            budgetMax = 2_000_000
            vehicleType = 'suv'
          } else {
            budgetMin = 250_000
            budgetMax = 500_000
          }
        }

        signals.push({
          signal_type: signalType,
          title: result.title.slice(0, 200),
          description: `${result.snippet || 'Property/relocation signal detected.'}${signalType === 'housing_development' ? ` ~${devSize} units.` : ''} Location: ${location.area || location.city}, Gauteng.`,
          person_name: personName,
          area: location.area,
          city: location.city,
          province: 'Gauteng',
          data_source: 'google_property_search',
          source_url: result.url,
          signal_strength: scoring.strength,
          buying_probability: scoring.probability,
          estimated_budget_min: budgetMin,
          estimated_budget_max: budgetMax,
          vehicle_type_likely: vehicleType,
        })
      }
    } catch (err) {
      console.error(`[property] Error for query:`, err)
    }
  }

  console.log(`[property] Collected ${signals.length} property signals`)
  return signals
}
