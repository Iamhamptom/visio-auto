/**
 * Web search utility for signal collectors.
 * Uses multiple approaches: SerpAPI, Google Custom Search, or direct source APIs.
 * Falls back gracefully if APIs aren't configured.
 */

export interface SearchResult {
  title: string
  snippet: string
  url: string
}

/**
 * Search using Google Custom Search API (free tier: 100 queries/day).
 * Set GOOGLE_CSE_KEY and GOOGLE_CSE_CX env vars.
 * Falls back to direct source scraping if not configured.
 */
export async function googleSearch(
  query: string,
  maxResults = 10
): Promise<SearchResult[]> {
  const apiKey = process.env.GOOGLE_CSE_KEY
  const cx = process.env.GOOGLE_CSE_CX

  if (apiKey && cx) {
    return googleCustomSearch(query, apiKey, cx, maxResults)
  }

  // Fallback: try SerpAPI if configured
  const serpKey = process.env.SERPAPI_KEY
  if (serpKey) {
    return serpApiSearch(query, serpKey, maxResults)
  }

  // No search API configured — return empty (signal collectors will use hardcoded seeds)
  console.warn(`[search] No search API configured (GOOGLE_CSE_KEY or SERPAPI_KEY). Query: "${query}"`)
  return []
}

async function googleCustomSearch(
  query: string,
  apiKey: string,
  cx: string,
  maxResults: number
): Promise<SearchResult[]> {
  const encoded = encodeURIComponent(query)
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encoded}&num=${Math.min(maxResults, 10)}&gl=za`

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) })
    if (!res.ok) {
      console.warn(`[search] Google CSE returned ${res.status}`)
      return []
    }

    const data = await res.json()
    return (data.items || []).slice(0, maxResults).map((item: { title: string; snippet: string; link: string }) => ({
      title: item.title || '',
      snippet: item.snippet || '',
      url: item.link || '',
    }))
  } catch (err) {
    console.error(`[search] Google CSE error:`, err)
    return []
  }
}

async function serpApiSearch(
  query: string,
  apiKey: string,
  maxResults: number
): Promise<SearchResult[]> {
  const encoded = encodeURIComponent(query)
  const url = `https://serpapi.com/search.json?q=${encoded}&api_key=${apiKey}&gl=za&hl=en&num=${maxResults}`

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) })
    if (!res.ok) return []

    const data = await res.json()
    return (data.organic_results || []).slice(0, maxResults).map((item: { title: string; snippet: string; link: string }) => ({
      title: item.title || '',
      snippet: item.snippet || '',
      url: item.link || '',
    }))
  } catch {
    return []
  }
}

/**
 * Extract location info from text. Returns area/city or null.
 */
export function extractLocation(text: string): { area: string | null; city: string | null } {
  const areas: Record<string, string> = {
    sandton: 'Johannesburg',
    rosebank: 'Johannesburg',
    fourways: 'Johannesburg',
    midrand: 'Johannesburg',
    bryanston: 'Johannesburg',
    parktown: 'Johannesburg',
    randburg: 'Johannesburg',
    kempton: 'Johannesburg',
    'kempton park': 'Johannesburg',
    bedfordview: 'Johannesburg',
    edenvale: 'Johannesburg',
    germiston: 'Johannesburg',
    alberton: 'Johannesburg',
    benoni: 'Johannesburg',
    boksburg: 'Johannesburg',
    roodepoort: 'Johannesburg',
    soweto: 'Johannesburg',
    midstream: 'Johannesburg',
    centurion: 'Pretoria',
    hatfield: 'Pretoria',
    menlyn: 'Pretoria',
    waterkloof: 'Pretoria',
    lynnwood: 'Pretoria',
    brooklyn: 'Pretoria',
    irene: 'Pretoria',
    johannesburg: 'Johannesburg',
    pretoria: 'Pretoria',
    tshwane: 'Pretoria',
    joburg: 'Johannesburg',
    jhb: 'Johannesburg',
    pta: 'Pretoria',
  }

  const lower = text.toLowerCase()
  for (const [area, city] of Object.entries(areas)) {
    if (lower.includes(area)) {
      const areaName = area
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
      return { area: areaName, city }
    }
  }

  if (lower.includes('gauteng')) {
    return { area: null, city: 'Johannesburg' }
  }

  return { area: null, city: null }
}

/**
 * Extract a person's name from text (basic heuristic).
 */
export function extractPersonName(text: string): string | null {
  const nameMatch = text.match(
    /\b([A-Z][a-z]{1,15})\s+((?:van\s+(?:der|den)\s+)?(?:de\s+)?[A-Z][a-z]{1,20}(?:\s+[A-Z][a-z]{1,20})?)\b/
  )
  if (nameMatch) {
    return `${nameMatch[1]} ${nameMatch[2]}`
  }
  return null
}

/**
 * Extract company name from text (basic heuristic).
 */
export function extractCompanyName(text: string): string | null {
  const companyMatch = text.match(
    /([A-Z][A-Za-z\s&]{2,40})\s*(?:PTY|Pty|Ltd|LTD|Holdings|Group|Inc|Corporation|Corp|CC)\b/
  )
  if (companyMatch) {
    return companyMatch[0].trim()
  }
  return null
}
