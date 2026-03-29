import { NextRequest, NextResponse } from 'next/server'
import { collectRSSSignals } from '@/lib/signals/collectors/rss'
import { deduplicateSignals } from '@/lib/signals/collectors'
import { insertSignals } from '@/lib/signals/collectors/insert'

/**
 * RSS SIGNAL CRON — runs every 2 hours via Vercel Cron.
 *
 * GET /api/cron/signals/rss
 *
 * Fetches Google Alerts + SA business news RSS feeds,
 * deduplicates, and inserts new signals into va_signals.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[cron/signals/rss] Unauthorized cron attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[cron/signals/rss] === Starting RSS signal collection ===')
  const runStart = Date.now()

  try {
    // Collect from RSS feeds
    const rawSignals = await collectRSSSignals()

    // Deduplicate within this batch
    const uniqueSignals = deduplicateSignals(rawSignals)

    console.log(
      `[cron/signals/rss] Collection: ${rawSignals.length} raw, ${uniqueSignals.length} unique`
    )

    // Insert into database (insertSignals handles DB-level dedup by title)
    const { inserted, skipped, errors } = await insertSignals(uniqueSignals)

    const summary = {
      status: 'completed',
      collector: 'rss',
      run_at: new Date().toISOString(),
      duration_ms: Date.now() - runStart,
      raw_signals: rawSignals.length,
      unique_signals: uniqueSignals.length,
      inserted,
      skipped_duplicates: skipped,
      insert_errors: errors.length,
    }

    console.log('[cron/signals/rss] === Run complete ===', JSON.stringify(summary))
    return NextResponse.json(summary)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[cron/signals/rss] Fatal error:', message)

    return NextResponse.json(
      {
        status: 'error',
        collector: 'rss',
        error: message,
        run_at: new Date().toISOString(),
        duration_ms: Date.now() - runStart,
      },
      { status: 500 }
    )
  }
}

// RSS feeds are lightweight — 60s is plenty
export const maxDuration = 60
