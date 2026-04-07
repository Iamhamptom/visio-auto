import Link from "next/link";
import type { Metadata } from "next";
import { VisioLogoMark } from "@/components/landing/VisioLogo";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Customers — Visio Auto",
  description:
    "Case studies and customer stories from South African car dealerships using Visio Auto.",
};

export default function CustomersPage() {
  return (
    <div className="min-h-screen bg-[#020c07] text-white/80">
      <header className="border-b border-white/[0.06] sticky top-0 z-40 bg-[#020c07]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <VisioLogoMark size={24} />
            <span className="text-sm font-light tracking-wide text-white/80">Visio Auto</span>
            <span className="text-white/20 mx-1">/</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/60">
              Customers
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

      <section className="relative py-24">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.05)_0%,transparent_70%)]" />

        <div className="relative mx-auto max-w-3xl px-6">
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400/70 border border-emerald-500/30 bg-emerald-500/[0.05] px-3 py-1.5">
            Customer Stories
          </span>
          <h1 className="mt-8 text-4xl md:text-5xl font-extralight tracking-tight text-white leading-[1.1]">
            Case studies coming soon.
          </h1>
          <p className="mt-6 text-[15px] leading-relaxed text-white/50 max-w-2xl">
            We are in the first 90 days of onboarding pilot dealerships. As soon as we have
            permission to publish real results with named dealerships, they will live here.
          </p>
          <p className="mt-4 text-[14px] leading-relaxed text-white/40 max-w-2xl">
            Our <Link href="/about" className="text-emerald-400/80 hover:text-emerald-400 underline underline-offset-4">Honesty Protocol</Link> forbids us from publishing fabricated testimonials,
            stock-photo customer faces, or unverified revenue claims. When we have real stories,
            you will see them. Not before.
          </p>

          <div className="mt-10 border border-white/[0.06] bg-white/[0.02] p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400/60 mb-3">
              In the meantime
            </p>
            <ul className="space-y-3 text-[14px] text-white/55">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500/40 mt-0.5">→</span>
                Read our <Link href="/research" className="text-emerald-400/80 hover:text-emerald-400 underline underline-offset-4">published research</Link> — 10 papers documenting methodology and thesis
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500/40 mt-0.5">→</span>
                See our <Link href="/intelligence" className="text-emerald-400/80 hover:text-emerald-400 underline underline-offset-4">live market intelligence</Link> — Q1 2026 data from the Visio Auto platform
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500/40 mt-0.5">→</span>
                Check the <Link href="/pricing" className="text-emerald-400/80 hover:text-emerald-400 underline underline-offset-4">pricing</Link> and try a free trial
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500/40 mt-0.5">→</span>
                Ask Jess any question in the chat widget bottom-right
              </li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-12">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400/60 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Visio Auto
          </Link>
        </div>
      </footer>
    </div>
  );
}
