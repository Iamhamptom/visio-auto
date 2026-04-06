/**
 * Signal Collector Registry
 *
 * Central registry of all signal collectors.
 * Each collector is independently fault-tolerant.
 */

import type { CollectedSignal, CollectorFn, CollectorResult } from './types'
import { collectCIPCSignals } from './cipc'
import { collectLinkedInSignals } from './linkedin'
import { collectPropertySignals } from './property'
import { collectSocialSignals } from './social'
import { collectNewsSignals } from './news'
import { collectLifeEventSignals } from './life-events'
import { collectRSSSignals } from './rss'
import { collectCalendarSignals } from './calendar'
import { collectYouTubeSignals } from './youtube'
import { collectFacebookSignals } from './facebook-groups'

export const COLLECTORS: Record<string, CollectorFn> = {
  cipc: collectCIPCSignals,
  linkedin: collectLinkedInSignals,
  property: collectPropertySignals,
  social: collectSocialSignals,
  news: collectNewsSignals,
  life_events: collectLifeEventSignals,
  rss: collectRSSSignals,
  calendar: collectCalendarSignals,
  youtube: collectYouTubeSignals,
  facebook: collectFacebookSignals,
}

export type CollectorName = keyof typeof COLLECTORS

/**
 * Run a single collector with error handling and timing.
 */
export async function runCollector(name: string): Promise<CollectorResult> {
  const fn = COLLECTORS[name]
  if (!fn) {
    return {
      collector: name,
      signals: [],
      errors: [`Unknown collector: ${name}`],
      duration_ms: 0,
    }
  }

  const start = Date.now()
  try {
    const signals = await fn()
    return {
      collector: name,
      signals,
      errors: [],
      duration_ms: Date.now() - start,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[collectors] ${name} failed:`, message)
    return {
      collector: name,
      signals: [],
      errors: [message],
      duration_ms: Date.now() - start,
    }
  }
}

/**
 * Run ALL collectors in sequence (to avoid rate-limiting on Google).
 * Returns aggregated results.
 */
export async function runAllCollectors(): Promise<{
  results: CollectorResult[]
  totalSignals: number
  totalErrors: number
  duration_ms: number
}> {
  const start = Date.now()
  const results: CollectorResult[] = []

  for (const name of Object.keys(COLLECTORS)) {
    console.log(`[collectors] Running: ${name}`)
    const result = await runCollector(name)
    results.push(result)
    console.log(
      `[collectors] ${name}: ${result.signals.length} signals, ${result.errors.length} errors, ${result.duration_ms}ms`
    )

    // Brief pause between collectors to avoid Google throttling
    await new Promise((r) => setTimeout(r, 2000))
  }

  const totalSignals = results.reduce((sum, r) => sum + r.signals.length, 0)
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0)

  return {
    results,
    totalSignals,
    totalErrors,
    duration_ms: Date.now() - start,
  }
}

/**
 * Deduplicate signals by title similarity.
 * Prevents inserting the same signal detected by multiple collectors.
 */
export function deduplicateSignals(signals: CollectedSignal[]): CollectedSignal[] {
  const seen = new Set<string>()
  const unique: CollectedSignal[] = []

  for (const signal of signals) {
    // Normalize title for comparison
    const key = signal.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 80)
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(signal)
    }
  }

  return unique
}
