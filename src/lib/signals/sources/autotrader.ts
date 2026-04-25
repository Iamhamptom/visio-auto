/**
 * AutoTrader SA signal collector.
 *
 * AutoTrader Intelligence (their own AI suite) launched Nov 2025 — but they
 * cannot aggregate competitor platforms. We can. This collector mines public
 * AutoTrader listings for buyer intent signals (saved searches volume,
 * specific-VIN watchers, price-drop alerts, dealer-page traffic spikes).
 *
 * Implementation strategy:
 *   1. Public listing scrape (legal — public marketplace data) via Playwright.
 *   2. RSS / sitemap monitoring for new high-demand listings.
 *   3. (Out of scope here) Reverse-engineered "watchers count" if AutoTrader
 *      ever exposes one.
 *
 * This file is the interface — actual scrape rules live in a backgrounded
 * worker (Vercel Cron or external Playwright runner) to avoid Next.js cold-start
 * tax. The collector here pulls from the worker's queue.
 */

import { BaseSignalSource, type SourceConfig, type SourceCollectionResult } from "./base";

export class AutoTraderSASource extends BaseSignalSource {
  readonly marketplace = "autotrader_sa" as const;
  readonly description = "AutoTrader.co.za public listings + price-drop monitor";

  get enabled(): boolean {
    return Boolean(process.env.AUTOTRADER_SCRAPER_URL);
  }

  async collect(config: SourceConfig): Promise<SourceCollectionResult> {
    const start = Date.now();

    if (!this.enabled) {
      return {
        marketplace: this.marketplace,
        collected: 0,
        signals: [],
        errors: ["AUTOTRADER_SCRAPER_URL not configured — collector idle"],
        duration_ms: Date.now() - start,
      };
    }

    try {
      const params = new URLSearchParams();
      if (config.brands?.length) params.set("brands", config.brands.join(","));
      if (config.areas?.length) params.set("areas", config.areas.join(","));
      if (config.since) params.set("since", config.since.toISOString());
      params.set("limit", String(config.limit ?? 50));

      const res = await fetch(`${process.env.AUTOTRADER_SCRAPER_URL}/signals?${params}`, {
        headers: {
          Authorization: `Bearer ${process.env.AUTOTRADER_SCRAPER_KEY ?? ""}`,
        },
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

      const data = (await res.json()) as { signals?: unknown[]; cursor?: string };
      const signals = this.tag(Array.isArray(data.signals) ? (data.signals as Partial<import("@/lib/types").Signal>[]) : []);

      return {
        marketplace: this.marketplace,
        collected: signals.length,
        signals,
        errors: [],
        duration_ms: Date.now() - start,
        next_cursor: data.cursor,
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
