/**
 * LinkedIn Job Change / Hiring Signal Collector
 *
 * Searches Google for LinkedIn activity indicating job changes,
 * promotions, and hiring in Gauteng — all of which correlate
 * with vehicle purchasing behavior.
 */

import { scoreSignal } from '@/lib/ai/scoring'
import type { CollectedSignal } from './types'
import {
  googleSearch,
  extractLocation,
  extractPersonName,
  extractCompanyName,
} from './search'

const SEARCH_QUERIES = [
  '"started a new position" site:linkedin.com Johannesburg OR Sandton OR Pretoria',
  '"excited to announce" "new role" site:linkedin.com Johannesburg OR Gauteng',
  '"promoted to" site:linkedin.com Johannesburg OR Sandton 2026',
  '"thrilled to share" "director" OR "manager" OR "VP" site:linkedin.com Gauteng',
  '"We\'re hiring" site:linkedin.com Johannesburg "fleet manager" OR "driver"',
  '"fleet manager" OR "logistics manager" hiring Johannesburg site:linkedin.com',
  '"head of" OR "VP" "started" Johannesburg site:linkedin.com 2026',
]

// Role keywords → signal type mapping
const ROLE_SIGNALS: {
  keywords: string[]
  signalType: 'job_change' | 'promotion' | 'hiring' | 'fleet_expansion'
  vehicleType: string
  budgetMin: number
  budgetMax: number
}[] = [
  {
    keywords: ['fleet manager', 'fleet director', 'fleet coordinator'],
    signalType: 'fleet_expansion',
    vehicleType: 'van',
    budgetMin: 2_000_000,
    budgetMax: 10_000_000,
  },
  {
    keywords: ['ceo', 'managing director', 'md', 'chief executive'],
    signalType: 'job_change',
    vehicleType: 'suv',
    budgetMin: 800_000,
    budgetMax: 2_000_000,
  },
  {
    keywords: ['director', 'vp', 'vice president', 'head of', 'partner'],
    signalType: 'promotion',
    vehicleType: 'suv',
    budgetMin: 600_000,
    budgetMax: 1_500_000,
  },
  {
    keywords: ['senior manager', 'general manager', 'regional manager'],
    signalType: 'promotion',
    vehicleType: 'sedan',
    budgetMin: 500_000,
    budgetMax: 1_000_000,
  },
  {
    keywords: ['hiring', "we're hiring", 'join our team', 'open position'],
    signalType: 'hiring',
    vehicleType: 'sedan',
    budgetMin: 300_000,
    budgetMax: 600_000,
  },
]

function detectRoleSignal(text: string) {
  const lower = text.toLowerCase()
  for (const role of ROLE_SIGNALS) {
    if (role.keywords.some((kw) => lower.includes(kw))) {
      return role
    }
  }
  return null
}

export async function collectLinkedInSignals(): Promise<CollectedSignal[]> {
  console.log('[linkedin] Starting LinkedIn signal collection...')
  const signals: CollectedSignal[] = []
  const seenTitles = new Set<string>()

  for (const query of SEARCH_QUERIES) {
    try {
      const results = await googleSearch(query, 8)
      console.log(`[linkedin] Query "${query.slice(0, 50)}..." returned ${results.length} results`)

      for (const result of results) {
        const combined = `${result.title} ${result.snippet}`

        // Must be Gauteng relevant
        const location = extractLocation(combined)
        if (!location.city) continue

        // Deduplicate
        const normalTitle = result.title.toLowerCase().slice(0, 60)
        if (seenTitles.has(normalTitle)) continue
        seenTitles.add(normalTitle)

        // Detect role type
        const roleSignal = detectRoleSignal(combined)
        const signalType = roleSignal?.signalType || 'job_change'
        const scoring = scoreSignal(signalType)

        const personName = extractPersonName(combined)
        const companyName = extractCompanyName(combined)

        // Extract LinkedIn URL if present
        const linkedinUrl = result.url.includes('linkedin.com') ? result.url : null

        signals.push({
          signal_type: signalType,
          title: result.title.slice(0, 200),
          description: `${result.snippet || 'Career change detected via LinkedIn search.'}${companyName ? ` Company: ${companyName}.` : ''} Location: ${location.area || location.city}, Gauteng.`,
          person_name: personName,
          person_linkedin: linkedinUrl,
          company_name: companyName,
          area: location.area,
          city: location.city,
          province: 'Gauteng',
          data_source: 'google_linkedin_search',
          source_url: result.url,
          signal_strength: scoring.strength,
          buying_probability: scoring.probability,
          estimated_budget_min: roleSignal?.budgetMin ?? 400_000,
          estimated_budget_max: roleSignal?.budgetMax ?? 800_000,
          vehicle_type_likely: roleSignal?.vehicleType ?? 'sedan',
        })
      }
    } catch (err) {
      console.error(`[linkedin] Error for query:`, err)
    }
  }

  console.log(`[linkedin] Collected ${signals.length} LinkedIn signals`)
  return signals
}
