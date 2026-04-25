/**
 * Single source of truth for Visio Auto subscription tiers.
 *
 * /pricing, /get-started, lib/payments/yoco, lib/orders/types, dashboard
 * settings — they all import from here. Change once, everything follows.
 */

export type TierKey = "free" | "starter" | "growth" | "pro" | "enterprise";

export interface Tier {
  key: TierKey;
  name: string;
  /** Display price in Rands (string for visual flexibility, e.g. "R5,000"). */
  priceLabel: string;
  /** Amount in cents — used by Yoco. */
  amountCents: number;
  period: string;
  leadsQuota: number;
  signalsQuotaPerDay: number;
  blurb: string;
  features: string[];
  /** Show a "most popular" highlight. */
  highlight?: boolean;
  /** Yoco TIER_AMOUNTS lookup key (must match what we send in checkout metadata). */
  yocoKey: string;
}

export const TIERS: Record<TierKey, Tier> = {
  free: {
    key: "free",
    name: "Free Trial",
    priceLabel: "R0",
    amountCents: 0,
    period: "",
    leadsQuota: 5,
    signalsQuotaPerDay: 3,
    blurb: "See Visio Auto in action. No credit card needed.",
    features: [
      "5 AI-qualified leads",
      "Basic dashboard",
      "WhatsApp delivery",
      "POPIA-clean lead receipts",
    ],
    yocoKey: "free",
  },
  starter: {
    key: "starter",
    name: "Starter",
    priceLabel: "R5,000",
    amountCents: 500_000,
    period: "/mo",
    leadsQuota: 25,
    signalsQuotaPerDay: 10,
    blurb: "For independent dealers running their first AI pipeline.",
    features: [
      "25 AI-qualified leads / month",
      "WhatsApp + email delivery",
      "Daily market briefs",
      "POPIA-clean lead receipts",
      "Affordability pre-decline checker (manual)",
    ],
    yocoKey: "starter",
  },
  growth: {
    key: "growth",
    name: "Growth",
    priceLabel: "R15,000",
    amountCents: 1_500_000,
    period: "/mo",
    leadsQuota: 100,
    signalsQuotaPerDay: 50,
    blurb: "The default plan for active SA dealerships.",
    features: [
      "100 AI-qualified leads / month",
      "Multi-source signal aggregation",
      "Voice agent (Retell) with 6 SA languages",
      "Affordability checker (auto)",
      "OEM pass-through detection",
      "Lead enrichment",
    ],
    highlight: true,
    yocoKey: "growth",
  },
  pro: {
    key: "pro",
    name: "Pro",
    priceLabel: "R50,000",
    amountCents: 5_000_000,
    period: "/mo",
    leadsQuota: 500,
    signalsQuotaPerDay: 200,
    blurb: "For multi-brand groups across multiple regions.",
    features: [
      "500 AI-qualified leads / month",
      "Multi-location dashboards",
      "API + webhook access",
      "Custom signal sources",
      "DealerCon-grade analytics",
    ],
    yocoKey: "pro",
  },
  enterprise: {
    key: "enterprise",
    name: "Enterprise",
    priceLabel: "R150,000",
    amountCents: 15_000_000,
    period: "/mo (from)",
    leadsQuota: 5000,
    signalsQuotaPerDay: 1000,
    blurb: "White-label for groups + OEMs. Custom AI training.",
    features: [
      "Unlimited leads",
      "White-label / dealer-co-branded UI",
      "Custom AI fine-tuning per group",
      "On-prem signal collectors",
      "Dedicated CSM + SLA",
    ],
    yocoKey: "enterprise",
  },
};

export const PAID_TIERS: Tier[] = [
  TIERS.starter,
  TIERS.growth,
  TIERS.pro,
  TIERS.enterprise,
];

export function tierFromKey(key: string | null | undefined): Tier | null {
  if (!key) return null;
  return TIERS[key as TierKey] ?? null;
}

/** Compatibility shim for existing code paths. */
export const TIER_AMOUNTS: Record<string, number> = Object.fromEntries(
  Object.values(TIERS).map((t) => [t.key, t.amountCents])
);

export const TIER_LABELS: Record<string, string> = Object.fromEntries(
  Object.values(TIERS).map((t) => [
    t.key,
    `${t.name} — ${t.priceLabel}${t.period}`,
  ])
);
