import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * CSV / JSON Lead Export
 *
 * GET /api/leads/export?format=csv&status=qualified&score_tier=hot&date_from=2026-01-01&date_to=2026-12-31&dealer_id=xxx
 *
 * Returns leads as a downloadable CSV or JSON array.
 */

const ExportQuery = z.object({
  format: z.enum(['csv', 'json']).default('csv'),
  dealer_id: z.string().optional(),
  status: z.string().optional(),
  score_tier: z.enum(['hot', 'warm', 'cold']).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  limit: z.coerce.number().min(1).max(5000).default(1000),
})

async function getSupabase() {
  try {
    const { createServiceClient } = await import('@/lib/supabase/service')
    return createServiceClient()
  } catch {
    return null
  }
}

function escapeCSV(value: string | number | null | undefined): string {
  if (value == null) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

const CSV_HEADERS = [
  'Name', 'Phone', 'Email', 'Area', 'City', 'Budget Min', 'Budget Max',
  'Brand', 'Type', 'Timeline', 'Finance', 'Score', 'Tier', 'Status',
  'Source', 'Date',
]

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams)
  const parsed = ExportQuery.safeParse(params)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parsed.error.format() },
      { status: 400 }
    )
  }

  const { format, dealer_id, status, score_tier, date_from, date_to, limit } = parsed.data

  const supabase = await getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }

  try {
    let query = supabase
      .from('va_leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (dealer_id) query = query.eq('assigned_dealer_id', dealer_id)
    if (status) query = query.eq('status', status)
    if (score_tier) query = query.eq('score_tier', score_tier)
    if (date_from) query = query.gte('created_at', date_from)
    if (date_to) query = query.lte('created_at', date_to)

    const { data: leads, error } = await query

    if (error) {
      console.error('[leads/export] Query error:', error.message)
      return NextResponse.json({ error: 'Query failed', detail: error.message }, { status: 500 })
    }

    const rows = leads || []

    // JSON export
    if (format === 'json') {
      return NextResponse.json({
        exported_at: new Date().toISOString(),
        count: rows.length,
        leads: rows,
      })
    }

    // CSV export
    const csvLines: string[] = [CSV_HEADERS.join(',')]

    for (const lead of rows) {
      csvLines.push([
        escapeCSV(lead.name),
        escapeCSV(lead.phone),
        escapeCSV(lead.email),
        escapeCSV(lead.area),
        escapeCSV(lead.city),
        escapeCSV(lead.budget_min),
        escapeCSV(lead.budget_max),
        escapeCSV(lead.preferred_brand),
        escapeCSV(lead.preferred_type),
        escapeCSV(lead.timeline),
        escapeCSV(lead.finance_status),
        escapeCSV(lead.ai_score),
        escapeCSV(lead.score_tier),
        escapeCSV(lead.status),
        escapeCSV(lead.source),
        escapeCSV(lead.created_at?.slice(0, 10)),
      ].join(','))
    }

    const csv = csvLines.join('\r\n')
    const date = new Date().toISOString().slice(0, 10)

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="visio-auto-leads-${date}.csv"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[leads/export] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
