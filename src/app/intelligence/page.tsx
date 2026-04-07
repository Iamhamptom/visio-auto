import Link from "next/link";
import type { Metadata } from "next";
import { VisioLogoMark } from "@/components/landing/VisioLogo";
import { ArrowLeft } from "lucide-react";
import VisioIntel from "@/components/landing/VisioIntel";
import DealerIntelFeed from "@/components/landing/DealerIntelFeed";

export const metadata: Metadata = {
  title: "Visio Intelligence — Live SA Auto Market Data | Visio Auto",
  description:
    "Real-time South African automotive market intelligence for OEM marketing teams and bank credit-ops. NAAMSA-verified data, forward-looking buying intent, Q1 2026 dashboard.",
};

export default function IntelligencePage() {
  return (
    <div className="min-h-screen bg-[#020c07] text-white/80">
      {/* Header */}
      <header className="border-b border-white/[0.06] sticky top-0 z-40 bg-[#020c07]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <VisioLogoMark size={24} />
            <span className="text-sm font-light tracking-wide text-white/80">Visio Auto</span>
            <span className="text-white/20 mx-1">/</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/60">
              Intelligence
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.05)_0%,transparent_70%)]" />

        <div className="relative mx-auto max-w-6xl px-6">
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400/70 border border-emerald-500/30 bg-emerald-500/[0.05] px-3 py-1.5">
            For OEM Marketing Teams &amp; Bank Credit-Ops
          </span>

          <h1 className="mt-8 text-4xl md:text-5xl lg:text-6xl font-extralight leading-[1.1] tracking-tight text-white max-w-4xl">
            Real-time SA auto market
            <br />
            <span className="text-emerald-400">intelligence</span>. Cited. Published.
          </h1>

          <p className="mt-6 text-[15px] text-white/50 leading-relaxed max-w-2xl">
            Lightstone and TransUnion sell historical records. NAAMSA publishes monthly
            averages. Nobody sells forward-looking buying intent — until now. Subscribe to
            Visio Intelligence to see what is about to happen in the SA auto market, not just
            what already did.
          </p>
        </div>
      </section>

      {/* The VisioIntel section — full catalog of what's in the intel report */}
      <VisioIntel />

      {/* The live dashboard — DealerIntelFeed with Q1 2026 charts */}
      <DealerIntelFeed />

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-12">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/30">
            Visio Intelligence &middot; Powered by Visio Research Labs
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
