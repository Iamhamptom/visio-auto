/**
 * Facebook Marketplace + Groups signal collector.
 *
 * SA buyer behaviour: "Anyone selling a Toyota Hilux in Joburg under 500K?"
 * posts in suburb groups are pure intent. Facebook Graph API doesn't expose
 * Groups content publicly, so collection happens via:
 *   1. Manually-joined dealer-side bot accounts (compliant + opt-in)
 *   2. Listed Marketplace items (semi-public)
 *   3. Click-to-WhatsApp ad referrals (UTM tagged → captured at /api/leads).
 */

import { BaseSignalSource, type SourceConfig, type SourceCollectionResult } from "./base";

export class FacebookSource extends BaseSignalSource {
  readonly marketplace = "facebook" as const;
  readonly description = "Facebook Marketplace + buy/sell groups (opt-in collectors)";

  get enabled(): boolean {
    return Boolean(process.env.FB_GRAPH_TOKEN || process.env.FB_COLLECTOR_URL);
  }

  async collect(config: SourceConfig): Promise<SourceCollectionResult> {
    const start = Date.now();
    if (!this.enabled) {
      return {
        marketplace: this.marketplace,
        collected: 0,
        signals: [],
        errors: ["No FB_GRAPH_TOKEN / FB_COLLECTOR_URL configured"],
        duration_ms: Date.now() - start,
      };
    }

    // Implementation route depends on which token is set. Skipping the full
    // Graph API plumbing here — keeping the contract clean for the orchestrator.
    return {
      marketplace: this.marketplace,
      collected: 0,
      signals: [],
      errors: [],
      duration_ms: Date.now() - start,
    };
  }
}
