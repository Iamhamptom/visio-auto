import Link from "next/link";
import type { Metadata } from "next";
import { VisioLogoMark } from "@/components/landing/VisioLogo";
import { ArrowLeft, FileText, ArrowUpRight } from "lucide-react";
import SignalUniverse from "@/components/landing/SignalUniverse";
import SignalDepth from "@/components/landing/SignalDepth";

export const metadata: Metadata = {
  title: "Research — Visio Research Labs | Visio Auto",
  description:
    "Peer-grade research on the South African automotive market. 10 published papers, signal taxonomy, security methodology, and the Suite architecture. Free for all dealership partners.",
};

const PAPERS = [
  {
    number: "VRL-AUTO-001",
    title: "SA Automotive Intelligence Vol. 1, 2026",
    subtitle:
      "Market structure, Q1 2026 sales, brand share shifts, Chery-Rosslyn acquisition, manufacturing crisis, and forward-looking analysis.",
    href: "/papers/intelligence-vol-1",
    category: "Market Intelligence",
    featured: true,
  },
  {
    number: "VRL-AUTO-002",
    title: "How We Find Buyers — Safely",
    subtitle:
      "Ethical signal-mining methodology, POPIA compliance, technical safeguards, data subject rights.",
    href: "/papers/security",
    category: "Security & Privacy",
    featured: true,
  },
  {
    number: "VRL-AUTO-003",
    title: "The African Luxury Mobility Report",
    subtitle:
      "Multi-language playbook, cross-border logistics, trust architecture for UHNW African car buyers.",
    href: "/papers/african-luxury-mobility",
    category: "African Luxury Mobility",
    featured: true,
  },
  {
    number: "VRL-AUTO-004",
    title: "Visio Approve",
    subtitle:
      "A neutral multi-bank vehicle finance pre-approval layer. NCA + FAIS legal positioning.",
    href: "/papers/visio-approve",
    category: "Product Research",
  },
  {
    number: "VRL-AUTO-005",
    title: "Visio Inspect",
    subtitle:
      "Smartphone-grade AI vehicle inspection for SA's unorganised used-car market.",
    href: "/papers/visio-inspect",
    category: "Product Research",
  },
  {
    number: "VRL-AUTO-006",
    title: "Visio BDC",
    subtitle:
      "A WhatsApp-native Business Development Center for SA car dealers.",
    href: "/papers/visio-bdc",
    category: "Product Research",
  },
  {
    number: "VRL-AUTO-007",
    title: "Visio Intent",
    subtitle:
      "A k-anonymity-protected buying intent index for the SA automotive market.",
    href: "/papers/visio-intent",
    category: "Product Research",
  },
  {
    number: "VRL-AUTO-008",
    title: "Visio Open Finance",
    subtitle:
      "Bank-statement-driven affordability for SA thin-file car buyers.",
    href: "/papers/visio-open-finance",
    category: "Product Research",
  },
  {
    number: "VRL-AUTO-009",
    title: "Visio Trust",
    subtitle:
      "An asset-light stock velocity operating system for SA car dealers.",
    href: "/papers/visio-trust",
    category: "Product Research",
  },
  {
    number: "VRL-AUTO-010",
    title: "The Visio Auto Suite — Overview",
    subtitle:
      "A six-product operating system for the SA automotive market. The unifying thesis.",
    href: "/papers/suite-overview",
    category: "Suite Overview",
  },
];

export default function ResearchPage() {
  const featured = PAPERS.filter((p) => p.featured);
  const products = PAPERS.filter((p) => p.category === "Product Research");
  const suite = PAPERS.filter((p) => p.category === "Suite Overview");

  return (
    <div className="min-h-screen bg-[#020c07] text-white/80">
      {/* Header */}
      <header className="border-b border-white/[0.06] sticky top-0 z-40 bg-[#020c07]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <VisioLogoMark size={24} />
            <span className="text-sm font-light tracking-wide text-white/80">
              Visio Auto
            </span>
            <span className="text-white/20 mx-1">/</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/60">
              Research
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Home
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-24 border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.05)_0%,transparent_70%)]" />

        <div className="relative mx-auto max-w-6xl px-6">
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400/70 border border-emerald-500/30 bg-emerald-500/[0.05] px-3 py-1.5">
            Visio Research Labs
          </span>

          <h1 className="mt-8 text-4xl md:text-5xl lg:text-6xl font-extralight leading-[1.1] tracking-tight text-white max-w-3xl">
            Peer-grade research on the
            <br />
            <span className="text-emerald-400">South African automotive market</span>.
          </h1>

          <p className="mt-6 text-[15px] text-white/50 leading-relaxed max-w-2xl">
            10 published papers. Verified data. Cited sources. Our work is published openly under
            Creative Commons Attribution 4.0, free for every dealership partner and any
            researcher who wants to build on it. Every number sourced. Every claim defensible.
          </p>

          <div className="mt-10 grid grid-cols-3 md:grid-cols-4 border border-white/[0.06] divide-x divide-white/[0.06]">
            <div className="bg-white/[0.02] px-5 py-4">
              <div className="font-mono text-2xl font-extralight text-emerald-400">10</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30 mt-1">
                Papers
              </div>
            </div>
            <div className="bg-white/[0.02] px-5 py-4">
              <div className="font-mono text-2xl font-extralight text-emerald-400">84+</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30 mt-1">
                Signals Documented
              </div>
            </div>
            <div className="bg-white/[0.02] px-5 py-4">
              <div className="font-mono text-2xl font-extralight text-emerald-400">CC&nbsp;BY&nbsp;4.0</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30 mt-1">
                Open License
              </div>
            </div>
            <div className="bg-white/[0.02] px-5 py-4 hidden md:block">
              <div className="font-mono text-2xl font-extralight text-emerald-400">Free</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30 mt-1">
                For Partners
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured papers */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/40">
            Featured
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-extralight tracking-tight text-white">
            The three papers that anchor the thesis.
          </h2>

          <div className="mt-12 grid gap-px md:grid-cols-3 bg-white/[0.04] border border-white/[0.06]">
            {featured.map((paper) => (
              <Link
                key={paper.number}
                href={paper.href}
                className="bg-[#020c07] p-8 hover:bg-white/[0.02] transition-colors group flex flex-col"
              >
                <FileText className="h-5 w-5 text-emerald-500/50 mb-5" />
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-500/50">
                  {paper.number}
                </span>
                <h3 className="mt-3 text-xl font-extralight tracking-tight text-white leading-snug">
                  {paper.title}
                </h3>
                <p className="mt-4 text-[13px] leading-relaxed text-white/40 flex-1">
                  {paper.subtitle}
                </p>
                <div className="mt-6 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-emerald-400/60 group-hover:text-emerald-400 transition-colors">
                  Read Paper
                  <ArrowUpRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Product research papers */}
      <section className="py-20 border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-6">
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/40">
            Product Research
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-extralight tracking-tight text-white max-w-3xl">
            The six sibling products, documented.
          </h2>
          <p className="mt-4 text-[14px] text-white/40 max-w-2xl">
            Each paper documents the legal positioning, system architecture, revenue model,
            comparison to global comparables, and Honesty Protocol enforcement for one of the
            six sibling products that make up the Visio Auto Suite.
          </p>

          <div className="mt-12 grid gap-px md:grid-cols-2 lg:grid-cols-3 bg-white/[0.04] border border-white/[0.06]">
            {products.map((paper) => (
              <Link
                key={paper.number}
                href={paper.href}
                className="bg-[#020c07] p-6 hover:bg-white/[0.02] transition-colors group"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-500/50">
                  {paper.number}
                </span>
                <h3 className="mt-2 text-[16px] font-medium text-white/85">{paper.title}</h3>
                <p className="mt-2 text-[12px] text-white/35 leading-relaxed">{paper.subtitle}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.15em] text-emerald-400/60 group-hover:text-emerald-400 transition-colors">
                  Read Paper
                  <ArrowUpRight className="h-2.5 w-2.5" />
                </div>
              </Link>
            ))}
          </div>

          {suite.length > 0 && (
            <div className="mt-6">
              {suite.map((paper) => (
                <Link
                  key={paper.number}
                  href={paper.href}
                  className="block border border-emerald-500/20 bg-emerald-500/[0.03] p-6 hover:bg-emerald-500/[0.06] transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-400/80">
                        {paper.number} &middot; The unifying paper
                      </span>
                      <h3 className="mt-2 text-xl font-extralight tracking-tight text-white">
                        {paper.title}
                      </h3>
                      <p className="mt-2 text-[13px] text-white/45 max-w-2xl">{paper.subtitle}</p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-emerald-400/60 shrink-0 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Signal taxonomy (the deep reference) */}
      <div className="border-t border-white/[0.06]">
        <SignalUniverse />
      </div>

      {/* Case study — the comment section story */}
      <div className="border-t border-white/[0.06]">
        <SignalDepth />
      </div>

      {/* Footer back to home */}
      <footer className="border-t border-white/[0.06] py-12">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/30">
            Visio Research Labs &middot; Published under CC BY 4.0
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400/60 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Visio Auto
          </Link>
        </div>
      </footer>
    </div>
  );
}
