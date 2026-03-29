import { NextRequest, NextResponse } from 'next/server'
import { COLLECTORS, runCollector, deduplicateSignals } from '@/lib/signals/collectors'
import { insertSignals } from '@/lib/signals/collectors/insert'

/**
 * Individual collector trigger — for manual testing and debugging.
 *
 * POST /api/cron/signals/collect
 * Body: { "collector": "cipc" | "linkedin" | "property" | "social" | "news" | "life_events" }
 */
export async function POST(request: NextRequest) {
  // Verify cron secret or service key
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const collectorName = body.collector as string

    if (!collectorName || !COLLECTORS[collectorName]) {
      return NextResponse.json(
        {
          error: `Invalid collector. Available: ${Object.keys(COLLECTORS).join(', ')}`,
        },
        { status: 400 }
      )
    }

    console.log(`[collect] Manually triggering collector: ${collectorName}`)

    const result = await runCollector(collectorName)
    const unique = deduplicateSignals(result.signals)
    const { inserted, skipped, errors: insertErrors } = await insertSignals(unique)

    return NextResponse.json({
      collector: collectorName,
      signals_found: result.signals.length,
      unique: unique.length,
      inserted,
      skipped_duplicates: skipped,
      collector_errors: result.errors,
      insert_errors: insertErrors,
      duration_ms: result.duration_ms,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[collect] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export const maxDuration = 120 // 2 minutes
