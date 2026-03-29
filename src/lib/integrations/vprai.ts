import type { Lead, ScoreTier } from '@/lib/types'

// ---------------------------------------------------------------------------
// V-Prai Client — connects Visio Auto to VisioCorp's lead-gen platform
// V-Prai lives at prai.visioai.co (repo: visio-lead-gen)
// ---------------------------------------------------------------------------

const VPRAI_BASE_URL = process.env.VPRAI_API_URL || 'https://prai.visioai.co'
const VPRAI_API_KEY = process.env.VPRAI_API_KEY || ''

// V-Prai lead shape (from visio-lead-gen/app/types.ts)
interface VPraiLead {
  id: string
  name: string
  title: string
  company?: string
  email?: string
  phone?: string
  matchScore: number
  socials: {
    instagram?: string
    twitter?: string
    linkedin?: string
    tiktok?: string
    youtube?: string
    website?: string
    email?: string
  }
  imageUrl?: string
  url?: string
  snippet?: string
  source?: string
  followers?: string
  country?: string
}

// V-Prai lead request shape
interface VPraiLeadRequest {
  id: string
  query: string
  status: string
  results_count: number
  results: VPraiLead[]
  contact_types: string[]
  markets: string[]
  genre: string
  created_at: string
  completed_at: string | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function vpraiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
  if (!VPRAI_API_KEY) {
    return { data: null, error: 'VPRAI_API_KEY not configured' }
  }

  try {
    const url = `${VPRAI_BASE_URL}${path}`
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${VPRAI_API_KEY}`,
        ...options.headers,
      },
      signal: AbortSignal.timeout(15_000), // 15s timeout
    })

    if (!res.ok) {
      const text = await res.text().catch(() => 'Unknown error')
      return { data: null, error: `V-Prai API ${res.status}: ${text}` }
    }

    const json = await res.json()
    return { data: json as T, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[vprai] request failed: ${path}`, message)
    return { data: null, error: `V-Prai unreachable: ${message}` }
  }
}

// ---------------------------------------------------------------------------
// mapVPraiLeadToVisioAuto — transform V-Prai lead to va_leads format
// ---------------------------------------------------------------------------

export function mapVPraiLeadToVisioAuto(vpLead: VPraiLead): Omit<Lead, 'id' | 'created_at'> {
  // Map V-Prai matchScore (0-100) to auto score tier
  let scoreTier: ScoreTier = 'cold'
  if (vpLead.matchScore >= 70) scoreTier = 'hot'
  else if (vpLead.matchScore >= 40) scoreTier = 'warm'

  return {
    name: vpLead.name || 'Unknown',
    phone: vpLead.phone || '',
    email: vpLead.email || null,
    whatsapp: vpLead.phone || null,
    area: null,
    city: vpLead.country === 'ZA' ? 'Johannesburg' : 'Unknown',
    province: vpLead.country === 'ZA' ? 'Gauteng' : 'Unknown',
    budget_min: null,
    budget_max: null,
    preferred_brand: null,
    preferred_model: null,
    preferred_type: null,
    new_or_used: 'any',
    has_trade_in: false,
    trade_in_brand: null,
    trade_in_model: null,
    trade_in_year: null,
    timeline: 'just_browsing',
    finance_status: 'unknown',
    ai_score: vpLead.matchScore || 0,
    score_tier: scoreTier,
    source: 'vprai',
    source_detail: vpLead.source || `V-Prai import — ${vpLead.title || 'lead'}`,
    language: 'en',
    assigned_dealer_id: null,
    matched_vin: null,
    matched_vehicle: null,
    status: 'new',
    contacted_at: null,
    test_drive_at: null,
    sold_at: null,
    sale_amount: null,
  }
}

// ---------------------------------------------------------------------------
// mapVisioAutoToVPrai — transform Visio Auto lead to V-Prai format
// ---------------------------------------------------------------------------

export function mapVisioAutoToVPrai(lead: Lead): VPraiLead {
  return {
    id: lead.id,
    name: lead.name,
    title: `${lead.preferred_brand || ''} ${lead.preferred_model || ''} buyer`.trim(),
    company: '',
    email: lead.email || undefined,
    phone: lead.phone,
    matchScore: lead.ai_score,
    socials: {},
    source: `visio-auto:${lead.source}`,
    country: lead.province ? 'ZA' : undefined,
  }
}

// ---------------------------------------------------------------------------
// fetchVPraiLeads — pull recent leads from V-Prai
// ---------------------------------------------------------------------------

export async function fetchVPraiLeads(
  since?: Date
): Promise<{ leads: VPraiLead[]; error: string | null }> {
  // V-Prai stores leads in lead_requests table, accessible via admin API
  const params = new URLSearchParams()
  if (since) {
    params.set('since', since.toISOString())
  }

  const path = `/api/admin/leads${params.toString() ? `?${params}` : ''}`
  const result = await vpraiRequest<{ leads: VPraiLeadRequest[] }>(path)

  if (result.error || !result.data) {
    return { leads: [], error: result.error }
  }

  // Flatten all results from completed lead requests
  const allLeads: VPraiLead[] = []
  for (const req of result.data.leads) {
    if (req.results && Array.isArray(req.results)) {
      allLeads.push(...req.results)
    }
  }

  return { leads: allLeads, error: null }
}

// ---------------------------------------------------------------------------
// pushLeadToVPrai — send a Visio Auto lead to V-Prai (bidirectional sync)
// ---------------------------------------------------------------------------

export async function pushLeadToVPrai(lead: Lead): Promise<{ success: boolean; error: string | null }> {
  const vpraiLead = mapVisioAutoToVPrai(lead)

  const result = await vpraiRequest<{ success: boolean }>('/api/submissions', {
    method: 'POST',
    body: JSON.stringify({
      leads: [vpraiLead],
      source: 'visio-auto',
    }),
  })

  if (result.error) {
    return { success: false, error: result.error }
  }

  return { success: true, error: null }
}

// ---------------------------------------------------------------------------
// syncLeadStatus — keep status in sync between both systems
// ---------------------------------------------------------------------------

export async function syncLeadStatus(
  leadId: string,
  status: string
): Promise<{ success: boolean; error: string | null }> {
  const result = await vpraiRequest<{ success: boolean }>('/api/submissions', {
    method: 'PATCH',
    body: JSON.stringify({
      lead_id: leadId,
      status,
      source: 'visio-auto',
      updated_at: new Date().toISOString(),
    }),
  })

  if (result.error) {
    return { success: false, error: result.error }
  }

  return { success: true, error: null }
}

// ---------------------------------------------------------------------------
// checkVPraiHealth — ping V-Prai to check connectivity
// ---------------------------------------------------------------------------

export async function checkVPraiHealth(): Promise<{
  connected: boolean
  latencyMs: number
  error: string | null
}> {
  const start = Date.now()

  const result = await vpraiRequest<{ overall: string }>('/api/health')

  const latencyMs = Date.now() - start

  if (result.error) {
    return { connected: false, latencyMs, error: result.error }
  }

  return {
    connected: result.data?.overall === 'healthy',
    latencyMs,
    error: null,
  }
}

export type { VPraiLead, VPraiLeadRequest }
