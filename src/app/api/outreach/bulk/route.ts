import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateBulkColdEmails } from '@/lib/agents/outreach-agent'
import type { Dealer } from '@/lib/types'

// =============================================================================
// POST /api/outreach/bulk — Bulk AI Outreach Generator
// Generate personalized outreach for multiple dealers at once
// Rate limited to 5 per batch (Anthropic API limits)
// =============================================================================

const bulkSchema = z.object({
  dealer_ids: z.array(z.string()).min(1, 'At least one dealer_id required').max(20, 'Max 20 dealers per request'),
  type: z.enum(['cold_email', 'follow_up', 'linkedin_dm', 'whatsapp']).default('cold_email'),
})

// ---------------------------------------------------------------------------
// Demo dealers fallback
// ---------------------------------------------------------------------------

const DEMO_DEALERS: Record<string, Partial<Dealer>> = {
  'd-001': { id: 'd-001', name: 'Motus Toyota Kempton Park', dealer_principal: 'Werner van Rooyen', area: 'Kempton Park', brands: ['Toyota'], group_name: 'Motus Group', tier: 'growth' },
  'd-002': { id: 'd-002', name: 'BMW Bryanston (JSN Motors)', dealer_principal: 'Johan Smit', area: 'Bryanston', brands: ['BMW'], group_name: 'JSN Motors Group', tier: 'pro' },
  'd-003': { id: 'd-003', name: 'Audi Centre Sandton', dealer_principal: 'Michael Fourie', area: 'Sandton', brands: ['Audi'], group_name: 'Motus', tier: 'pro' },
  'd-004': { id: 'd-004', name: 'Mercedes-Benz Sandton', dealer_principal: 'Pierre du Toit', area: 'Sandton', brands: ['Mercedes-Benz'], group_name: null, tier: 'enterprise' },
  'd-005': { id: 'd-005', name: 'Hatfield VW', dealer_principal: 'Leon Erasmus', area: 'Hatfield', brands: ['Volkswagen'], group_name: null, tier: 'growth' },
  'd-006': { id: 'd-006', name: 'NTT Toyota Menlyn', dealer_principal: 'Stefan Naidoo', area: 'Menlyn', brands: ['Toyota'], group_name: 'NTT Motor Group', tier: 'growth' },
  'd-007': { id: 'd-007', name: 'CMH Kia Sandton', dealer_principal: 'Kevin Moodley', area: 'Sandton', brands: ['Kia'], group_name: 'CMH Group', tier: 'starter' },
  'd-008': { id: 'd-008', name: 'Pharoah Auto', dealer_principal: 'Yusuf Moosa', area: 'Sandton', brands: ['Porsche', 'Ferrari', 'Lamborghini'], group_name: null, tier: 'enterprise' },
  'd-009': { id: 'd-009', name: 'Halfway Toyota Fourways', dealer_principal: 'Francois Viljoen', area: 'Fourways', brands: ['Toyota'], group_name: 'Halfway Group', tier: 'growth' },
  'd-010': { id: 'd-010', name: 'SMH BMW Oakdene', dealer_principal: 'Charl Steyn', area: 'Oakdene', brands: ['BMW'], group_name: 'SMH Group', tier: 'pro' },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function fetchDealers(dealerIds: string[]): Promise<{ found: Partial<Dealer>[]; notFound: string[] }> {
  const found: Partial<Dealer>[] = []
  const notFound: string[] = []

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data } = await supabase
      .from('va_dealers')
      .select('*')
      .in('id', dealerIds)

    if (data && data.length > 0) {
      const dbIds = new Set(data.map((d: Dealer) => d.id))
      found.push(...data)
      for (const id of dealerIds) {
        if (!dbIds.has(id)) {
          const demo = DEMO_DEALERS[id]
          if (demo) found.push(demo)
          else notFound.push(id)
        }
      }
      return { found, notFound }
    }
  } catch {
    // Fall through to demo data
  }

  // All from demo
  for (const id of dealerIds) {
    const demo = DEMO_DEALERS[id]
    if (demo) found.push(demo)
    else notFound.push(id)
  }

  return { found, notFound }
}

// ---------------------------------------------------------------------------
// POST /api/outreach/bulk
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = bulkSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.issues },
      { status: 400 }
    )
  }

  const { dealer_ids, type } = parsed.data

  // Currently only cold_email supports true bulk generation via Haiku
  if (type !== 'cold_email') {
    return NextResponse.json(
      { error: `Bulk generation for '${type}' is not yet supported. Use /api/outreach/generate for individual generation.` },
      { status: 400 }
    )
  }

  const { found: dealers, notFound } = await fetchDealers(dealer_ids)

  if (dealers.length === 0) {
    return NextResponse.json(
      { error: 'No valid dealers found for the provided IDs', not_found: notFound },
      { status: 404 }
    )
  }

  try {
    const results = await generateBulkColdEmails(dealers)

    return NextResponse.json({
      success: true,
      type: 'cold_email',
      generated: results.length,
      not_found: notFound.length > 0 ? notFound : undefined,
      results,
      message: `Generated ${results.length} personalised cold emails using AI (Haiku for bulk efficiency). Ready to send via /api/outreach/send.`,
    })
  } catch (error) {
    console.error('[OUTREACH BULK] Generation error:', error)
    return NextResponse.json(
      { error: 'Bulk generation failed. Check ANTHROPIC_API_KEY and try with fewer dealers.' },
      { status: 500 }
    )
  }
}
