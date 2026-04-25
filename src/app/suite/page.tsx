import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "The Visio Auto suite",
  description:
    "Nine integrated products for SA dealerships — leads, valuation, financing, inspection, BDC, voice, escrow, ops, service. Bundle and save.",
};

interface Product {
  key: string;
  name: string;
  tagline: string;
  url: string;
  status: "live" | "beta" | "soon";
  features: string[];
  starting_price: string;
}

const PRODUCTS: Product[] = [
  {
    key: "auto",
    name: "Visio Auto",
    tagline: "AI lead intelligence — the flagship",
    url: "https://auto.visiocorp.co",
    status: "live",
    starting_price: "R5,000/mo",
    features: [
      "21 SA-specific buying signals",
      "AI lead qualification + scoring",
      "WhatsApp + email delivery in <60s",
      "Multi-source signal aggregation",
      "OEM pass-through detection",
    ],
  },
  {
    key: "trade",
    name: "Visio Trade",
    tagline: "Trade-in valuation",
    url: "https://trade.visiocorp.co",
    status: "live",
    starting_price: "R49 / R299/mo",
    features: [
      "3 valuations per car (private, dealer, retail)",
      "NAAMSA + TransUnion data blend",
      "2026 Chinese-brand impact built in",
      "Lifts deposit on Visio Approve",
    ],
  },
  {
    key: "approve",
    name: "Visio Approve",
    tagline: "Pre-decline finance simulation",
    url: "https://visio-approve.vercel.app",
    status: "live",
    starting_price: "R2,500/mo",
    features: [
      "NCA-Reg-23A affordability check",
      "4-bank approval simulation",
      "Catches the 70% who'd be declined",
      "Pivots buyer to affordable model",
    ],
  },
  {
    key: "inspect",
    name: "Visio Inspect",
    tagline: "AI vehicle inspection reports",
    url: "https://visio-inspect.vercel.app",
    status: "live",
    starting_price: "R49 / R299/mo",
    features: [
      "12-photo Gemini Vision grading",
      "VIN + odometer extraction",
      "PDF condition report",
      "Embed on dealer website",
    ],
  },
  {
    key: "open-finance",
    name: "Visio Open Finance",
    tagline: "Bank-statement affordability",
    url: "https://visio-open-finance.vercel.app",
    status: "beta",
    starting_price: "R3,500/mo",
    features: [
      "Statement upload + categorisation",
      "40+ SA expense classifications",
      "Trust score for F&I handoff",
      "Reg 23A discretionary income",
    ],
  },
  {
    key: "trust",
    name: "Visio Trust",
    tagline: "Escrow + 7-day return",
    url: "https://visio-trust.vercel.app",
    status: "beta",
    starting_price: "R4,000/mo",
    features: [
      "Stitch EscrowPay integration",
      "Inspection + delivery coordination",
      "7-day cash-back if buyer returns",
      "Cross-border luxury vehicles",
    ],
  },
  {
    key: "ops",
    name: "Visio Ops",
    tagline: "Salesperson + BDC funnel",
    url: "https://ops.visiocorp.co",
    status: "soon",
    starting_price: "R2,500/mo",
    features: [
      "Per-salesperson conversion KPIs",
      "Lead-to-close funnel attribution",
      "Signal-to-revenue tracing",
      "Replaces Excel for SA dealers",
    ],
  },
  {
    key: "service",
    name: "Visio Service",
    tagline: "Service-dept + OEM recalls",
    url: "https://service.visiocorp.co",
    status: "soon",
    starting_price: "R1,500/mo",
    features: [
      "Post-sale service lead funnel",
      "OEM recall traceability",
      "Retention nudges + reminders",
      "POPIA-clean customer record",
    ],
  },
  {
    key: "bdc",
    name: "Visio BDC",
    tagline: "WhatsApp lead routing",
    url: "https://visio-bdc.vercel.app",
    status: "beta",
    starting_price: "Bundled",
    features: [
      "Round-robin to dealer reps",
      "WABA template management",
      "Conversation handoff tracking",
      "Ships free with Auto Growth+",
    ],
  },
  {
    key: "intent",
    name: "Visio Intent",
    tagline: "Public market intelligence",
    url: "https://visio-intent.vercel.app",
    status: "live",
    starting_price: "Free / R1,500/mo",
    features: [
      "SA Auto Retail data product",
      "Brand-mix forecasts",
      "DealerCon-grade analytics",
      "VRL-published research",
    ],
  },
];

export default function SuitePage() {
  return (
    <div className="min-h-screen bg-[#020c07] text-white/80">
      <header className="border-b border-white/[0.06] sticky top-0 z-40 bg-[#020c07]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white/80"
          >
            <ArrowLeft className="h-3 w-3" /> Visio Auto
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/60">
            The Suite
          </span>
        </div>
      </header>

      <section className="py-20 md:py-28 px-6 relative">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.06)_0%,transparent_60%)]" />

        <div className="relative mx-auto max-w-5xl text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400/70 border border-emerald-500/30 bg-emerald-500/[0.05] px-3 py-1.5">
            Visio Auto Suite · 10 products
          </span>
          <h1 className="mt-8 text-5xl md:text-6xl font-extralight tracking-tight text-white leading-[1.05]">
            The complete dealership<br />operating system.
          </h1>
          <p className="mt-6 text-[16px] leading-relaxed text-white/55 max-w-2xl mx-auto">
            Ten integrated products built for the South African automotive market in 2026. Buy what you need, bundle what fits — every product shares the same identity, audit log, and POPIA receipts.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-7xl grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRODUCTS.map((p) => (
            <a
              key={p.key}
              href={p.url}
              target={p.url.startsWith("http") ? "_blank" : undefined}
              className="group border border-white/[0.06] bg-white/[0.02] hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] p-6 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-light text-white tracking-tight">{p.name}</h3>
                <StatusBadge status={p.status} />
              </div>
              <p className="text-xs text-white/45 mb-5">{p.tagline}</p>
              <ul className="space-y-1.5 mb-5 min-h-[120px]">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-white/65 leading-relaxed">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400/40 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-white/[0.04] pt-4">
                <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400/60">
                  {p.starting_price}
                </span>
                <span className="text-xs text-white/40 group-hover:text-emerald-400 inline-flex items-center gap-1 transition-colors">
                  Open <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="border-t border-white/[0.06] py-20 px-6 bg-white/[0.01]">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-extralight tracking-tight text-white mb-3">
            Bundles, not à-la-carte
          </h2>
          <p className="text-sm text-white/55 mb-12 max-w-2xl">
            Visio Auto Growth and above include the products that work best together. Pay for one, get the synergies.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <Bundle
              tier="Auto Starter"
              price="R5,000/mo"
              includes={["Auto leads (25/mo)", "WhatsApp delivery", "Basic dashboard"]}
            />
            <Bundle
              tier="Auto Growth"
              price="R15,000/mo"
              highlight
              includes={[
                "Auto leads (100/mo)",
                "Trade valuation (unlimited)",
                "Approve simulations",
                "Inspect (10 reports)",
                "BDC routing",
              ]}
            />
            <Bundle
              tier="Auto Pro"
              price="R50,000/mo"
              includes={[
                "Auto leads (500/mo)",
                "All sibling products",
                "Custom signal sources",
                "Multi-location dashboards",
                "Priority support",
              ]}
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-12 px-6">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-white/30 font-mono uppercase tracking-wider">
          <p>VisioCorp · Visio Auto suite</p>
          <div className="flex items-center gap-6">
            <Link href="/legal/popia" className="hover:text-white/60">
              POPIA
            </Link>
            <Link href="/status" className="hover:text-white/60">
              Status
            </Link>
            <Link href="/pricing" className="hover:text-white/60">
              Pricing
            </Link>
            <Link href="/get-started" className="hover:text-white/60">
              Start
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatusBadge({ status }: { status: "live" | "beta" | "soon" }) {
  const config = {
    live: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", label: "Live" },
    beta: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30", label: "Beta" },
    soon: { bg: "bg-zinc-500/10", text: "text-zinc-400", border: "border-zinc-500/30", label: "Soon" },
  }[status];
  return (
    <span
      className={`font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 border ${config.bg} ${config.text} ${config.border}`}
    >
      {config.label}
    </span>
  );
}

function Bundle({
  tier,
  price,
  includes,
  highlight,
}: {
  tier: string;
  price: string;
  includes: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={`border p-6 ${
        highlight
          ? "border-emerald-500/40 bg-emerald-500/[0.05]"
          : "border-white/[0.06] bg-white/[0.02]"
      }`}
    >
      <h3 className={`text-lg font-light tracking-tight ${highlight ? "text-emerald-400" : "text-white"}`}>
        {tier}
      </h3>
      <p className="font-mono text-[10px] uppercase tracking-wider text-white/40 mt-1">{price}</p>
      <ul className="space-y-1.5 mt-5">
        {includes.map((i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-white/65 leading-relaxed">
            <CheckCircle2 className="h-3 w-3 text-emerald-400/50 mt-0.5 shrink-0" />
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
