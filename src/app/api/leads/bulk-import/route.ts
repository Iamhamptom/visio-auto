import { NextRequest, NextResponse } from 'next/server'
import { scoreLead } from '@/lib/ai/scoring'
import { autoAssignLead } from '@/lib/leads/auto-assign'

// ---------------------------------------------------------------------------
// POST: Bulk Lead Import — CSV or JSON array
// Handles SA Excel semicolons, BOM, Meta Ads CSV exports
// ---------------------------------------------------------------------------

interface ImportRow {
  name: string
  phone: string
  email?: string
  area?: string
  city?: string
  province?: string
  budget_min?: number
  budget_max?: number
  preferred_brand?: string
  preferred_model?: string
  preferred_type?: string
  new_or_used?: string
  timeline?: string
  finance_status?: string
  has_trade_in?: boolean
  language?: string
  source?: string
  source_detail?: string
}

interface ImportResult {
  imported: number
  failed: number
  assigned: number
  errors: Array<{ row: number; error: string }>
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') ?? ''
    let rows: ImportRow[] = []

    if (contentType.includes('application/json')) {
      const body = await request.json()
      if (Array.isArray(body)) {
        rows = body
      } else if (body.data && Array.isArray(body.data)) {
        rows = body.data
      } else if (body.csv && typeof body.csv === 'string') {
        rows = parseCSV(body.csv)
      } else {
        return NextResponse.json({ error: 'Expected JSON array, {data: [...]}, or {csv: "..."}' }, { status: 400 })
      }
    } else if (contentType.includes('text/csv') || contentType.includes('text/plain')) {
      const text = await request.text()
      rows = parseCSV(text)
    } else {
      return NextResponse.json(
        { error: 'Unsupported content type. Use application/json or text/csv' },
        { status: 400 }
      )
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No rows to import' }, { status: 400 })
    }

    if (rows.length > 1000) {
      return NextResponse.json({ error: 'Maximum 1000 rows per import' }, { status: 400 })
    }

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const result: ImportResult = { imported: 0, failed: 0, assigned: 0, errors: [] }

    // Process in batches of 50
    const batchSize = 50
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize)
      const validRows: Array<Record<string, unknown>> = []

      for (let j = 0; j < batch.length; j++) {
        const rowIndex = i + j + 1
        const raw = batch[j]

        // Validate required fields
        if (!raw.name || raw.name.trim().length < 2) {
          result.errors.push({ row: rowIndex, error: 'Missing or invalid name' })
          result.failed++
          continue
        }
        if (!raw.phone || raw.phone.trim().length < 9) {
          result.errors.push({ row: rowIndex, error: 'Missing or invalid phone' })
          result.failed++
          continue
        }

        // Parse numeric fields
        const budgetMin = raw.budget_min ? Number(raw.budget_min) : null
        const budgetMax = raw.budget_max ? Number(raw.budget_max) : null

        // Score the lead
        const { score, tier } = scoreLead({
          budget_min: budgetMin,
          budget_max: budgetMax,
          timeline: raw.timeline,
          finance_status: raw.finance_status,
          has_trade_in: raw.has_trade_in === true || String(raw.has_trade_in).toLowerCase() === 'true',
          preferred_brand: raw.preferred_brand,
          preferred_model: raw.preferred_model,
          preferred_type: raw.preferred_type,
          source: raw.source ?? 'bulk_import',
        })

        validRows.push({
          name: raw.name.trim(),
          phone: raw.phone.trim(),
          email: raw.email?.trim() || null,
          whatsapp: raw.phone.trim(),
          area: raw.area?.trim() || null,
          city: raw.city?.trim() || 'Johannesburg',
          province: raw.province?.trim() || 'Gauteng',
          budget_min: budgetMin,
          budget_max: budgetMax,
          preferred_brand: raw.preferred_brand?.trim() || null,
          preferred_model: raw.preferred_model?.trim() || null,
          preferred_type: raw.preferred_type?.trim() || null,
          new_or_used: raw.new_or_used ?? 'any',
          has_trade_in: raw.has_trade_in === true || String(raw.has_trade_in).toLowerCase() === 'true',
          timeline: raw.timeline ?? 'just_browsing',
          finance_status: raw.finance_status ?? 'unknown',
          ai_score: score,
          score_tier: tier,
          source: raw.source ?? 'bulk_import',
          source_detail: raw.source_detail ?? 'CSV/JSON bulk import',
          language: raw.language ?? 'en',
          status: 'new',
        })
      }

      if (validRows.length === 0) continue

      // Insert batch
      const { data: inserted, error: insertError } = await supabase
        .from('va_leads')
        .insert(validRows)
        .select('id, preferred_brand, area, city, score_tier')

      if (insertError) {
        console.error(`[BulkImport] Batch insert error:`, insertError.message)
        result.failed += validRows.length
        result.errors.push({ row: i + 1, error: `Batch insert failed: ${insertError.message}` })
        continue
      }

      result.imported += inserted?.length ?? 0

      // Auto-assign each imported lead
      for (const lead of inserted ?? []) {
        try {
          const assignment = await autoAssignLead(lead)
          if (assignment) result.assigned++
        } catch {
          // Assignment failure is non-fatal
        }
      }
    }

    console.log(
      `[BulkImport] Completed — Imported: ${result.imported}, Failed: ${result.failed}, Assigned: ${result.assigned}`
    )

    return NextResponse.json(result, { status: result.imported > 0 ? 201 : 400 })
  } catch (err) {
    console.error('[BulkImport] Error:', err)
    return NextResponse.json({ error: 'Bulk import failed' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// CSV Parser — handles SA Excel semicolons, BOM, quoted fields
// ---------------------------------------------------------------------------

function parseCSV(raw: string): ImportRow[] {
  // Strip BOM
  let text = raw.replace(/^\uFEFF/, '')

  // Detect delimiter: semicolons (SA Excel) vs commas
  const firstLine = text.split('\n')[0] ?? ''
  const delimiter = firstLine.split(';').length > firstLine.split(',').length ? ';' : ','

  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0)
  if (lines.length < 2) return [] // need header + at least 1 row

  // Parse header
  const headers = parseCSVLine(lines[0], delimiter).map((h) =>
    normalizeHeader(h.trim().toLowerCase())
  )

  const rows: ImportRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i], delimiter)
    const row: Record<string, string> = {}

    for (let j = 0; j < headers.length && j < values.length; j++) {
      if (headers[j]) {
        row[headers[j]] = values[j].trim()
      }
    }

    // Map to ImportRow
    if (row.name && row.phone) {
      rows.push({
        name: row.name,
        phone: row.phone,
        email: row.email || undefined,
        area: row.area || undefined,
        city: row.city || undefined,
        province: row.province || undefined,
        budget_min: row.budget_min ? Number(row.budget_min.replace(/[^\d.]/g, '')) : undefined,
        budget_max: row.budget_max ? Number(row.budget_max.replace(/[^\d.]/g, '')) : undefined,
        preferred_brand: row.preferred_brand || row.brand || undefined,
        preferred_model: row.preferred_model || row.model || undefined,
        preferred_type: row.preferred_type || row.vehicle_type || undefined,
        new_or_used: row.new_or_used || undefined,
        timeline: row.timeline || undefined,
        finance_status: row.finance_status || undefined,
        has_trade_in: row.has_trade_in === 'true' || row.has_trade_in === '1',
        language: row.language || undefined,
        source: row.source || 'bulk_import',
        source_detail: row.source_detail || row.campaign || undefined,
      })
    }
  }

  return rows
}

/**
 * Parse a single CSV line handling quoted fields.
 */
function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}

/**
 * Normalize CSV headers — handle common aliases from Meta Ads exports etc.
 */
function normalizeHeader(header: string): string {
  const aliases: Record<string, string> = {
    // Meta Ads CSV columns
    full_name: 'name',
    'full name': 'name',
    first_name: 'name',
    contact_name: 'name',
    phone_number: 'phone',
    'phone number': 'phone',
    mobile: 'phone',
    cell: 'phone',
    cellphone: 'phone',
    email_address: 'email',
    'email address': 'email',
    location: 'area',
    suburb: 'area',
    region: 'province',
    brand: 'preferred_brand',
    make: 'preferred_brand',
    model: 'preferred_model',
    vehicle_type: 'preferred_type',
    type: 'preferred_type',
    budget: 'budget_max',
    max_budget: 'budget_max',
    min_budget: 'budget_min',
    campaign_name: 'source_detail',
    campaign: 'source_detail',
    ad_name: 'source_detail',
    utm_source: 'source',
    lead_source: 'source',
  }
  return aliases[header] ?? header.replace(/\s+/g, '_')
}
