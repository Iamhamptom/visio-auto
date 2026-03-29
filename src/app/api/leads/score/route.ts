import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { scoreLead } from '@/lib/ai/scoring'

// ---------------------------------------------------------------------------
// POST — Re-score a lead with updated data
// ---------------------------------------------------------------------------

const ScoreLeadSchema = z.object({
  budget_min: z.number().optional().nullable(),
  budget_max: z.number().optional().nullable(),
  timeline: z.enum(['this_week', 'this_month', 'three_months', 'just_browsing']).optional().nullable(),
  finance_status: z.enum(['pre_approved', 'needs_finance', 'cash', 'unknown']).optional().nullable(),
  has_trade_in: z.boolean().optional(),
  preferred_brand: z.string().optional().nullable(),
  preferred_model: z.string().optional().nullable(),
  preferred_type: z.string().optional().nullable(),
  source: z.string().optional(),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = ScoreLeadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.format() },
      { status: 400 }
    )
  }

  const { score, tier } = scoreLead({
    budget_min: parsed.data.budget_min,
    budget_max: parsed.data.budget_max,
    timeline: parsed.data.timeline,
    finance_status: parsed.data.finance_status,
    has_trade_in: parsed.data.has_trade_in,
    preferred_brand: parsed.data.preferred_brand,
    preferred_model: parsed.data.preferred_model,
    preferred_type: parsed.data.preferred_type,
    source: parsed.data.source,
  })

  return NextResponse.json({
    ai_score: score,
    score_tier: tier,
    breakdown: {
      budget_points: (parsed.data.budget_min || parsed.data.budget_max) ? (parsed.data.budget_min && parsed.data.budget_max ? 20 : 15) : 0,
      timeline_points: ({ this_week: 25, this_month: 18, three_months: 10, just_browsing: 2 })[parsed.data.timeline ?? 'just_browsing'] ?? 0,
      finance_points: ({ pre_approved: 20, cash: 18, needs_finance: 8, unknown: 0 })[parsed.data.finance_status ?? 'unknown'] ?? 0,
      trade_in_points: parsed.data.has_trade_in ? 10 : 0,
      specificity_points:
        (parsed.data.preferred_brand ? 5 : 0) +
        (parsed.data.preferred_model ? 5 : 0) +
        (parsed.data.preferred_type && parsed.data.preferred_type !== 'any' ? 5 : 0),
    },
  })
}
