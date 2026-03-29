import { NextRequest, NextResponse } from 'next/server'
import { runAllCollectors, deduplicateSignals } from '@/lib/signals/collectors'
import { insertSignals } from '@/lib/signals/collectors/insert'

/**
 * MASTER SIGNAL CRON — runs every 6 hours via Vercel Cron.
 *
 * GET /api/cron/signals
 *
 * Orchestrates all signal collectors in sequence, deduplicates
 * the results, and inserts new signals into va_signals.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this automatically for cron jobs)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[cron/signals] Unauthorized cron attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[cron/signals] === Starting signal collection run ===')
  const runStart = Date.now()

  try {
    // Run all collectors
    const { results, totalSignals, totalErrors, duration_ms } = await runAllCollectors()

    // Gather all signals and deduplicate
    const allSignals = results.flatMap((r) => r.signals)
    const uniqueSignals = deduplicateSignals(allSignals)

    console.log(
      `[cron/signals] Collection complete: ${totalSignals} raw, ${uniqueSignals.length} unique, ${totalErrors} errors, ${duration_ms}ms`
    )

    // Insert into database
    const { inserted, skipped, errors: insertErrors } = await insertSignals(uniqueSignals)

    const summary = {
      status: 'completed',
      run_at: new Date().toISOString(),
      duration_ms: Date.now() - runStart,
      collectors: results.map((r) => ({
        name: r.collector,
        signals_found: r.signals.length,
        errors: r.errors.length,
        duration_ms: r.duration_ms,
      })),
      totals: {
        raw_signals: totalSignals,
        unique_signals: uniqueSignals.length,
        inserted,
        skipped_duplicates: skipped,
        collector_errors: totalErrors,
        insert_errors: insertErrors.length,
      },
    }

    console.log('[cron/signals] === Run complete ===', JSON.stringify(summary.totals))

    return NextResponse.json(summary)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[cron/signals] Fatal error:', message)

    return NextResponse.json(
      {
        status: 'error',
        error: message,
        run_at: new Date().toISOString(),
        duration_ms: Date.now() - runStart,
      },
      { status: 500 }
    )
  }
}

// Vercel cron jobs need long execution times
export const maxDuration = 300 // 5 minutes
