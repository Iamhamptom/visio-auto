import { NextRequest, NextResponse } from 'next/server'
import { getBalance, addCredits, CREDIT_PACKS, CREDIT_COSTS } from '@/lib/credits/system'

// GET /api/credits?dealer_id=X — Check balance + pricing
export async function GET(request: NextRequest) {
  const dealerId = request.nextUrl.searchParams.get('dealer_id')

  const balance = dealerId ? await getBalance(dealerId) : 0

  return NextResponse.json({
    balance,
    packs: CREDIT_PACKS,
    costs: Object.entries(CREDIT_COSTS).map(([key, v]) => ({
      action: key,
      cost: v.cost,
      label: v.label,
      free_preview: v.freePreview,
    })),
  })
}

// POST /api/credits — Add credits (called by Yoco webhook after purchase)
export async function POST(request: NextRequest) {
  try {
    const { dealer_id, credits, source } = await request.json()

    if (!dealer_id || !credits) {
      return NextResponse.json({ error: 'dealer_id and credits required' }, { status: 400 })
    }

    const newBalance = await addCredits(dealer_id, credits, source || 'manual')

    return NextResponse.json({
      success: true,
      credits_added: credits,
      new_balance: newBalance,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to add credits' }, { status: 500 })
  }
}
