import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { routeSignalToDealers } from '@/lib/signals/agent'
import type { Dealer, Signal } from '@/lib/types'

// ---------------------------------------------------------------------------
// POST /api/signals/route-to-dealer — Manual Signal Routing
//
// Route a specific signal to the best matching dealers using AI reasoning.
// Body: { signal_id: string }
// Returns: top 3 dealer matches with explanations
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  let body: { signal_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { signal_id } = body

  if (!signal_id) {
    return NextResponse.json(
      { error: 'Missing signal_id in request body' },
      { status: 400 }
    )
  }

  const supabase = createServiceClient()

  try {
    // Fetch the signal
    const { data: signal, error: signalErr } = await supabase
      .from('va_signals')
      .select('*')
      .eq('id', signal_id)
      .single()

    if (signalErr || !signal) {
      return NextResponse.json(
        { error: `Signal not found: ${signal_id}` },
        { status: 404 }
      )
    }

    // Fetch active dealers
    const { data: dealerRows, error: dealerErr } = await supabase
      .from('va_dealers')
      .select('*')
      .eq('is_active', true)

    if (dealerErr || !dealerRows || dealerRows.length === 0) {
      return NextResponse.json(
        { error: 'No active dealers available for routing' },
        { status: 404 }
      )
    }

    const dealers = dealerRows as Dealer[]
    const typedSignal = signal as Signal

    // Run AI-powered routing
    const matches = await routeSignalToDealers(typedSignal, dealers)

    // Enrich matches with dealer details
    const enrichedMatches = matches.map((match) => {
      const dealer = dealers.find((d) => d.id === match.dealer_id)
      return {
        ...match,
        dealer_name: dealer?.name ?? 'Unknown',
        dealer_brands: dealer?.brands ?? [],
        dealer_area: dealer?.area ?? 'Unknown',
        dealer_tier: dealer?.tier ?? 'starter',
      }
    })

    return NextResponse.json({
      signal_id,
      signal_title: typedSignal.title,
      signal_type: typedSignal.signal_type,
      buying_probability: typedSignal.buying_probability,
      matches: enrichedMatches,
      routed_at: new Date().toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[route-to-dealer] Error:', message)
    return NextResponse.json(
      { error: 'Failed to route signal', detail: message },
      { status: 500 }
    )
  }
}
