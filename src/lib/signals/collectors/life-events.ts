/**
 * Life Events Signal Collector
 *
 * Searches for weddings, graduations, and new baby announcements
 * in Gauteng. Lower volume but high conversion — these people
 * are going through major life transitions that often include
 * vehicle purchases.
 */

import { scoreSignal } from '@/lib/ai/scoring'
import type { SignalType } from '@/lib/types'
import type { CollectedSignal } from './types'
import { googleSearch, extractLocation, extractPersonName } from './search'

interface LifeEventQuery {
  query: string
  signalType: SignalType
  vehicleType: string
  budgetMin: number
  budgetMax: number
}

const LIFE_EVENT_QUERIES: LifeEventQuery[] = [
  // Wedding signals
  {
    query: '"getting married" OR "engagement" Johannesburg OR Pretoria 2026 site:facebook.com',
    signalType: 'wedding',
    vehicleType: 'sedan',
    budgetMin: 250_000,
    budgetMax: 500_000,
  },
  {
    query: '"wedding" "Gauteng" OR "Johannesburg" announcement 2026',
    signalType: 'wedding',
    vehicleType: 'sedan',
    budgetMin: 300_000,
    budgetMax: 600_000,
  },
  // Graduation signals
  {
    query: '"just graduated" OR "graduation 2026" Gauteng OR Johannesburg OR Pretoria',
    signalType: 'graduation',
    vehicleType: 'hatch',
    budgetMin: 150_000,
    budgetMax: 350_000,
  },
  {
    query: '"cum laude" OR "honours degree" OR "graduated from" Johannesburg OR Pretoria 2026',
    signalType: 'graduation',
    vehicleType: 'hatch',
    budgetMin: 150_000,
    budgetMax: 400_000,
  },
  {
    query: '"Wits University" OR "University of Pretoria" OR "UJ" graduation 2026',
    signalType: 'graduation',
    vehicleType: 'hatch',
    budgetMin: 150_000,
    budgetMax: 350_000,
  },
  // New baby signals
  {
    query: '"new baby" OR "baby born" OR "we\'re expecting" Johannesburg site:facebook.com 2026',
    signalType: 'new_baby',
    vehicleType: 'suv',
    budgetMin: 300_000,
    budgetMax: 700_000,
  },
  {
    query: '"baby shower" OR "pregnant" Gauteng OR Johannesburg 2026 site:facebook.com',
    signalType: 'new_baby',
    vehicleType: 'suv',
    budgetMin: 300_000,
    budgetMax: 600_000,
  },
]

export async function collectLifeEventSignals(): Promise<CollectedSignal[]> {
  console.log('[life-events] Starting life events signal collection...')
  const signals: CollectedSignal[] = []
  const seenTitles = new Set<string>()

  for (const leq of LIFE_EVENT_QUERIES) {
    try {
      const results = await googleSearch(leq.query, 6)
      console.log(`[life-events] Query "${leq.query.slice(0, 50)}..." returned ${results.length} results (type: ${leq.signalType})`)

      for (const result of results) {
        const combined = `${result.title} ${result.snippet}`

        const location = extractLocation(combined)
        if (!location.city) {
          // Allow if SA-relevant
          if (!combined.toLowerCase().includes('south africa') && !combined.toLowerCase().includes('gauteng')) {
            continue
          }
        }

        const normalTitle = result.title.toLowerCase().slice(0, 60)
        if (seenTitles.has(normalTitle)) continue
        seenTitles.add(normalTitle)

        const scoring = scoreSignal(leq.signalType)
        const personName = extractPersonName(combined)

        signals.push({
          signal_type: leq.signalType,
          title: result.title.slice(0, 200),
          description: `${result.snippet || `Life event (${leq.signalType.replace(/_/g, ' ')}) detected.`} Location: ${location.area || location.city || 'Gauteng'}.`,
          person_name: personName,
          area: location.area,
          city: location.city || 'Johannesburg',
          province: 'Gauteng',
          data_source: 'google_life_events_search',
          source_url: result.url,
          signal_strength: scoring.strength,
          buying_probability: scoring.probability,
          estimated_budget_min: leq.budgetMin,
          estimated_budget_max: leq.budgetMax,
          vehicle_type_likely: leq.vehicleType,
        })
      }
    } catch (err) {
      console.error(`[life-events] Error for query:`, err)
    }
  }

  console.log(`[life-events] Collected ${signals.length} life event signals`)
  return signals
}
