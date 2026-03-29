import type { Lead } from '@/lib/types'

// ---------------------------------------------------------------------------
// Visio Workspace Integration
// Reports Visio Auto analytics to the chairman's operating system
// Workspace: https://visioworkspace-corpo1.vercel.app
// ---------------------------------------------------------------------------

const WORKSPACE_URL = process.env.VISIO_WORKSPACE_URL || 'https://visioworkspace-corpo1.vercel.app'
const WORKSPACE_GATEWAY_KEY = process.env.VISIO_GATEWAY_KEY || ''

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WorkspaceReport {
  product_id: string
  product_name: string
  period: string // e.g. '2026-03'
  metrics: {
    total_leads: number
    active_dealers: number
    revenue: number
    conversion_rate: number
    avg_response_time_seconds: number
    leads_by_source: Record<string, number>
    top_brands: string[]
    score_distribution: { hot: number; warm: number; cold: number }
  }
  reported_at: string
}

interface WorkspaceLead {
  id: string
  name: string
  email: string | null
  phone: string | null
  industry: string
  status: string
  score: number
  created_at: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function workspaceRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
  if (!WORKSPACE_GATEWAY_KEY) {
    return { data: null, error: 'VISIO_GATEWAY_KEY not configured' }
  }

  try {
    const url = `${WORKSPACE_URL}${path}`
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${WORKSPACE_GATEWAY_KEY}`,
        ...options.headers,
      },
      signal: AbortSignal.timeout(15_000),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => 'Unknown error')
      return { data: null, error: `Workspace API ${res.status}: ${text}` }
    }

    const json = await res.json()
    return { data: json as T, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[workspace] request failed: ${path}`, message)
    return { data: null, error: `Workspace unreachable: ${message}` }
  }
}

// ---------------------------------------------------------------------------
// reportToWorkspace — push Visio Auto analytics to Workspace
// ---------------------------------------------------------------------------

export async function reportToWorkspace(
  analytics: WorkspaceReport
): Promise<{ success: boolean; error: string | null }> {
  // Use the product reporting API
  const result = await workspaceRequest<{ success: boolean }>(
    '/api/gateway',
    {
      method: 'POST',
      body: JSON.stringify({
        command: `Product report for Visio Auto: ${JSON.stringify(analytics.metrics)}`,
        organization_id: null,
        metadata: {
          type: 'product_report',
          product: 'visio-auto',
          ...analytics,
        },
      }),
    }
  )

  if (result.error) {
    console.error('[workspace] report failed:', result.error)
    return { success: false, error: result.error }
  }

  return { success: true, error: null }
}

// ---------------------------------------------------------------------------
// fetchWorkspaceLeads — pull automotive-tagged leads from workspace
// ---------------------------------------------------------------------------

export async function fetchWorkspaceLeads(
  industry: string = 'automotive'
): Promise<{ leads: WorkspaceLead[]; error: string | null }> {
  const result = await workspaceRequest<{ leads: WorkspaceLead[] }>(
    '/api/gateway',
    {
      method: 'POST',
      body: JSON.stringify({
        command: `List leads tagged with industry: ${industry}`,
        organization_id: null,
      }),
    }
  )

  if (result.error || !result.data) {
    return { leads: [], error: result.error }
  }

  return { leads: result.data.leads || [], error: null }
}

// ---------------------------------------------------------------------------
// mapWorkspaceLeadToVisioAuto — convert workspace lead to auto format
// ---------------------------------------------------------------------------

export function mapWorkspaceLeadToVisioAuto(
  wsLead: WorkspaceLead
): Omit<Lead, 'id' | 'created_at'> {
  return {
    name: wsLead.name,
    phone: wsLead.phone || '',
    email: wsLead.email,
    whatsapp: wsLead.phone,
    area: null,
    city: 'Unknown',
    province: 'Unknown',
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
    ai_score: wsLead.score || 0,
    score_tier: wsLead.score >= 70 ? 'hot' : wsLead.score >= 40 ? 'warm' : 'cold',
    source: 'workspace',
    source_detail: `Workspace lead — ${wsLead.industry}`,
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
// checkWorkspaceHealth — ping workspace connectivity
// ---------------------------------------------------------------------------

export async function checkWorkspaceHealth(): Promise<{
  connected: boolean
  latencyMs: number
  error: string | null
}> {
  const start = Date.now()

  try {
    const res = await fetch(`${WORKSPACE_URL}/api/health`, {
      signal: AbortSignal.timeout(10_000),
    })
    const latencyMs = Date.now() - start

    return {
      connected: res.ok,
      latencyMs,
      error: res.ok ? null : `Workspace returned ${res.status}`,
    }
  } catch (err) {
    return {
      connected: false,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}
