/**
 * Google Search scraper utility.
 * Fetches Google search results and extracts titles, snippets, and URLs.
 * Used by all signal collectors to find buying signals from public web data.
 */

export interface SearchResult {
  title: string
  snippet: string
  url: string
}

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'

/**
 * Perform a Google search and extract organic results from the HTML.
 * Returns up to `maxResults` items.
 */
export async function googleSearch(
  query: string,
  maxResults = 10
): Promise<SearchResult[]> {
  const encoded = encodeURIComponent(query)
  const url = `https://www.google.com/search?q=${encoded}&num=${maxResults}&hl=en&gl=ZA`

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'en-US,en;q=0.9',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(15_000),
    })

    if (!res.ok) {
      console.warn(`[search] Google returned ${res.status} for: ${query}`)
      return []
    }

    const html = await res.text()
    return parseGoogleHTML(html, maxResults)
  } catch (err) {
    console.error(`[search] Failed for query "${query}":`, err)
    return []
  }
}

/**
 * Parse Google search result HTML to extract organic results.
 * Google's HTML is heavily obfuscated; we look for common structural patterns.
 */
function parseGoogleHTML(html: string, max: number): SearchResult[] {
  const results: SearchResult[] = []

  // Pattern 1: Extract from <a> tags with href containing actual URLs
  // Google wraps results in divs with class patterns; we extract href + nearby text
  const linkPattern = /<a[^>]+href="\/url\?q=([^"&]+)[^"]*"[^>]*>([\s\S]*?)<\/a>/gi
  let match: RegExpExecArray | null

  while ((match = linkPattern.exec(html)) !== null && results.length < max) {
    const rawUrl = decodeURIComponent(match[1])
    const linkHtml = match[2]

    // Skip Google internal links
    if (
      rawUrl.includes('google.com') ||
      rawUrl.includes('accounts.google') ||
      rawUrl.includes('support.google') ||
      rawUrl.startsWith('/') ||
      rawUrl.includes('webcache')
    ) {
      continue
    }

    const title = stripHTML(linkHtml).trim()
    if (!title || title.length < 5) continue

    results.push({ title, snippet: '', url: rawUrl })
  }

  // Pattern 2: Also try direct href= patterns (Google sometimes uses direct links)
  if (results.length < 3) {
    const directPattern = /<a[^>]+href="(https?:\/\/(?!www\.google)[^"]+)"[^>]*>.*?<h3[^>]*>(.*?)<\/h3>/gi
    while ((match = directPattern.exec(html)) !== null && results.length < max) {
      const url = match[1]
      const title = stripHTML(match[2]).trim()
      if (title && title.length >= 5 && !results.some((r) => r.url === url)) {
        results.push({ title, snippet: '', url })
      }
    }
  }

  // Extract snippets: look for text blocks near the extracted URLs
  // Google puts snippets in spans/divs after the link
  const snippetPattern = /<span[^>]*>((?:(?!<span).){40,300})<\/span>/gi
  const snippets: string[] = []
  while ((match = snippetPattern.exec(html)) !== null) {
    const text = stripHTML(match[1]).trim()
    if (text.length >= 40 && !text.includes('Google') && !text.includes('Sign in')) {
      snippets.push(text)
    }
  }

  // Assign snippets to results (best effort — positional matching)
  for (let i = 0; i < results.length && i < snippets.length; i++) {
    results[i].snippet = snippets[i]
  }

  return results
}

/** Strip HTML tags from a string */
function stripHTML(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
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
      // Capitalize area name
      const areaName = area
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
      return { area: areaName, city }
    }
  }

  // Fallback: check for "Gauteng" generally
  if (lower.includes('gauteng')) {
    return { area: null, city: 'Johannesburg' }
  }

  return { area: null, city: null }
}

/**
 * Extract a person's name from text (basic heuristic).
 * Looks for capitalized two/three-word patterns typical of SA names.
 */
export function extractPersonName(text: string): string | null {
  // Match "Firstname Lastname" patterns (2-3 words, each capitalized)
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
 * Looks for PTY, Ltd, Inc, Holdings, etc.
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
