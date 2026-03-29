import { NextRequest, NextResponse } from 'next/server'
import { processPhantomBusterPayload } from '@/lib/signals/collectors/social'
import { insertSignals } from '@/lib/signals/collectors/insert'

/**
 * PhantomBuster / External Social Data Ingestion Endpoint
 *
 * POST /api/signals/social/ingest
 *
 * Accepts an array of social media data items (from PhantomBuster
 * webhooks or manual uploads) and converts them into signals.
 *
 * Body: { "source": "phantombuster", "data": [...items] }
 */
export async function POST(request: NextRequest) {
  // Verify API key
  const authHeader = request.headers.get('authorization')
  const expectedKey = process.env.CRON_SECRET || process.env.VISIO_GATEWAY_KEY

  if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { source, data } = body as { source?: string; data?: Record<string, unknown>[] }

    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Body must include "data" array of social media items' },
        { status: 400 }
      )
    }

    console.log(`[social/ingest] Received ${data.length} items from ${source || 'unknown'}`)

    const signals = processPhantomBusterPayload(data)
    const { inserted, skipped, errors } = await insertSignals(signals)

    return NextResponse.json({
      source: source || 'unknown',
      items_received: data.length,
      signals_created: signals.length,
      inserted,
      skipped_duplicates: skipped,
      errors: errors.length,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[social/ingest] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
