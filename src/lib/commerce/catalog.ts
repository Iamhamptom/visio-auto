/**
 * Visio Auto Commerce Catalog
 *
 * Single source of truth for every purchasable SKU across the suite.
 * Three families:
 *
 *   1. SUBSCRIPTIONS — recurring monthly billing (BDC, Trust, Approve dealer,
 *      Intent, Inspect dealer, Open Finance dealer)
 *   2. ONE-OFF ORDERS — single purchase (Inspect reports, Open Finance audit,
 *      lead packs, market reports)
 *   3. CUSTOM — quoted, not self-serve (Concierge, Enterprise OEM contracts)
 *
 * Every entry has a stable `sku` (used in DB rows + Yoco metadata + entitlement
 * grants), human-readable label, ZAR cents amount, and a `grants` array
 * describing which suite products it unlocks.
 *
 * Add new SKUs here. Database, API routes, Jess tools, and UI all read from
 * this constant — never hard-code prices anywhere else.
 */

import type { SuiteProductKey } from "@/lib/suite";

export type CatalogFamily = "subscription" | "one_off" | "custom";

export type EntitlementKey =
  | `${SuiteProductKey}:${"starter" | "pro" | "scale" | "growth" | "enterprise" | "velocity" | "complete" | "embed" | "unlimited"}`
  | "leads:base"
  | "concierge:engagement";

export interface CatalogItem {
  sku: string;
  family: CatalogFamily;
  product: SuiteProductKey | "leads" | "concierge";
  tier?: string;
  label: string;
  shortDescription: string;
  longDescription: string;
  /** ZAR cents. 0 for free tier. -1 for "quote on request". */
  amountCents: number;
  /** Recurring billing cadence in days. null for one-off. */
  billingCadenceDays: number | null;
  /** Optional revenue-share component (e.g. 0.01 for 1% GMV). */
  revenueSharePct?: number;
  /** What this purchase unlocks. */
  grants: EntitlementKey[];
  /** Suggested headline value point (used by Jess in pitches). */
  valueHook: string;
  /** Bullet list of what's included. */
  includes: string[];
  /** Whether Jess can sell this SKU directly (false = quote-only). */
  selfServe: boolean;
}

// ─────────────────────────────────────────────────────────────────────
// SUBSCRIPTIONS — recurring monthly
// ─────────────────────────────────────────────────────────────────────

const SUBSCRIPTIONS: CatalogItem[] = [
  // ── Visio BDC ──
  {
    sku: "bdc-starter",
    family: "subscription",
    product: "bdc",
    tier: "starter",
    label: "Visio BDC — Starter",
    shortDescription: "WhatsApp BDC for solo dealers and small lots",
    longDescription:
      "Solo dealer or small lot, 1 user, 50 leads/month, 10 of the 38 buying-intent signals, English templates only. The cheapest credible BDC tool in South Africa.",
    amountCents: 150_000,
    billingCadenceDays: 30,
    grants: ["bdc:starter"],
    valueHook: "Start running WhatsApp lead routing for less than the cost of a single magazine ad.",
    includes: [
      "1 dealership user",
      "Up to 50 leads/month",
      "10 buying-intent signals",
      "English message templates",
      "WhatsApp Business connection",
      "Unified inbox + Kanban pipeline",
    ],
    selfServe: true,
  },
  {
    sku: "bdc-pro",
    family: "subscription",
    product: "bdc",
    tier: "pro",
    label: "Visio BDC — Pro",
    shortDescription: "The anchor tier — full BDC for a 5-user dealership",
    longDescription:
      "5-user dealership, 500 leads/month, all 38 buying-intent signals, EN + Afrikaans + Zulu templates, WhatsApp routing + escalation, Kanban pipeline, signal-driven automations.",
    amountCents: 300_000,
    billingCadenceDays: 30,
    grants: ["bdc:pro"],
    valueHook:
      "0.018% of monthly GMV for the only WhatsApp-native BDC that runs in three SA languages.",
    includes: [
      "5 dealership users",
      "Up to 500 leads/month",
      "All 38 buying-intent signals",
      "Templates in English + Afrikaans + Zulu",
      "WhatsApp + email + SMS routing",
      "SLA-based escalation",
      "Unified inbox + Kanban pipeline",
      "Conversation analytics",
    ],
    selfServe: true,
  },
  {
    sku: "bdc-scale",
    family: "subscription",
    product: "bdc",
    tier: "scale",
    label: "Visio BDC — Scale",
    shortDescription: "Multi-rooftop dealer group with white-label",
    longDescription:
      "Multi-rooftop dealer group (Motus, CMH-style operations). Unlimited users + leads, white-label option, multi-tenant analytics across rooftops, dedicated CSM.",
    amountCents: 500_000,
    billingCadenceDays: 30,
    grants: ["bdc:scale"],
    valueHook: "Run an entire dealer group on one BDC stack — at 1/10 the price of Conversica.",
    includes: [
      "Unlimited users + leads",
      "All 38 signals",
      "White-label branding",
      "Cross-rooftop analytics",
      "Dedicated CSM",
      "API + webhook access",
    ],
    selfServe: true,
  },

  // ── Visio Trust ──
  {
    sku: "trust-starter",
    family: "subscription",
    product: "trust",
    tier: "starter",
    label: "Visio Trust — Starter",
    shortDescription: "Up to 50 listings, basic Inspect + Approve widgets",
    longDescription:
      "Entry into the unified transaction OS. Up to 50 listings on the dealer's site, basic Inspect condition reports, Visio Approve widget embedded on listing pages.",
    amountCents: 300_000,
    billingCadenceDays: 30,
    grants: ["trust:starter"],
    valueHook: "Trust + condition + finance — embedded on every listing for less than R10/day.",
    includes: [
      "Up to 50 active listings",
      "Basic Visio Inspect reports",
      "Visio Approve widget embed",
      "Buyer trust badge",
    ],
    selfServe: true,
  },
  {
    sku: "trust-velocity",
    family: "subscription",
    product: "trust",
    tier: "velocity",
    label: "Visio Trust — Velocity (anchor)",
    shortDescription: "Stock velocity dashboard. The math-obvious dealer ROI tier.",
    longDescription:
      "The anchor tier of the entire suite. Unlimited listings, Inspect + Approve on every car, signal routing, stock velocity dashboard showing days-on-lot vs benchmark, F&I attach rate analytics. The R1.25M floorplan-saving math from the VRL paper applies here.",
    amountCents: 800_000,
    billingCadenceDays: 30,
    grants: ["trust:velocity", "inspect:unlimited", "approve:embed"],
    valueHook:
      "Save R1.25M/year in floorplan interest by shaving 18 days off your average days-on-lot. ROI ~13×.",
    includes: [
      "Unlimited listings",
      "Visio Inspect on every car",
      "Visio Approve on every listing",
      "Stock velocity dashboard",
      "Signal routing from Visio BDC",
      "F&I attach rate analytics",
      "Days-on-lot benchmarking",
    ],
    selfServe: true,
  },
  {
    sku: "trust-complete",
    family: "subscription",
    product: "trust",
    tier: "complete",
    label: "Visio Trust — Complete",
    shortDescription: "The full Carvana experience + 1% GMV transaction fee",
    longDescription:
      "Everything in Velocity plus Visio Open Finance for thin-file buyers, escrow integration (Stitch EscrowPay or attorney trust), delivery orchestration, 7-day return guarantee, Visio Intent market data feed, dedicated CSM. Plus 1% of GMV on transactions flowing through escrow.",
    amountCents: 1_500_000,
    billingCadenceDays: 30,
    revenueSharePct: 0.01,
    grants: [
      "trust:complete",
      "inspect:unlimited",
      "approve:embed",
      "open-finance:embed",
      "intent:starter",
    ],
    valueHook:
      "The Carvana experience for SA used cars — without owning a single vehicle. Asset-light. Capital-light. Trust-heavy.",
    includes: [
      "Everything in Velocity",
      "Visio Open Finance for buyers",
      "Bonded escrow (Stitch or attorney)",
      "Delivery orchestration (Loop / Picup)",
      "7-day return guarantee",
      "Visio Intent market pricing alerts",
      "Dedicated CSM",
      "1% of escrow GMV (transaction fee)",
    ],
    selfServe: true,
  },

  // ── Visio Approve dealer embed ──
  {
    sku: "approve-embed",
    family: "subscription",
    product: "approve",
    tier: "embed",
    label: "Visio Approve — Dealer Embed",
    shortDescription: "Embed the 90-second pre-approval widget on every listing",
    longDescription:
      "Visio Approve is free for consumers. Dealers can embed the widget on their listing pages for R3,000/month — captures the lead, runs the Reg 23A engine, surfaces the four bank rates, and routes Green-light buyers directly to your F&I desk.",
    amountCents: 300_000,
    billingCadenceDays: 30,
    grants: ["approve:embed"],
    valueHook:
      "Stop wasting F&I desk hours on rejected applications. Filter Green / Amber / Red before the buyer walks in.",
    includes: [
      "Widget embed on every listing",
      "Lead capture + Reg 23A scoring",
      "4-bank rate comparison",
      "Approval likelihood routing",
      "Lead enrichment + handoff",
      "Analytics dashboard",
    ],
    selfServe: true,
  },

  // ── Visio Inspect dealer ──
  {
    sku: "inspect-unlimited",
    family: "subscription",
    product: "inspect",
    tier: "unlimited",
    label: "Visio Inspect — Dealer Unlimited",
    shortDescription: "Unlimited 12-photo AI condition reports for your stock",
    longDescription:
      "Standalone unlimited Visio Inspect for dealers who want condition reports on every vehicle. Includes the Verified by Visio badge, VIN OCR, odometer OCR, and confidence-gated grading. Already included in Visio Trust Velocity and Complete tiers.",
    amountCents: 29_900,
    billingCadenceDays: 30,
    grants: ["inspect:unlimited"],
    valueHook:
      "AI condition reports for your entire used stock for less than the cost of a single workshop inspection.",
    includes: [
      "Unlimited Visio Inspect reports",
      "Verified by Visio badge eligibility",
      "VIN + odometer OCR",
      "Confidence-gated grading",
      "Branded PDF + web reports",
    ],
    selfServe: true,
  },

  // ── Visio Intent ──
  {
    sku: "intent-starter",
    family: "subscription",
    product: "intent",
    tier: "starter",
    label: "Visio Intent — Starter",
    shortDescription: "Brand-level intent data, weekly resolution, PDF reports",
    longDescription:
      "Brand-level buying intent data refreshed weekly. PDF reports delivered every Monday morning. 4-week historical view. K-anonymity-protected aggregates. The entry tier for OEM marketing teams and small bank credit-ops teams.",
    amountCents: 500_000,
    billingCadenceDays: 30,
    grants: ["intent:starter"],
    valueHook:
      "The forward-looking intent layer that Lightstone and TransUnion don't publish — for less than a single market research project.",
    includes: [
      "Brand-level intent data",
      "Weekly resolution",
      "4-week history",
      "Monday morning PDF reports",
      "K-anonymity protected",
      "Methodology page included",
    ],
    selfServe: true,
  },
  {
    sku: "intent-growth",
    family: "subscription",
    product: "intent",
    tier: "growth",
    label: "Visio Intent — Growth",
    shortDescription: "Region × Segment, daily resolution, REST API + CSV export",
    longDescription:
      "Region × Segment drilldown. Daily resolution. 12-week historical view. CSV export. REST API access. Built for bank credit-ops teams reducing cost-per-qualified-lead and OEM marketing teams reallocating co-op spend.",
    amountCents: 1_500_000,
    billingCadenceDays: 30,
    grants: ["intent:growth"],
    valueHook:
      "Reduce cost-per-qualified-lead by 30-40% by bidding on the postcodes seeing application-stage intent right now.",
    includes: [
      "Brand × Region × Segment data",
      "Daily resolution",
      "12-week history",
      "CSV export",
      "REST API access",
      "Application-stage signal feed",
    ],
    selfServe: true,
  },
  {
    sku: "intent-enterprise",
    family: "subscription",
    product: "intent",
    tier: "enterprise",
    label: "Visio Intent — Enterprise",
    shortDescription: "Raw signal-type drilldown, real-time access, dedicated CSM",
    longDescription:
      "Raw signal-type drilldown across all 38 buying-intent signals. Real-time data feed. Custom queries built for your specific OEM or bank use case. Dedicated CSM. The R50K-per-month tier that pays for itself by reallocating R5-10M of co-op marketing.",
    amountCents: 5_000_000,
    billingCadenceDays: 30,
    grants: ["intent:enterprise"],
    valueHook:
      "Reallocate R5-10M of dealer co-op spend per quarter toward higher-intent regions. ROI ~20×.",
    includes: [
      "All 38 raw signal types",
      "Real-time data feed",
      "Custom query support",
      "Dedicated Customer Success Manager",
      "Quarterly executive briefing",
      "Custom data point engineering",
    ],
    selfServe: true,
  },

  // ── Visio Open Finance dealer ──
  {
    sku: "open-finance-embed",
    family: "subscription",
    product: "open-finance",
    tier: "embed",
    label: "Visio Open Finance — Dealer Embed",
    shortDescription: "Bank-statement affordability for thin-file buyers on your listings",
    longDescription:
      "Embed the Visio Open Finance bank-statement upload + audit-grade affordability assessment on your dealer site. Unlocks the 25% of buyers rejected by bureau-only systems. Lead handoff to participating banks (R300-R800 per audit-grade report).",
    amountCents: 29_900,
    billingCadenceDays: 30,
    grants: ["open-finance:embed"],
    valueHook:
      "Approve the gig workers, freelancers, and contract employees the bureaus can't see — and earn lead-fees from the banks.",
    includes: [
      "Bank-statement upload widget",
      "NCA Section 81 affordability engine",
      "Audit-grade PDF reports",
      "Bank lead-fee handoff (R300-R800/lead)",
      "POPIA-compliant 90-day retention",
    ],
    selfServe: true,
  },
];

// ─────────────────────────────────────────────────────────────────────
// ONE-OFF ORDERS — single purchase
// ─────────────────────────────────────────────────────────────────────

const ONE_OFFS: CatalogItem[] = [
  {
    sku: "inspect-report-single",
    family: "one_off",
    product: "inspect",
    label: "Visio Inspect — Single Report",
    shortDescription: "One AI-graded 12-photo condition report",
    longDescription:
      "One Visio Inspect report. 12 photos guided by the wizard, AI-graded by Gemini 2.5 Vision with confidence-gated panel scores, VIN + odometer OCR, branded shareable web report. Free for the first report per phone number.",
    amountCents: 4_900,
    billingCadenceDays: null,
    grants: [],
    valueHook:
      "0.012% of the average SA used-car transaction value — the cheapest credible trust signal in the market.",
    includes: [
      "12-photo guided wizard",
      "AI-graded condition score (A/B/C/D)",
      "Recon cost band",
      "Verified by Visio badge eligibility",
      "VIN + odometer OCR",
      "Shareable web report",
    ],
    selfServe: true,
  },
  {
    sku: "open-finance-audit-pdf",
    family: "one_off",
    product: "open-finance",
    label: "Visio Open Finance — Audit-Grade PDF",
    shortDescription: "Bank-grade affordability report from your bank statements",
    longDescription:
      "Upload 3 months of bank statements. Gemini 2.5 Flash parses every transaction, classifies into 46 SA expense categories, detects recurring obligations, runs the NCA Section 81 + Reg 23A engine, and produces an audit-grade PDF with a public verify endpoint that any participating bank can call.",
    amountCents: 9_900,
    billingCadenceDays: null,
    grants: [],
    valueHook:
      "Banks fast-track applications with this PDF in hand — turn a 5-day decision into a 5-hour decision.",
    includes: [
      "3-month bank statement parse",
      "46-category classification",
      "Recurring obligation detection",
      "NCA Section 81 + Reg 23A affordability score",
      "Audit-grade PDF report",
      "Public verify endpoint for banks",
    ],
    selfServe: true,
  },
  {
    sku: "leads-pack-25",
    family: "one_off",
    product: "leads",
    label: "Lead Pack — 25 Qualified Leads",
    shortDescription: "25 AI-qualified buyer leads from the signal pool",
    longDescription:
      "25 buyer leads from the Visio Auto signal engine, qualified to the dealer's brand and region. Delivered via WhatsApp + dashboard. Each lead includes signal source, intent score, vehicle preferences, and contact information (POPIA-consented).",
    amountCents: 300_000,
    billingCadenceDays: null,
    grants: ["leads:base"],
    valueHook:
      "R120 per qualified lead — half the cost of bidding for the same buyer on Google Ads.",
    includes: [
      "25 AI-qualified buyer leads",
      "Brand + region matched",
      "Signal source disclosed",
      "Intent score (0-100)",
      "WhatsApp delivery within 30 seconds of generation",
      "POPIA-consented",
    ],
    selfServe: true,
  },
  {
    sku: "leads-pack-100",
    family: "one_off",
    product: "leads",
    label: "Lead Pack — 100 Qualified Leads",
    shortDescription: "100 AI-qualified buyer leads — best volume value",
    longDescription:
      "100 buyer leads from the Visio Auto signal engine. Bulk discount applied (R100 per lead vs R120 for the 25-pack). Same quality, same delivery, same POPIA compliance.",
    amountCents: 1_000_000,
    billingCadenceDays: null,
    grants: ["leads:base"],
    valueHook:
      "100 leads at R100 each — bulk-rate access to the same signal pool that powers Visio BDC.",
    includes: [
      "100 AI-qualified buyer leads",
      "All 25-pack features",
      "Bulk volume discount (R100/lead)",
      "Priority routing on hot signals",
    ],
    selfServe: true,
  },
];

// ─────────────────────────────────────────────────────────────────────
// CUSTOM — quote on request
// ─────────────────────────────────────────────────────────────────────

const CUSTOM: CatalogItem[] = [
  {
    sku: "concierge-engagement",
    family: "custom",
    product: "concierge",
    label: "Visio Concierge — UHNW African Luxury Engagement",
    shortDescription: "End-to-end UHNW luxury car concierge for African HNW buyers",
    longDescription:
      "White-glove concierge service for UHNW buyers in Lagos, Lubumbashi, Luanda, Nairobi, Accra, Abidjan, Casablanca, or Cairo. Multilingual (EN/FR/PT/SW/AR/Lingala/Pidgin), bonded escrow, RoRo logistics from Durban, white-glove handover at residence. Quoted per engagement.",
    amountCents: -1,
    billingCadenceDays: null,
    grants: ["concierge:engagement"],
    valueHook:
      "Sandton showroom to Lagos doorstep in ~30 days, end-to-end. Multilingual concierge in your language.",
    includes: [
      "Multilingual concierge in 7 languages",
      "Vehicle sourcing across SA premium dealers",
      "Independent third-party Dekra inspection",
      "Bonded escrow via SA partner bank",
      "RoRo or overland logistics from Durban",
      "Local broker for customs and registration",
      "White-glove handover at your residence",
      "POPIA + destination-country compliance",
    ],
    selfServe: false,
  },
  {
    sku: "intent-oem-bespoke",
    family: "custom",
    product: "intent",
    tier: "bespoke",
    label: "Visio Intent — OEM Bespoke",
    shortDescription: "Custom data partnership for SA OEM marketing teams",
    longDescription:
      "Custom data partnership for OEM marketing teams (Toyota SA, VW SA, Ford SA, BMW SA). Includes everything in Enterprise plus custom signal engineering, white-label dashboards, joint research publications, and a dedicated VRL analyst. Quoted per partnership.",
    amountCents: -1,
    billingCadenceDays: null,
    grants: [],
    valueHook:
      "Reallocate R3-5B of annual dealer co-op marketing spend toward higher-intent regions with VRL-published methodology.",
    includes: [
      "Everything in Intent Enterprise",
      "Custom signal engineering",
      "White-label dashboards",
      "Joint VRL research publications",
      "Dedicated analyst",
      "Quarterly executive workshops",
    ],
    selfServe: false,
  },
];

// ─────────────────────────────────────────────────────────────────────
// Combined catalog + helpers
// ─────────────────────────────────────────────────────────────────────

export const CATALOG: readonly CatalogItem[] = [
  ...SUBSCRIPTIONS,
  ...ONE_OFFS,
  ...CUSTOM,
] as const;

export const CATALOG_BY_SKU: Record<string, CatalogItem> = CATALOG.reduce(
  (acc, item) => ({ ...acc, [item.sku]: item }),
  {} as Record<string, CatalogItem>
);

/** All purchasable SKUs for a given suite product. */
export function catalogForProduct(
  product: SuiteProductKey | "leads" | "concierge"
): CatalogItem[] {
  return CATALOG.filter((c) => c.product === product);
}

/** All SKUs in a given family. */
export function catalogByFamily(family: CatalogFamily): CatalogItem[] {
  return CATALOG.filter((c) => c.family === family);
}

/** Format ZAR cents into a human-readable string. */
export function formatPrice(item: CatalogItem): string {
  if (item.amountCents === -1) return "Quote on request";
  if (item.amountCents === 0) return "Free";
  const rand = item.amountCents / 100;
  const formatted = `R${rand.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`;
  if (item.family === "subscription") {
    const cadence = item.billingCadenceDays === 30 ? "/mo" : "/period";
    return `${formatted}${cadence}${item.revenueSharePct ? ` + ${item.revenueSharePct * 100}% GMV` : ""}`;
  }
  return formatted;
}
