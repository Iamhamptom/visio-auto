import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

// ---------------------------------------------------------------------------
// AI Lead Enrichment Pipeline
// Uses Claude Haiku for speed — high-volume enrichment of lead/company data
// ---------------------------------------------------------------------------

export interface EnrichedData {
  company_website: string | null
  company_about: string | null
  company_services: string[]
  estimated_company_size: 'micro' | 'small' | 'medium' | 'large' | 'enterprise'
  estimated_annual_revenue: string | null
  industry_classification: string | null
  key_decision_makers: string[]
  tech_stack_hints: string[]
  social_media_links: Record<string, string>
  competitive_landscape: string[]
  enrichment_confidence: number
  enriched_at: string
}

interface LeadForEnrichment {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  area?: string | null
  city?: string | null
  province?: string | null
  preferred_brand?: string | null
  source?: string | null
  source_detail?: string | null
}

// ---------------------------------------------------------------------------
// enrichLead — Enrich a single lead with AI-inferred company/person data
// ---------------------------------------------------------------------------

export async function enrichLead(lead: LeadForEnrichment): Promise<EnrichedData> {
  const emailDomain = lead.email ? lead.email.split('@')[1] : null
  const isPersonalEmail = emailDomain
    ? ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'live.com'].includes(emailDomain)
    : true

  // Try to fetch company website if we have a business email domain
  let websiteContent = ''
  if (!isPersonalEmail && emailDomain) {
    try {
      const res = await fetch(`https://${emailDomain}`, {
        signal: AbortSignal.timeout(8000),
        headers: { 'User-Agent': 'VisioAuto Lead Enrichment Bot/1.0' },
      })
      if (res.ok) {
        const html = await res.text()
        // Extract meaningful text (strip tags, limit to 3000 chars)
        websiteContent = html
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/<style[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 3000)
      }
    } catch {
      // Website fetch failed — non-fatal, AI will work with what it has
    }
  }

  const prompt = `You are a lead enrichment AI for a South African automotive lead generation platform.

Given the following lead information, enrich it with as much relevant data as you can infer.

LEAD DATA:
- Name: ${lead.name}
- Email: ${lead.email ?? 'N/A'}
- Email Domain: ${emailDomain ?? 'N/A'}
- Phone: ${lead.phone ?? 'N/A'}
- Area: ${lead.area ?? 'N/A'}
- City: ${lead.city ?? 'N/A'}
- Province: ${lead.province ?? 'N/A'}
- Preferred Brand: ${lead.preferred_brand ?? 'N/A'}
- Source: ${lead.source ?? 'N/A'}
${websiteContent ? `\nCOMPANY WEBSITE CONTENT:\n${websiteContent}` : ''}

Respond ONLY with valid JSON matching this exact structure (no markdown, no explanation):
{
  "company_website": "url or null",
  "company_about": "brief description or null",
  "company_services": ["service1", "service2"],
  "estimated_company_size": "micro|small|medium|large|enterprise",
  "estimated_annual_revenue": "e.g. R500K-R2M or null",
  "industry_classification": "e.g. construction, healthcare, logistics",
  "key_decision_makers": ["Name - Title"],
  "tech_stack_hints": ["hint1"],
  "social_media_links": {"linkedin": "url", "facebook": "url"},
  "competitive_landscape": ["competitor1"],
  "enrichment_confidence": 0.0-1.0
}

If you cannot determine something, use null, empty array, or empty object. For personal leads (gmail etc), focus on the person's likely profile based on name, area, and brand preference. Base company size estimates on South African market norms.`

  try {
    const { text } = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      prompt,
      temperature: 0.2,
    })

    // Parse AI response
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned) as Record<string, unknown>

    return {
      company_website: (parsed.company_website as string) ?? null,
      company_about: (parsed.company_about as string) ?? null,
      company_services: Array.isArray(parsed.company_services) ? parsed.company_services as string[] : [],
      estimated_company_size: validateCompanySize(parsed.estimated_company_size as string),
      estimated_annual_revenue: (parsed.estimated_annual_revenue as string) ?? null,
      industry_classification: (parsed.industry_classification as string) ?? null,
      key_decision_makers: Array.isArray(parsed.key_decision_makers) ? parsed.key_decision_makers as string[] : [],
      tech_stack_hints: Array.isArray(parsed.tech_stack_hints) ? parsed.tech_stack_hints as string[] : [],
      social_media_links: (parsed.social_media_links as Record<string, string>) ?? {},
      competitive_landscape: Array.isArray(parsed.competitive_landscape) ? parsed.competitive_landscape as string[] : [],
      enrichment_confidence: typeof parsed.enrichment_confidence === 'number' ? parsed.enrichment_confidence : 0.3,
      enriched_at: new Date().toISOString(),
    }
  } catch (err) {
    console.error(`[enrichment] Failed to enrich lead ${lead.id}:`, err)
    return {
      company_website: null,
      company_about: null,
      company_services: [],
      estimated_company_size: 'small',
      estimated_annual_revenue: null,
      industry_classification: null,
      key_decision_makers: [],
      tech_stack_hints: [],
      social_media_links: {},
      competitive_landscape: [],
      enrichment_confidence: 0,
      enriched_at: new Date().toISOString(),
    }
  }
}

// ---------------------------------------------------------------------------
// bulkEnrichLeads — Enrich multiple leads in batches of 5, 1s delay between
// ---------------------------------------------------------------------------

export async function bulkEnrichLeads(
  leads: LeadForEnrichment[]
): Promise<{ results: Array<{ lead_id: string; data: EnrichedData }>; errors: string[] }> {
  const results: Array<{ lead_id: string; data: EnrichedData }> = []
  const errors: string[] = []
  const batchSize = 5

  for (let i = 0; i < leads.length; i += batchSize) {
    const batch = leads.slice(i, i + batchSize)

    const batchResults = await Promise.allSettled(
      batch.map(async (lead) => {
        const data = await enrichLead(lead)
        return { lead_id: lead.id, data }
      })
    )

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value)
      } else {
        errors.push(result.reason instanceof Error ? result.reason.message : String(result.reason))
      }
    }

    // Delay between batches to respect rate limits
    if (i + batchSize < leads.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  return { results, errors }
}

// ---------------------------------------------------------------------------
// estimateCompanyRevenue — AI estimates revenue from name + industry + area
// ---------------------------------------------------------------------------

export async function estimateCompanyRevenue(
  companyName: string,
  industry: string,
  area: string
): Promise<{ estimate: string; confidence: number; reasoning: string }> {
  try {
    const { text } = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      prompt: `You are a South African business intelligence analyst. Estimate the annual revenue for this company.

Company: ${companyName}
Industry: ${industry}
Area: ${area}

Respond ONLY with valid JSON (no markdown):
{
  "estimate": "R500K-R2M",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}

Use South African Rand (R). Base your estimate on typical SA company sizes in this industry and area.`,
      temperature: 0.3,
    })

    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned) as Record<string, unknown>

    return {
      estimate: (parsed.estimate as string) ?? 'Unknown',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.3,
      reasoning: (parsed.reasoning as string) ?? 'Insufficient data',
    }
  } catch {
    return { estimate: 'Unknown', confidence: 0, reasoning: 'Estimation failed' }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function validateCompanySize(size: unknown): 'micro' | 'small' | 'medium' | 'large' | 'enterprise' {
  const valid = ['micro', 'small', 'medium', 'large', 'enterprise']
  if (typeof size === 'string' && valid.includes(size)) {
    return size as 'micro' | 'small' | 'medium' | 'large' | 'enterprise'
  }
  return 'small'
}
