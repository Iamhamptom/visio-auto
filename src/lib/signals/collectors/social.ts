/**
 * Social Media Signal Collector
 *
 * Searches Google for social media posts expressing car-buying intent.
 * Also provides a webhook ingestion framework for PhantomBuster data.
 */

import { scoreSignal } from '@/lib/ai/scoring'
import type { CollectedSignal } from './types'
import { googleSearch, extractLocation, extractPersonName } from './search'

const SEARCH_QUERIES = [
  '"looking for a car" Johannesburg OR Gauteng site:facebook.com',
  '"need a car" Johannesburg OR Pretoria site:facebook.com',
  '"buying a car" Gauteng OR Johannesburg 2026 site:facebook.com',
  '"recommend a dealer" OR "which dealership" Johannesburg site:facebook.com',
  '"car advice" OR "which car should" Johannesburg site:reddit.com',
  '"first car" buying Johannesburg OR Gauteng 2026',
  '"car shopping" OR "test drive" Johannesburg site:twitter.com OR site:x.com',
  'car review South Africa Gauteng site:youtube.com 2026',
]

// Keywords that indicate strong buying intent
const STRONG_INTENT_KEYWORDS = [
  'looking to buy',
  'want to buy',
  'need a car',
  'in the market for',
  'budget of',
  'test drive',
  'recommend a dealer',
  'which dealership',
  'finance approved',
  'pre-approved',
  'ready to buy',
]

const MODERATE_INTENT_KEYWORDS = [
  'looking for a car',
  'car advice',
  'which car should',
  'first car',
  'car shopping',
  'thinking of buying',
  'save up for',
]

function detectIntent(text: string): 'strong' | 'medium' | 'weak' {
  const lower = text.toLowerCase()
  if (STRONG_INTENT_KEYWORDS.some((kw) => lower.includes(kw))) return 'strong'
  if (MODERATE_INTENT_KEYWORDS.some((kw) => lower.includes(kw))) return 'medium'
  return 'weak'
}

function detectBrand(text: string): string | null {
  const brands = [
    'toyota',
    'volkswagen',
    'vw',
    'ford',
    'bmw',
    'mercedes',
    'audi',
    'hyundai',
    'kia',
    'nissan',
    'mazda',
    'suzuki',
    'haval',
    'chery',
    'isuzu',
    'jeep',
    'land rover',
    'range rover',
    'porsche',
    'volvo',
    'renault',
    'peugeot',
    'opel',
    'honda',
    'mitsubishi',
    'subaru',
    'gwm',
    'baic',
    'mahindra',
  ]

  const lower = text.toLowerCase()
  for (const brand of brands) {
    if (lower.includes(brand)) {
      if (brand === 'vw') return 'Volkswagen'
      return brand.charAt(0).toUpperCase() + brand.slice(1)
    }
  }
  return null
}

export async function collectSocialSignals(): Promise<CollectedSignal[]> {
  console.log('[social] Starting social media signal collection...')
  const signals: CollectedSignal[] = []
  const seenTitles = new Set<string>()

  for (const query of SEARCH_QUERIES) {
    try {
      const results = await googleSearch(query, 6)
      console.log(`[social] Query "${query.slice(0, 50)}..." returned ${results.length} results`)

      for (const result of results) {
        const combined = `${result.title} ${result.snippet}`

        const location = extractLocation(combined)
        // Social signals: allow even without exact area (just Gauteng mention is fine)
        if (!location.city && !combined.toLowerCase().includes('south africa')) continue

        const normalTitle = result.title.toLowerCase().slice(0, 60)
        if (seenTitles.has(normalTitle)) continue
        seenTitles.add(normalTitle)

        const intent = detectIntent(combined)
        const scoring = scoreSignal('social_intent')
        const personName = extractPersonName(combined)
        const brand = detectBrand(combined)

        // Adjust probability based on intent strength
        let probability = scoring.probability
        if (intent === 'strong') probability = Math.min(probability + 15, 90)
        if (intent === 'weak') probability = Math.max(probability - 15, 20)

        signals.push({
          signal_type: 'social_intent',
          title: result.title.slice(0, 200),
          description: `${result.snippet || 'Social media buying intent detected.'}${brand ? ` Brand interest: ${brand}.` : ''} Intent level: ${intent}. Location: ${location.area || location.city || 'Gauteng'}.`,
          person_name: personName,
          area: location.area,
          city: location.city || 'Johannesburg',
          province: 'Gauteng',
          data_source: 'google_social_search',
          source_url: result.url,
          signal_strength: intent === 'strong' ? 'strong' : intent === 'medium' ? 'medium' : 'weak',
          buying_probability: probability,
          estimated_budget_min: 200_000,
          estimated_budget_max: 600_000,
          vehicle_type_likely: null,
        })
      }
    } catch (err) {
      console.error(`[social] Error for query:`, err)
    }
  }

  console.log(`[social] Collected ${signals.length} social signals`)
  return signals
}

/**
 * Process a PhantomBuster webhook payload into signals.
 * Call this from the /api/signals/social/ingest endpoint.
 */
export function processPhantomBusterPayload(
  payload: Record<string, unknown>[]
): CollectedSignal[] {
  const signals: CollectedSignal[] = []

  for (const item of payload) {
    const text = String(item.text || item.content || item.post || '')
    const name = String(item.name || item.fullName || item.profileName || '')
    const url = String(item.url || item.postUrl || item.profileUrl || '')
    const platform = String(item.platform || item.source || 'unknown')

    if (!text) continue

    const location = extractLocation(text)
    const intent = detectIntent(text)
    const brand = detectBrand(text)
    const scoring = scoreSignal('social_intent')

    signals.push({
      signal_type: 'social_intent',
      title: `Social intent: ${name || 'Unknown'} — ${platform}`,
      description: text.slice(0, 500),
      person_name: name || null,
      area: location.area,
      city: location.city || 'Johannesburg',
      province: 'Gauteng',
      data_source: `phantombuster_${platform}`,
      source_url: url || null,
      signal_strength: intent === 'strong' ? 'strong' : scoring.strength,
      buying_probability: intent === 'strong' ? 70 : scoring.probability,
      estimated_budget_min: 200_000,
      estimated_budget_max: 600_000,
      vehicle_type_likely: brand ? null : null, // Could be enhanced later
    })
  }

  return signals
}
