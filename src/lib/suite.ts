/**
 * Visio Auto Suite — shared product registry.
 *
 * Single source of truth for all 6 sibling product URLs, papers,
 * tag lines, and Jess's positioning language. Referenced by:
 *
 *   - Hero rotating capabilities
 *   - VisioAutoSuite landing section
 *   - Navbar Suite dropdown
 *   - Footer product column
 *   - Jess SDK agent (`lib/agents/jess-agent.ts`)
 *   - Paper page links
 *
 * Update URLs here only. Everything else picks them up.
 */

export type SuiteProductKey =
  | "approve"
  | "inspect"
  | "bdc"
  | "intent"
  | "open-finance"
  | "trust";

export interface SuiteProduct {
  key: SuiteProductKey;
  name: string;
  shortName: string;
  tagline: string;
  role: string;
  liveUrl: string;
  paperUrl: string;
  paperNumber: string;
  repo: string;
  revenueTarget: string;
  whatItDoes: string;
  whenToUse: string;
  integration: string;
}

export const SUITE: readonly SuiteProduct[] = [
  {
    key: "approve",
    name: "Visio Approve",
    shortName: "Approve",
    tagline: "Pre-approval in 90 seconds. No bureau pull.",
    role: "Top-of-funnel affordability — 4-bank rate compare + Reg 23A engine",
    liveUrl: "https://visio-approve.vercel.app",
    paperUrl: "/papers/visio-approve",
    paperNumber: "VRL-AUTO-004",
    repo: "Iamhamptom/visio-approve",
    revenueTarget: "R54M ARR",
    whatItDoes:
      "Neutral multi-bank vehicle finance pre-approval simulator. Reg 23A minimum expense norms encoded. 4 published bank rate cards (WesBank, Standard Bank VAF, MFC, Absa VAF). 7-step user flow, 90-second Green/Amber/Red traffic light.",
    whenToUse:
      "When a buyer asks 'will I get approved?' or 'what car can I afford?' — route them here. Not a credit pull, not financial advice, not a credit bureau. Legal gap: NCA Section 40 + FAIS Section 1 + NCA Section 70 all inapplicable.",
    integration:
      "Results flow into vt_transactions.approve_simulation_id. Amber results trigger Visio Open Finance upgrade path.",
  },
  {
    key: "inspect",
    name: "Visio Inspect",
    shortName: "Inspect",
    tagline: "12 phone photos. AI-graded condition report.",
    role: "Trust layer — smartphone-grade condition reports with confidence gating",
    liveUrl: "https://visio-inspect.vercel.app",
    paperUrl: "/papers/visio-inspect",
    paperNumber: "VRL-AUTO-005",
    repo: "Iamhamptom/visio-inspect",
    revenueTarget: "R2.9M ARR",
    whatItDoes:
      "12-photo guided wizard. Each photo graded by Gemini 2.5 Vision into damage, issues, conditionScore (1-10), confidence (0-1). Aggregate A/B/C/D grade + recon cost band + 'Verified by Visio' badge. VIN OCR + odometer OCR. Honesty Protocol: badge withheld if any panel confidence <0.7.",
    whenToUse:
      "When a buyer is evaluating a used car from an unorganised seller (55% of SA used market). R49 per report, R299/mo unlimited for dealers. Undercuts UVeye by removing the $250K capex per location.",
    integration:
      "Report ID flows into vt_transactions.inspect_report_id. 'Verified by Visio' badge appears on Visio Trust transaction page.",
  },
  {
    key: "bdc",
    name: "Visio BDC",
    shortName: "BDC",
    tagline: "WhatsApp-native dealer engagement. 38 signals. 30 templates.",
    role: "Engagement layer — WhatsApp-first BDC for SA dealer long tail",
    liveUrl: "https://visio-bdc.vercel.app",
    paperUrl: "/papers/visio-bdc",
    paperNumber: "VRL-AUTO-006",
    repo: "Iamhamptom/visio-bdc",
    revenueTarget: "R18-21M ARR",
    whatItDoes:
      "WhatsApp Business Cloud API-native BDC SaaS. 38-signal taxonomy across Intent (12), Lifecycle (10), Service (5), External (6), Risk (5). 30 pre-built message templates in English, Afrikaans, and Zulu. Routing engine with per-signal SLA escalation. Multi-tenant RLS.",
    whenToUse:
      "When a SA dealer asks 'how do I reach buyers on the channel they actually use?' — Conversica/Impel/Fullpath are $1.5K-$5K/month USD and SMS-first. Visio BDC is R1.5K-R5K/mo ZAR and WhatsApp-first. 5-10× cheaper. Built for the 2,000+ SA independent dealers priced out of the US tools.",
    integration:
      "Feeds signal pings to Visio Trust as routed leads. vbdc_leads.vt_transaction_id ties every lead back to the master ledger.",
  },
  {
    key: "intent",
    name: "Visio Intent",
    shortName: "Intent",
    tagline: "K-anonymity-protected buying intent index for OEMs and banks.",
    role: "Data layer — forward-looking intent index (the 'Bloomberg of SA cars')",
    liveUrl: "https://visio-intent.vercel.app",
    paperUrl: "/papers/visio-intent",
    paperNumber: "VRL-AUTO-007",
    repo: "Iamhamptom/visio-intent",
    revenueTarget: "R7.2M ARR",
    whatItDoes:
      "Aggregates 38 buying intent signals with minimum cell size 5 (k-anonymity enforced at database CHECK constraint level). Published weekly Index + daily API for subscribers. Free public layer drives marketing flywheel. 3 tiers: R5K Starter (brand, weekly) / R15K Growth (region x segment, daily, API) / R50K Enterprise (raw drilldown, real-time, CSM).",
    whenToUse:
      "When an OEM marketing team or bank credit-ops team asks 'where is demand forming this week?' — Lightstone + TransUnion sell historical records, never forward-looking intent. Visio Intent is the only product that tells you which buyers are calculating, comparing, test-driving, or financing RIGHT NOW by brand, region, and segment.",
    integration:
      "Reads from the Visio Auto signal engine via aggregation cron. Every Visio Trust transaction adds k-anonymised data to the Index, completing the flywheel.",
  },
  {
    key: "open-finance",
    name: "Visio Open Finance",
    shortName: "Open Finance",
    tagline: "Bank statement affordability. Thin-file unlock.",
    role: "Deep approval layer — bank statement parser + NCA Section 81 engine",
    liveUrl: "https://visio-open-finance.vercel.app",
    paperUrl: "/papers/visio-open-finance",
    paperNumber: "VRL-AUTO-008",
    repo: "Iamhamptom/visio-open-finance",
    revenueTarget: "R17M ARR",
    whatItDoes:
      "Drop 3 months of PDF or CSV bank statements. Gemini 2.5 Flash parses every transaction. Two-pass classifier (~40 SA merchant rules + AI fallback) across 46 expense categories. Recurring obligation detection. NCA Section 81 + Reg 23A affordability engine with verified income + verified obligations. Audit-grade PDF report with public verify endpoint for banks.",
    whenToUse:
      "When a buyer is a gig worker, freelancer, contract employee, or informal-income earner — invisible to TransUnion/Experian/XDS/Compuscan credit bureaus. The 25%+ rejection rate cohort that banks should approve but can't see. Visio Approve handles self-reported; Visio Open Finance handles verified.",
    integration:
      "Assessment ID flows into vt_transactions.open_finance_assessment_id. The audit-grade PDF + verify URL accompany the bank lead handoff.",
  },
  {
    key: "trust",
    name: "Visio Trust",
    shortName: "Trust",
    tagline: "Carvana experience. Asset-light. Zero inventory risk.",
    role: "Transaction OS — escrow + delivery + 7-day return + unified ledger",
    liveUrl: "https://visio-trust.vercel.app",
    paperUrl: "/papers/visio-trust",
    paperNumber: "VRL-AUTO-009",
    repo: "Iamhamptom/visio-trust",
    revenueTarget: "R128M ARR",
    whatItDoes:
      "The unifying layer. Owns vt_transactions — the master transaction ledger every other product writes into. Stitch EscrowPay integration (or attorney trust backup). Delivery orchestration via Loop/Picup. 7-day return via escrow state machine. Stock velocity dashboard showing days-on-lot vs benchmark (the dealer ROI pitch). 3 tiers: R3K Starter / R8K Velocity / R15K Complete + 1% GMV.",
    whenToUse:
      "When a dealer wants Carvana-grade trust without Carvana-grade capital. When a buyer wants to buy a used car online with escrow protection and a return window. When any SA used-car transaction needs coordination across Inspect + Approve + Open Finance + delivery + escrow.",
    integration:
      "The HUB. vt_transactions holds foreign keys to all 5 sibling products. If any sibling is offline, the Visio Trust page degrades gracefully to 'data unavailable' (Honesty Protocol, not a crash).",
  },
] as const;

export const SUITE_BY_KEY: Record<SuiteProductKey, SuiteProduct> = SUITE.reduce(
  (acc, p) => ({ ...acc, [p.key]: p }),
  {} as Record<SuiteProductKey, SuiteProduct>
);

export const SUITE_META = {
  totalAnnualRevenueTarget: "R237M ARR",
  totalAnnualRevenueYearOne: "R10M ARR",
  totalProducts: SUITE.length,
  unifyingLedger: "vt_transactions",
  architecturePaper: "/papers/suite-overview",
  legalPosture: [
    "Not a credit provider (NCA Section 40 inapplicable)",
    "Not a credit bureau (NCA Section 70 inapplicable)",
    "Not financial advice (FAIS Section 1 excludes credit)",
    "Not a vehicle owner (Visio Trust is coordination only)",
    "POPIA compliant (consent gates, 90-day retention, k-anonymity)",
  ],
} as const;

/**
 * Jess's tool-routing recommendation logic.
 * Given a buyer or dealer question, return the sibling product Jess should recommend.
 */
export function recommendProduct(
  situation: string
): { product: SuiteProduct; reason: string } | null {
  const s = situation.toLowerCase();

  if (
    s.includes("afford") ||
    s.includes("approv") ||
    s.includes("pre-qual") ||
    s.includes("rate") ||
    s.includes("instalment") ||
    s.includes("deposit")
  ) {
    return {
      product: SUITE_BY_KEY["approve"],
      reason: "Fast pre-approval estimate without a credit pull.",
    };
  }

  if (
    s.includes("bank statement") ||
    s.includes("gig") ||
    s.includes("freelanc") ||
    s.includes("self-employed") ||
    s.includes("rejected") ||
    s.includes("thin file") ||
    s.includes("no credit history")
  ) {
    return {
      product: SUITE_BY_KEY["open-finance"],
      reason:
        "Verified affordability from bank statements — for buyers the bureaus cannot see.",
    };
  }

  if (
    s.includes("condition") ||
    s.includes("inspect") ||
    s.includes("damage") ||
    s.includes("scratched") ||
    s.includes("used car quality") ||
    s.includes("private seller")
  ) {
    return {
      product: SUITE_BY_KEY["inspect"],
      reason: "12-photo AI condition report with confidence-gated grading.",
    };
  }

  if (
    s.includes("escrow") ||
    s.includes("delivery") ||
    s.includes("return") ||
    s.includes("carvana") ||
    s.includes("buy online") ||
    s.includes("stock velocity") ||
    s.includes("days on lot")
  ) {
    return {
      product: SUITE_BY_KEY["trust"],
      reason:
        "Escrow + delivery + 7-day return. For the full Carvana-grade experience.",
    };
  }

  if (
    s.includes("whatsapp") ||
    s.includes("bdc") ||
    s.includes("lead routing") ||
    s.includes("templates") ||
    s.includes("dealer signals") ||
    s.includes("conversica") ||
    s.includes("fullpath")
  ) {
    return {
      product: SUITE_BY_KEY["bdc"],
      reason:
        "WhatsApp-native BDC with 38 signal types and SA-language templates.",
    };
  }

  if (
    s.includes("intent") ||
    s.includes("oem") ||
    s.includes("market share") ||
    s.includes("where is demand") ||
    s.includes("aggregated data") ||
    s.includes("bloomberg") ||
    s.includes("co-op marketing")
  ) {
    return {
      product: SUITE_BY_KEY["intent"],
      reason:
        "Forward-looking buying intent index with k-anonymity protection.",
    };
  }

  return null;
}
