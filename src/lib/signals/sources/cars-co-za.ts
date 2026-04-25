/**
 * Cars.co.za signal collector.
 *
 * Cars.co.za pivoted to events + DealerCon — their listings are still the
 * second-largest SA car marketplace and a rich source of buyer intent.
 */

import { BaseSignalSource, type SourceConfig, type SourceCollectionResult } from "./base";

export class CarsCoZaSource extends BaseSignalSource {
  readonly marketplace = "cars_co_za" as const;
  readonly description = "Cars.co.za marketplace listings + saved-search proxies";

  get enabled(): boolean {
    return Boolean(process.env.CARS_COZA_SCRAPER_URL);
  }

  async collect(config: SourceConfig): Promise<SourceCollectionResult> {
    const start = Date.now();
    if (!this.enabled) {
      return {
        marketplace: this.marketplace,
        collected: 0,
        signals: [],
        errors: ["CARS_COZA_SCRAPER_URL not configured — collector idle"],
        duration_ms: Date.now() - start,
      };
    }

    try {
      const params = new URLSearchParams({ limit: String(config.limit ?? 50) });
      const res = await fetch(`${process.env.CARS_COZA_SCRAPER_URL}/signals?${params}`, {
        headers: { Authorization: `Bearer ${process.env.CARS_COZA_SCRAPER_KEY ?? ""}` },
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) {
        return {
          marketplace: this.marketplace,
          collected: 0,
          signals: [],
          errors: [`HTTP ${res.status}`],
          duration_ms: Date.now() - start,
        };
      }
      const data = (await res.json()) as { signals?: unknown[] };
      const signals = this.tag(Array.isArray(data.signals) ? (data.signals as Partial<import("@/lib/types").Signal>[]) : []);
      return {
        marketplace: this.marketplace,
        collected: signals.length,
        signals,
        errors: [],
        duration_ms: Date.now() - start,
      };
    } catch (err) {
      return {
        marketplace: this.marketplace,
        collected: 0,
        signals: [],
        errors: [err instanceof Error ? err.message : "unknown"],
        duration_ms: Date.now() - start,
      };
    }
  }
}
