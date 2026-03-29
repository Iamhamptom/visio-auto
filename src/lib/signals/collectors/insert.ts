/**
 * Signal insertion into Supabase with deduplication.
 */

import { createServiceClient } from '@/lib/supabase/service'
import type { CollectedSignal } from './types'

/**
 * Insert collected signals into the va_signals table.
 * Skips any signal whose title already exists (dedup by title).
 * Returns the count of newly inserted signals.
 */
export async function insertSignals(signals: CollectedSignal[]): Promise<{
  inserted: number
  skipped: number
  errors: string[]
}> {
  if (signals.length === 0) {
    return { inserted: 0, skipped: 0, errors: [] }
  }

  const supabase = createServiceClient()
  let inserted = 0
  let skipped = 0
  const errors: string[] = []

  // Process in batches of 10
  const batchSize = 10
  for (let i = 0; i < signals.length; i += batchSize) {
    const batch = signals.slice(i, i + batchSize)

    for (const signal of batch) {
      try {
        // Check for existing signal with same title (dedup)
        const { data: existing } = await supabase
          .from('va_signals')
          .select('id')
          .eq('title', signal.title)
          .limit(1)
          .maybeSingle()

        if (existing) {
          skipped++
          continue
        }

        // Insert the signal
        const { error } = await supabase.from('va_signals').insert({
          signal_type: signal.signal_type,
          title: signal.title,
          description: signal.description,
          person_name: signal.person_name || null,
          person_phone: signal.person_phone || null,
          person_email: signal.person_email || null,
          person_linkedin: signal.person_linkedin || null,
          company_name: signal.company_name || null,
          area: signal.area || null,
          city: signal.city || null,
          province: signal.province || 'Gauteng',
          data_source: signal.data_source,
          source_url: signal.source_url || null,
          signal_strength: signal.signal_strength,
          buying_probability: signal.buying_probability,
          estimated_budget_min: signal.estimated_budget_min || null,
          estimated_budget_max: signal.estimated_budget_max || null,
          vehicle_type_likely: signal.vehicle_type_likely || null,
          is_processed: false,
        })

        if (error) {
          console.error(`[insert] Failed to insert signal "${signal.title}":`, error.message)
          errors.push(`${signal.title}: ${error.message}`)
        } else {
          inserted++
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error(`[insert] Exception inserting signal:`, msg)
        errors.push(`${signal.title}: ${msg}`)
      }
    }
  }

  console.log(`[insert] Done: ${inserted} inserted, ${skipped} skipped, ${errors.length} errors`)
  return { inserted, skipped, errors }
}
