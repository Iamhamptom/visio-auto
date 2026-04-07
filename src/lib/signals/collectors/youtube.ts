/**
 * YouTube Comment Signal Collector
 *
 * Uses YouTube Data API v3 (FREE — 10,000 units/day) to find
 * car buying intent in comments on SA car review videos.
 *
 * Channels: Cars.co.za, AutoTrader SA, Ignition TV, SA car reviewers
 * Intent: "where can I buy", "how much", "price", "dealer near me"
 */

import type { CollectedSignal } from './types'

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || ''
const API_BASE = 'https://www.googleapis.com/youtube/v3'

// SA car review search queries
const VIDEO_SEARCHES = [
  'Toyota Hilux 2025 review South Africa',
  'best SUV South Africa 2025',
  'Ford Ranger review South Africa',
  'BMW 3 Series South Africa price',
  'Volkswagen Polo review South Africa',
  'Hyundai Tucson South Africa',
  'bakkie review South Africa 2025',
  'best car to buy South Africa',
  'car finance South Africa tips',
  'Isuzu D-MAX review South Africa',
]

// Intent keywords in comments
const STRONG_INTENT = [
  'where can i buy', 'how much', 'price', 'dealer', 'looking to buy',
  'want to buy', 'in the market', 'budget', 'finance', 'test drive',
  'nearest dealer', 'available in', 'pre-approved', 'ready to buy',
  'can someone help me find', 'need a', 'want this car',
]

const MODERATE_INTENT = [
  'i want', 'love this', 'my next car', 'saving up', 'thinking about',
  'anyone bought', 'worth it', 'recommend', 'better than', 'should i buy',
]

// SA locations in comments
const SA_LOCATIONS: Record<string, { area: string; city: string; province: string }> = {
  'johannesburg': { area: 'Johannesburg', city: 'Johannesburg', province: 'Gauteng' },
  'joburg': { area: 'Johannesburg', city: 'Johannesburg', province: 'Gauteng' },
  'jhb': { area: 'Johannesburg', city: 'Johannesburg', province: 'Gauteng' },
  'pretoria': { area: 'Pretoria', city: 'Pretoria', province: 'Gauteng' },
  'pta': { area: 'Pretoria', city: 'Pretoria', province: 'Gauteng' },
  'cape town': { area: 'Cape Town', city: 'Cape Town', province: 'Western Cape' },
  'durban': { area: 'Durban', city: 'Durban', province: 'KwaZulu-Natal' },
  'polokwane': { area: 'Polokwane', city: 'Polokwane', province: 'Limpopo' },
  'bloemfontein': { area: 'Bloemfontein', city: 'Bloemfontein', province: 'Free State' },
  'nelspruit': { area: 'Nelspruit', city: 'Nelspruit', province: 'Mpumalanga' },
  'east london': { area: 'East London', city: 'East London', province: 'Eastern Cape' },
  'port elizabeth': { area: 'Port Elizabeth', city: 'Port Elizabeth', province: 'Eastern Cape' },
  'sandton': { area: 'Sandton', city: 'Johannesburg', province: 'Gauteng' },
  'centurion': { area: 'Centurion', city: 'Pretoria', province: 'Gauteng' },
  'midrand': { area: 'Midrand', city: 'Johannesburg', province: 'Gauteng' },
  'fourways': { area: 'Fourways', city: 'Johannesburg', province: 'Gauteng' },
  'umhlanga': { area: 'Umhlanga', city: 'Durban', province: 'KwaZulu-Natal' },
  'stellenbosch': { area: 'Stellenbosch', city: 'Cape Town', province: 'Western Cape' },
  'rustenburg': { area: 'Rustenburg', city: 'Rustenburg', province: 'North West' },
  'potchefstroom': { area: 'Potchefstroom', city: 'Potchefstroom', province: 'North West' },
  'gauteng': { area: 'Gauteng', city: 'Johannesburg', province: 'Gauteng' },
  'south africa': { area: '', city: '', province: '' },
}

// Brand detection
const BRANDS = [
  'toyota', 'hilux', 'fortuner', 'corolla', 'bmw', 'mercedes', 'benz',
  'volkswagen', 'vw', 'polo', 'golf', 'ford', 'ranger', 'everest',
  'nissan', 'navara', 'hyundai', 'tucson', 'creta', 'kia', 'sportage',
  'suzuki', 'jimny', 'mazda', 'isuzu', 'd-max', 'honda', 'volvo',
  'audi', 'land rover', 'defender', 'haval', 'gwm', 'chery',
]

async function ytFetch(endpoint: string, params: Record<string, string>): Promise<unknown> {
  if (!YOUTUBE_API_KEY) return null
  const qs = new URLSearchParams({ ...params, key: YOUTUBE_API_KEY }).toString()
  const res = await fetch(`${API_BASE}/${endpoint}?${qs}`)
  if (!res.ok) return null
  return res.json()
}

function detectIntent(text: string): 'strong' | 'medium' | 'weak' {
  const lower = text.toLowerCase()
  if (STRONG_INTENT.some(kw => lower.includes(kw))) return 'strong'
  if (MODERATE_INTENT.some(kw => lower.includes(kw))) return 'medium'
  return 'weak'
}

function detectLocation(text: string): { area: string; city: string; province: string } {
  const lower = text.toLowerCase()
  for (const [keyword, loc] of Object.entries(SA_LOCATIONS)) {
    if (lower.includes(keyword)) return loc
  }
  return { area: '', city: '', province: 'Gauteng' }
}

function detectBrand(text: string): string | null {
  const lower = text.toLowerCase()
  for (const brand of BRANDS) {
    if (lower.includes(brand)) return brand
  }
  return null
}

export async function collectYouTubeSignals(): Promise<CollectedSignal[]> {
  const signals: CollectedSignal[] = []

  if (!YOUTUBE_API_KEY) {
    console.log('[youtube] No YOUTUBE_API_KEY — using fallback Google search method')
    return collectViaGoogleSearch()
  }

  for (const query of VIDEO_SEARCHES.slice(0, 5)) {
    // Search for videos (costs 100 units per search)
    const searchResult = await ytFetch('search', {
      part: 'snippet',
      q: query,
      type: 'video',
      regionCode: 'ZA',
      maxResults: '3',
      order: 'date',
    }) as { items?: { id: { videoId: string }; snippet: { title: string } }[] } | null

    if (!searchResult?.items) continue

    for (const video of searchResult.items) {
      const videoId = video.id.videoId
      const videoTitle = video.snippet.title

      // Get comments (costs 1 unit per comment thread request)
      const comments = await ytFetch('commentThreads', {
        part: 'snippet',
        videoId,
        maxResults: '50',
        order: 'time',
        textFormat: 'plainText',
      }) as { items?: { snippet: { topLevelComment: { snippet: { textDisplay: string; authorDisplayName: string; publishedAt: string } } } }[] } | null

      if (!comments?.items) continue

      for (const item of comments.items) {
        const comment = item.snippet.topLevelComment.snippet
        const text = comment.textDisplay
        const intent = detectIntent(text)

        if (intent === 'weak') continue // Skip low-intent comments

        const location = detectLocation(text)
        const brand = detectBrand(text) || detectBrand(videoTitle)
        const name = comment.authorDisplayName

        signals.push({
          signal_type: 'social_intent',
          title: `YouTube: ${name} — "${text.substring(0, 80)}..."`,
          description: `Comment on "${videoTitle}": ${text}`,
          person_name: name,
          data_source: 'youtube',
          source_url: `https://youtube.com/watch?v=${videoId}`,
          signal_strength: intent === 'strong' ? 'strong' : 'medium',
          buying_probability: intent === 'strong' ? 70 : 45,
          area: location.area || null,
          city: location.city || null,
          province: location.province || 'Gauteng',
          vehicle_type_likely: brand ? `${brand} (from video context)` : null,
          estimated_budget_min: brand?.includes('bmw') || brand?.includes('mercedes') || brand?.includes('audi') ? 500000 : 250000,
          estimated_budget_max: brand?.includes('bmw') || brand?.includes('mercedes') || brand?.includes('audi') ? 1200000 : 800000,
        })
      }
    }

    // Respect rate limits
    await new Promise(r => setTimeout(r, 1000))
  }

  console.log(`[youtube] Collected ${signals.length} intent signals from YouTube comments`)
  return signals
}

// Fallback: Use Google Search to find YouTube intent (no API key needed)
async function collectViaGoogleSearch(): Promise<CollectedSignal[]> {
  const { googleSearch, extractLocation, extractPersonName } = await import('./search')
  const signals: CollectedSignal[] = []

  const queries = [
    '"looking to buy" OR "want to buy" site:youtube.com South Africa car 2025',
    '"how much" OR "price" OR "where can i buy" site:youtube.com South Africa bakkie',
    '"recommend a dealer" OR "which dealership" site:youtube.com Gauteng car',
  ]

  for (const query of queries) {
    const results = await googleSearch(query, 5)
    for (const result of results) {
      const intent = detectIntent(result.snippet || '')
      if (intent === 'weak') continue

      const location = detectLocation(result.snippet || '')
      signals.push({
        signal_type: 'social_intent',
        title: `YouTube (Google): ${result.title?.substring(0, 80)}`,
        description: result.snippet || '',
        data_source: 'youtube',
        source_url: result.url || null,
        signal_strength: intent === 'strong' ? 'strong' : 'medium',
        buying_probability: intent === 'strong' ? 65 : 40,
        area: location.area || null,
        city: location.city || null,
        province: location.province || 'Gauteng',
      })
    }
  }

  return signals
}

export default collectYouTubeSignals
