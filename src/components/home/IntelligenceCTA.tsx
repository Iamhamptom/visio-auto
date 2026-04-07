"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

/**
 * Intelligence CTA — the OEM + bank audience callout.
 *
 * A dedicated section that speaks to the second audience: OEM marketing
 * teams and bank credit-ops who want world-class industrial intelligence.
 * Not trying to convert dealer-principals here — this is a branching
 * entry point to /intelligence for the other buyer persona.
 */

export default function HomeIntelligenceCTA() {
  return (
    <section className="relative py-32 bg-[#020c07] overflow-hidden">
      {/* Infographic background */}
      <div className="absolute inset-0 z-0 opacity-20">
        <Image
          src="/generated/infographic-network.png"
          alt=""
          fill
          className="object-cover mix-blend-screen pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020c07] via-transparent to-[#020c07]" />
      </div>
      <div className="absolute inset-0 bg-grid opacity-15 z-0" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left — copy */}
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400/70">
              For OEMs and Banks
            </span>
            <h2 className="mt-4 text-4xl md:text-5xl font-extralight tracking-tight text-white leading-[1.1]">
              Running an OEM marketing team
              <br />
              or bank credit-ops?
              <br />
              <span className="text-emerald-400">We have your data.</span>
            </h2>
            <p className="mt-6 text-[15px] leading-relaxed text-white/50">
              Lightstone and TransUnion sell historical records. NAAMSA publishes monthly
              averages. Nobody sells forward-looking buying intent — until now. Subscribe to
              Visio Intelligence to see what is about to happen in the SA auto market, not just
              what already did.
            </p>

            <ul className="mt-8 space-y-3">
              <li className="flex items-start gap-2.5 text-[14px] text-white/60">
                <span className="font-mono text-emerald-400/70 shrink-0">→</span>
                <span>
                  <strong className="text-white/80">For OEMs:</strong> reallocate dealer co-op
                  marketing toward higher-intent regions. Approximately 20× ROI on the
                  Enterprise tier.
                </span>
              </li>
              <li className="flex items-start gap-2.5 text-[14px] text-white/60">
                <span className="font-mono text-emerald-400/70 shrink-0">→</span>
                <span>
                  <strong className="text-white/80">For banks:</strong> bid on the postcodes
                  seeing application-stage intent right now. Approximately 30-40% lower
                  cost-per-qualified-lead.
                </span>
              </li>
              <li className="flex items-start gap-2.5 text-[14px] text-white/60">
                <span className="font-mono text-emerald-400/70 shrink-0">→</span>
                <span>
                  <strong className="text-white/80">For everyone:</strong> published methodology,
                  k-anonymity protected, POPIA compliant.
                </span>
              </li>
            </ul>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/intelligence"
                className="inline-flex items-center gap-2 border border-emerald-500/40 bg-emerald-500/[0.08] px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400 hover:bg-emerald-500/[0.15] transition-colors"
              >
                See Visio Intelligence
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/papers/intelligence-vol-1"
                className="inline-flex items-center gap-2 border border-white/[0.1] bg-white/[0.02] px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-white/70 hover:bg-white/[0.06] hover:text-white transition-colors"
              >
                Read the Report
              </Link>
            </div>
          </div>

          {/* Right — key stats card */}
          <div className="border border-white/[0.08] bg-white/[0.02] p-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-400/60">
              Q1 2026 — verified
            </span>
            <h3 className="mt-2 text-[16px] font-medium text-white/85">
              The SA auto market at a glance
            </h3>

            <div className="mt-6 space-y-5">
              <Stat
                headline="58,060 units"
                subline="New vehicle sales, March 2026 — best March since 2007"
              />
              <Stat
                headline="+17.3%"
                subline="Year-over-year growth in Q1 2026"
              />
              <Stat
                headline="17%+"
                subline="Chinese OEM market share — up from under 5% in 2022"
              />
              <Stat
                headline="Chery"
                subline="Acquired Nissan's 60-year-old Rosslyn plant (2026)"
              />
            </div>

            <p className="mt-8 font-mono text-[10px] text-white/25 leading-relaxed">
              Sources: NAAMSA monthly releases · TransUnion Q4 2025 Mobility Insights · trade
              press reports. See full report at /papers/intelligence-vol-1.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ headline, subline }: { headline: string; subline: string }) {
  return (
    <div className="border-l-[2px] border-l-emerald-500/30 pl-4">
      <div className="font-mono text-xl font-extralight text-emerald-400">{headline}</div>
      <p className="text-[12px] text-white/45 mt-0.5 leading-snug">{subline}</p>
    </div>
  );
}
