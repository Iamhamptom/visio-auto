/**
 * Facebook Public Group Signal Collector
 *
 * Searches Google for public Facebook group posts with car buying intent.
 * No Facebook API needed — scrapes Google's cached Facebook content.
 * Also supports direct Playwright scraping of public groups.
 *
 * Target groups: SA car buying/selling groups
 * Intent: "looking for a Hilux", "bakkie te koop", "need a car urgently"
 */

import type { CollectedSignal } from './types'
import { googleSearch, extractLocation, extractPersonName } from './search'

// Google searches targeting Facebook group posts
const FACEBOOK_SEARCHES = [
  // English buying intent
  '"looking for" (car OR bakkie OR suv OR sedan) site:facebook.com South Africa',
  '"want to buy" (hilux OR ranger OR fortuner OR polo) site:facebook.com',
  '"need a car" (urgently OR budget OR finance) site:facebook.com Gauteng OR Johannesburg',
  '"in the market for" (vehicle OR car OR truck) site:facebook.com South Africa 2025 OR 2026',
  '"recommend" (dealer OR dealership) site:facebook.com Gauteng OR "Cape Town" OR Durban',
  '"test drove" OR "test drive" site:facebook.com South Africa (toyota OR bmw OR ford)',
  // Afrikaans buying intent
  '"soek n" (kar OR bakkie OR motor) site:facebook.com',
  '"te koop gesoek" (bakkie OR motor OR voertuig) site:facebook.com',
  '"wie kan help" (motor OR kar OR bakkie) site:facebook.com',
  // Marketplace / Group specific
  '"cars for sale" group site:facebook.com Johannesburg OR Pretoria OR "Cape Town"',
  '"used cars" group site:facebook.com South Africa (looking OR want OR need)',
  // Specific vehicle intent
  '"looking for a hilux" OR "hilux wanted" OR "need a hilux" site:facebook.com',
  '"looking for a ranger" OR "ranger wanted" site:facebook.com',
  '"looking for a fortuner" OR "fortuner wanted" site:facebook.com',
  '"looking for a polo" OR "polo wanted" site:facebook.com',
  '"looking for a bmw" OR "bmw wanted" site:facebook.com South Africa',
]

// Strong buying signals
const STRONG_KEYWORDS = [
  'looking for a', 'want to buy', 'need a car', 'budget of', 'cash buyer',
  'finance approved', 'pre-approved', 'ready to buy', 'urgently need',
  'soek n', 'wil koop', 'te koop gesoek', 'dringend',
  'anyone selling', 'who has', 'where can i find',
]

const MODERATE_KEYWORDS = [
  'looking for', 'thinking of buying', 'recommend a', 'which is better',
  'test drove', 'considering', 'should i buy', 'first car',
  'wie kan help', 'raad gee',
]

// Vehicle type extraction
const VEHICLE_PATTERNS: Record<string, string> = {
  'hilux': 'Toyota Hilux', 'fortuner': 'Toyota Fortuner', 'corolla': 'Toyota Corolla',
  'ranger': 'Ford Ranger', 'everest': 'Ford Everest', 'polo': 'Volkswagen Polo',
  'golf': 'Volkswagen Golf', 'tiguan': 'Volkswagen Tiguan', 'bmw 3': 'BMW 3 Series',
  'x3': 'BMW X3', 'x5': 'BMW X5', '320': 'BMW 320i', 'c-class': 'Mercedes C-Class',
  'c200': 'Mercedes C200', 'tucson': 'Hyundai Tucson', 'creta': 'Hyundai Creta',
  'navara': 'Nissan Navara', 'jimny': 'Suzuki Jimny', 'cx-5': 'Mazda CX-5',
  'd-max': 'Isuzu D-MAX', 'bakkie': 'Bakkie (general)', 'suv': 'SUV (general)',
  'sedan': 'Sedan (general)', 'hatchback': 'Hatchback (general)',
}

function detectIntent(text: string): 'strong' | 'medium' | 'weak' {
  const lower = text.toLowerCase()
  if (STRONG_KEYWORDS.some(kw => lower.includes(kw))) return 'strong'
  if (MODERATE_KEYWORDS.some(kw => lower.includes(kw))) return 'medium'
  return 'weak'
}

function detectVehicle(text: string): string | null {
  const lower = text.toLowerCase()
  for (const [pattern, vehicle] of Object.entries(VEHICLE_PATTERNS)) {
    if (lower.includes(pattern)) return vehicle
  }
  return null
}

function estimateBudget(text: string, vehicle: string | null): { min: number; max: number } {
  const lower = text.toLowerCase()

  // Try to extract explicit budget mentions
  const budgetMatch = lower.match(/(?:budget|r)\s*(\d{3,})\s*(?:k|000)?/i)
  if (budgetMatch) {
    let amount = parseInt(budgetMatch[1])
    if (amount < 1000) amount *= 1000 // "R500k" -> R500000
    return { min: amount * 0.8, max: amount * 1.2 }
  }

  // Estimate by vehicle type
  if (vehicle?.includes('BMW') || vehicle?.includes('Mercedes') || vehicle?.includes('Audi')) {
    return { min: 500000, max: 1200000 }
  }
  if (vehicle?.includes('Hilux') || vehicle?.includes('Ranger') || vehicle?.includes('Fortuner')) {
    return { min: 400000, max: 900000 }
  }
  if (vehicle?.includes('Polo') || vehicle?.includes('Creta') || vehicle?.includes('i20')) {
    return { min: 200000, max: 450000 }
  }
  return { min: 250000, max: 700000 }
}

export async function collectFacebookSignals(): Promise<CollectedSignal[]> {
  const signals: CollectedSignal[] = []

  // Use 8 searches (within free Google CSE limits)
  const searches = FACEBOOK_SEARCHES.slice(0, 8)

  for (const query of searches) {
    try {
      const results = await googleSearch(query, 5)

      for (const result of results) {
        const text = `${result.title || ''} ${result.snippet || ''}`
        const intent = detectIntent(text)

        if (intent === 'weak') continue

        const { area, city } = extractLocation(text)
        const locationText = city || area || 'SA'
        const person = extractPersonName(text)
        const vehicle = detectVehicle(text)
        const budget = estimateBudget(text, vehicle)

        signals.push({
          signal_type: 'social_intent',
          title: `Facebook: ${person || 'Unknown'} — ${vehicle || 'car'} intent in ${locationText}`,
          description: result.snippet || text.substring(0, 200),
          person_name: person || null,
          data_source: 'facebook',
          source_url: result.url || null,
          signal_strength: intent === 'strong' ? 'strong' : 'medium',
          buying_probability: intent === 'strong' ? 72 : 48,
          area: area,
          city: city,
          province: null,
          vehicle_type_likely: vehicle,
          estimated_budget_min: budget.min,
          estimated_budget_max: budget.max,
        })
      }
    } catch (err) {
      console.error(`[facebook] Search failed:`, err)
    }

    // Respect rate limits
    await new Promise(r => setTimeout(r, 2000))
  }

  console.log(`[facebook] Collected ${signals.length} buying intent signals from Facebook`)
  return signals
}

export default collectFacebookSignals
