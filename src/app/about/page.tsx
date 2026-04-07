import Link from "next/link";
import type { Metadata } from "next";
import { VisioLogoMark } from "@/components/landing/VisioLogo";
import { ArrowLeft, Shield, FileText, Globe2 } from "lucide-react";

export const metadata: Metadata = {
  title: "About Visio Auto | Built in South Africa",
  description:
    "Visio Auto is the AI platform South African car dealerships use to find buyers, close sales, and stay ahead of the market. Built in SA. POPIA compliant. Honesty Protocol enforced.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#020c07] text-white/80">
      <header className="border-b border-white/[0.06] sticky top-0 z-40 bg-[#020c07]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <VisioLogoMark size={24} />
            <span className="text-sm font-light tracking-wide text-white/80">Visio Auto</span>
            <span className="text-white/20 mx-1">/</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/60">
              About
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
      <section className="relative py-24">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.05)_0%,transparent_70%)]" />

        <div className="relative mx-auto max-w-3xl px-6">
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400/70 border border-emerald-500/30 bg-emerald-500/[0.05] px-3 py-1.5">
            About Visio Auto
          </span>
          <h1 className="mt-8 text-4xl md:text-5xl font-extralight tracking-tight text-white leading-[1.1]">
            Built in South Africa, for
            <br />
            <span className="text-emerald-400">South African dealerships</span>.
          </h1>
          <p className="mt-6 text-[15px] leading-relaxed text-white/50 max-w-2xl">
            Visio Auto is the AI platform South African car dealerships use to find qualified
            buyers, close more sales, and out-price the competition. We built it because nobody
            else was going to build it for the SA market — not Conversica, not Carvana, not
            Lightstone, not TransUnion. They were all building for somewhere else.
          </p>
        </div>
      </section>

      {/* The Honesty Protocol */}
      <section className="py-20 border-t border-white/[0.06]">
        <div className="mx-auto max-w-3xl px-6">
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/40">
            Our Operating Principle
          </span>
          <h2 className="mt-3 text-3xl font-extralight tracking-tight text-white">
            The Honesty Protocol.
          </h2>
          <p className="mt-6 text-[15px] leading-relaxed text-white/50">
            Every number we publish is sourced. Every data point is cited. Every limitation is
            surfaced. If we do not know something, we say so. If a tool cannot confidently
            produce a result, we withhold it rather than fabricate it. If a product is in
            early-access or demo mode, we flag it at the database level, not just in small print.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-white/50">
            This is not a marketing posture. It is an engineering rule.
          </p>

          <div className="mt-10 grid gap-px md:grid-cols-3 bg-white/[0.04] border border-white/[0.06]">
            <div className="bg-[#020c07] p-6">
              <Shield className="h-5 w-5 text-emerald-500/50 mb-4" />
              <h3 className="text-[14px] font-medium text-white/80">Every figure cited</h3>
              <p className="mt-2 text-[12px] text-white/35 leading-relaxed">
                Every number in our research papers has a public source URL and a verified-at
                date. Reproducible from the published constants.
              </p>
            </div>
            <div className="bg-[#020c07] p-6">
              <FileText className="h-5 w-5 text-emerald-500/50 mb-4" />
              <h3 className="text-[14px] font-medium text-white/80">Published methodology</h3>
              <p className="mt-2 text-[12px] text-white/35 leading-relaxed">
                Our methods are public. Our affordability engine, signal taxonomy, and
                k-anonymity rules are all documented at /research.
              </p>
            </div>
            <div className="bg-[#020c07] p-6">
              <Globe2 className="h-5 w-5 text-emerald-500/50 mb-4" />
              <h3 className="text-[14px] font-medium text-white/80">POPIA compliant</h3>
              <p className="mt-2 text-[12px] text-white/35 leading-relaxed">
                Registered Information Officer. Consent gates at every input. 90-day retention.
                Public verify endpoints for banks and partners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visio Research Labs */}
      <section className="py-20 border-t border-white/[0.06]">
        <div className="mx-auto max-w-3xl px-6">
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/40">
            Our Research Arm
          </span>
          <h2 className="mt-3 text-3xl font-extralight tracking-tight text-white">
            Visio Research Labs publishes everything.
          </h2>
          <p className="mt-6 text-[15px] leading-relaxed text-white/50">
            Our work is published under Creative Commons Attribution 4.0, free for every
            dealership partner, researcher, or journalist who wants to cite or build on it. We
            have published 10 research papers to date covering the SA automotive market, our
            signal-mining methodology, POPIA compliance framework, cross-border African luxury
            logistics, and the full six-product suite architecture.
          </p>
          <div className="mt-8">
            <Link
              href="/research"
              className="inline-flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/[0.05] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400/80 hover:bg-emerald-500/[0.1] transition-colors"
            >
              Read Our Research
            </Link>
          </div>
        </div>
      </section>

      {/* Meet Jess link */}
      <section className="py-20 border-t border-white/[0.06]">
        <div className="mx-auto max-w-3xl px-6">
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/40">
            Our AI Agent
          </span>
          <h2 className="mt-3 text-3xl font-extralight tracking-tight text-white">
            Meet Jess. She runs the platform.
          </h2>
          <p className="mt-6 text-[15px] leading-relaxed text-white/50">
            Jess is the AI sales agent who operates the Visio Auto platform. She speaks seven
            languages, knows every dealer in SA, can book test drives, pre-qualify buyers,
            explain affordability, and close sales in chat. She is available 24/7 in the chat
            widget on every page.
          </p>
          <div className="mt-8">
            <Link
              href="/about/jess"
              className="inline-flex items-center gap-2 border border-white/[0.08] bg-white/[0.02] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-white/60 hover:bg-white/[0.06] hover:text-white transition-colors"
            >
              Meet Jess
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-12">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/30">
            &copy; {new Date().getFullYear()} VisioCorp (Pty) Ltd &middot; Built in South Africa
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
