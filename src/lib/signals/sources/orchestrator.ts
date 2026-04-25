/**
 * Multi-source signal orchestrator.
 *
 * Hits every enabled source in parallel, dedupes across sources, and persists
 * to va_signals with a `source_marketplace` tag so the dashboard can filter.
 */

import { BaseSignalSource, type OrchestrationResult, type SourceConfig } from "./base";
import { AutoTraderSASource } from "./autotrader";
import { CarsCoZaSource } from "./cars-co-za";
import { FacebookSource } from "./facebook";

const SOURCES: BaseSignalSource[] = [
  new AutoTraderSASource(),
  new CarsCoZaSource(),
  new FacebookSource(),
];

function dedupeKey(s: Partial<import("@/lib/types").Signal>): string {
  return [
    s.person_phone ?? "",
    s.person_email ?? "",
    s.person_name ?? "",
    s.signal_type ?? "",
    s.title ?? "",
  ]
    .join("|")
    .toLowerCase();
}

export async function orchestrateCollection(config: SourceConfig = {}): Promise<OrchestrationResult> {
  const start = Date.now();
  const enabled = SOURCES.filter((s) => s.enabled);

  const results = await Promise.all(enabled.map((s) => s.collect(config)));

  // Dedupe across sources.
  const seen = new Map<string, Partial<import("@/lib/types").Signal>>();
  for (const r of results) {
    for (const sig of r.signals) {
      const key = dedupeKey(sig);
      const existing = seen.get(key);
      if (!existing) {
        seen.set(key, sig);
      } else if ((sig.buying_probability ?? 0) > (existing.buying_probability ?? 0)) {
        // Keep the source with higher confidence.
        seen.set(key, sig);
      }
    }
  }

  const merged = Array.from(seen.values());
  let persisted = 0;

  if (merged.length > 0) {
    try {
      const { createServiceClient } = await import("@/lib/supabase/service");
      const supabase = createServiceClient();
      const { count } = await supabase
        .from("va_signals")
        .upsert(merged, { count: "exact", onConflict: "id", ignoreDuplicates: true });
      persisted = count ?? 0;
    } catch (err) {
      console.error("[orchestrator] persist failed:", err);
    }
  }

  return {
    total_collected: results.reduce((s, r) => s + r.collected, 0),
    total_persisted: persisted,
    per_source: results,
    duration_ms: Date.now() - start,
  };
}

export function listSources() {
  return SOURCES.map((s) => ({
    marketplace: s.marketplace,
    description: s.description,
    enabled: s.enabled,
  }));
}
