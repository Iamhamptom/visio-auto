/**
 * Multi-source signal aggregator base interface.
 *
 * Visio Auto's wedge against AutoTrader Intelligence is that we aggregate
 * across MULTIPLE marketplaces (AutoTrader + Cars.co.za + Facebook + Gumtree
 * + dealer site) — AutoTrader can never aggregate competitors.
 *
 * Each source implements the same interface so the orchestrator can hit them
 * all in parallel, dedupe across sources, and deliver a unified signal stream.
 *
 * Sources are stubs by default — they return empty until scrape rules are
 * wired and rotated. This file is the contract; collectors live in sibling
 * files (autotrader.ts, cars-co-za.ts, facebook.ts, gumtree.ts, dealer-site.ts).
 */

import type { Signal } from "@/lib/types";

export type Marketplace =
  | "autotrader_sa"
  | "cars_co_za"
  | "facebook"
  | "gumtree"
  | "dealer_site"
  | "olx_sa"
  | "naamsa_proxy"
  | "linkedin_jobs"
  | "cipc_registrations"
  | "signal_engine";

export interface SourceConfig {
  /** Optional overrides — per-marketplace API keys / cookies / region. */
  region?: "ZA";
  brands?: string[];
  areas?: string[];
  since?: Date;
  limit?: number;
}

export interface SourceCollectionResult {
  marketplace: Marketplace;
  collected: number;
  signals: Partial<Signal>[];
  errors: string[];
  duration_ms: number;
  next_cursor?: string;
}

export abstract class BaseSignalSource {
  abstract readonly marketplace: Marketplace;
  abstract readonly enabled: boolean;
  abstract readonly description: string;

  /**
   * Collect new signals from this source. Implementations must be idempotent
   * (callers will dedupe across sources by phone/email/listing-id).
   */
  abstract collect(config: SourceConfig): Promise<SourceCollectionResult>;

  /**
   * Stamp every signal with the marketplace tag so the orchestrator can store
   * + the dashboard can filter.
   */
  protected tag(signals: Partial<Signal>[]): Partial<Signal>[] {
    return signals.map((s) => ({
      ...s,
      data_source: this.marketplace,
    }));
  }
}

export interface OrchestrationResult {
  total_collected: number;
  total_persisted: number;
  per_source: SourceCollectionResult[];
  duration_ms: number;
}
