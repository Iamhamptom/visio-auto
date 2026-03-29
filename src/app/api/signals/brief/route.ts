import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { generateSignalBrief } from '@/lib/signals/agent'
import type { Dealer, Signal } from '@/lib/types'

// ---------------------------------------------------------------------------
// GET /api/signals/brief — Dealer Intelligence Brief
//
// Generates a personalized AI morning briefing for a specific dealer.
// Query params:
//   - dealer_id (required)
//   - period: "today" | "this_week" (default: "today")
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const dealerId = searchParams.get('dealer_id')
  const period = searchParams.get('period') ?? 'today'

  if (!dealerId) {
    return NextResponse.json(
      { error: 'Missing dealer_id query parameter' },
      { status: 400 }
    )
  }

  if (period !== 'today' && period !== 'this_week') {
    return NextResponse.json(
      { error: 'Invalid period — must be "today" or "this_week"' },
      { status: 400 }
    )
  }

  const supabase = createServiceClient()

  try {
    // Fetch dealer
    const { data: dealer, error: dealerErr } = await supabase
      .from('va_dealers')
      .select('*')
      .eq('id', dealerId)
      .single()

    if (dealerErr || !dealer) {
      return NextResponse.json(
        { error: `Dealer not found: ${dealerId}` },
        { status: 404 }
      )
    }

    // Build date filter
    const now = new Date()
    let since: Date

    if (period === 'today') {
      since = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    } else {
      // this_week: last 7 days
      since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Fetch signals relevant to this dealer's area and city
    let query = supabase
      .from('va_signals')
      .select('*')
      .gte('created_at', since.toISOString())
      .order('buying_probability', { ascending: false })
      .limit(20)

    // Filter by dealer's area/city for relevance
    // We fetch broadly and let the AI prioritize
    if ((dealer as Dealer).city) {
      query = query.or(
        `city.eq.${(dealer as Dealer).city},city.is.null`
      )
    }

    const { data: signals, error: signalErr } = await query

    if (signalErr) {
      console.error('[brief] Failed to fetch signals:', signalErr.message)
      return NextResponse.json(
        { error: 'Failed to fetch signals' },
        { status: 500 }
      )
    }

    // Generate AI brief
    const brief = await generateSignalBrief(
      (signals as Signal[]) ?? [],
      dealer as Dealer
    )

    return NextResponse.json({
      dealer_id: dealerId,
      dealer_name: (dealer as Dealer).name,
      period,
      signals_count: signals?.length ?? 0,
      generated_at: new Date().toISOString(),
      brief,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[brief] Error:', message)
    return NextResponse.json(
      { error: 'Failed to generate brief', detail: message },
      { status: 500 }
    )
  }
}
