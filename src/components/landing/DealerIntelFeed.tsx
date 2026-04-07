"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { TrendingUp, AlertCircle, Zap, Globe2, Building2, Fuel } from "lucide-react";
import WindowFrame from "./WindowFrame";
import {
  Q1SalesBarChart,
  BrandRankingChart,
  ExportCrisisChart,
  BrandShareDonut,
} from "@/components/charts/Charts";

/**
 * Dealer Intelligence Feed.
 *
 * Surfaces verified Q1 2026 SA automotive intelligence directly to dealers
 * in actionable card format. Each card has a verified data point + "what
 * this means for you" insight.
 *
 * This is the operational face of the Intelligence Vol.1 paper —
 * Bloomberg-terminal style data, dealer-actionable.
 */

const intelCards = [
  {
    icon: TrendingUp,
    badge: "Q1 2026",
    badgeColor: "emerald",
    headline: "March 2026 = best March since 2007",
    metric: "58,060 units",
    change: "+17.3% YoY",
    insight:
      "Buyers are flooding showrooms. If you're not converting walk-ins to test drives within 24 hours, you're losing this momentum to competitors.",
    source: "NAAMSA March 2026",
  },
  {
    icon: Zap,
    badge: "Macro",
    badgeColor: "emerald",
    headline: "Prime rate at 10.25%",
    metric: "−150 bps since Sept 2024",
    change: "13-yr dealer confidence high",
    insight:
      "Vehicle finance is dramatically more affordable than 12 months ago. Push pre-approval flows aggressively — the buyer who couldn't qualify in 2024 can qualify now.",
    source: "SARB MPC + NADA",
  },
  {
    icon: Building2,
    badge: "Watershed",
    badgeColor: "amber",
    headline: "Chery acquires Nissan Rosslyn",
    metric: "60-yr-old plant",
    change: "~3,000 jobs preserved",
    insight:
      "First major Chinese OEM SA manufacturing footprint. If you haven't added a Chinese franchise, the window is closing — Chery, GWM, Haval, Omoda, Jaecoo, BYD will accelerate dealer recruitment to support local production by end-2027.",
    source: "Chery SA + Nissan Global",
  },
  {
    icon: Globe2,
    badge: "Top 10",
    badgeColor: "emerald",
    headline: "4 of top 10 brands are Asian",
    metric: "GWM, Chery, Mahindra, Jetour",
    change: "~10,000 units in March alone",
    insight:
      "Suzuki overtook VW for #2 brand last year. Isuzu just displaced Hyundai for #4. The legacy hierarchy is rearranging in real time — adjust your competitive intel and pricing benchmarks weekly, not annually.",
    source: "NAAMSA March 2026 rankings",
  },
  {
    icon: Fuel,
    badge: "Cost Shock",
    badgeColor: "red",
    headline: "Diesel hit R26.11/litre record",
    metric: "+R7/litre April 2026",
    change: "Petrol +R3.06/litre",
    insight:
      "Buyer psychology has shifted from initial price to total cost of ownership. Lead with fuel efficiency, hybrid options, maintenance plans, and 5-year cost projections. The hybrid Corolla Cross and Haval H6 HEV are converting on this signal alone.",
    source: "DMRE April 2026",
  },
  {
    icon: AlertCircle,
    badge: "Crisis",
    badgeColor: "red",
    headline: "Vehicle exports −28.1% YoY",
    metric: "Feb 2026 = 24,221 units",
    change: "Morocco overtook SA #1",
    insight:
      "SA's traditional EU/UK export markets are eroding. The opportunity is intra-African: SA-built BMW X3, Mercedes C-Class, Toyota Hilux can serve Lagos, Lubumbashi, Luanda under AfCFTA. South Africans supplying Africans is the new manufacturing thesis.",
    source: "NAAMSA Feb 2026 export data",
  },
  {
    icon: TrendingUp,
    badge: "Super Group",
    badgeColor: "emerald",
    headline: "Asian brand sales +102% in 6 months",
    metric: "30% of new car volumes",
    change: "Dealership rev R6bn (+12.7%)",
    insight:
      "Super Group's H1 FY26 results prove that dealers who pivoted East are dramatically outperforming. 28 specialized facilities for emerging brands. The case study is published — the playbook is clear.",
    source: "Super Group H1 FY26 SENS",
  },
  {
    icon: Zap,
    badge: "EV Policy",
    badgeColor: "emerald",
    headline: "150% tax deduction now live",
    metric: "Effective 1 March 2026",
    change: "10-year window",
    insight:
      "OEMs investing in BEV/H2 production capacity claim 150% of capex against tax. Treasury fiscal cost R500m FY26/27 alone. This is the green light for EV manufacturing in SA — expect new model announcements within 12 months.",
    source: "Tax Laws Amendment Act 42 of 2024",
  },
];

const colorMap = {
  emerald: "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-400/80",
  amber: "border-amber-500/30 bg-amber-500/[0.06] text-amber-400/80",
  red: "border-red-500/30 bg-red-500/[0.06] text-red-400/80",
};

export default function DealerIntelFeed() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.05 });

  return (
    <section id="intel-feed" className="relative py-32 bg-[#020c07] overflow-hidden">
      {/* Infographic background — Nano Banana generated */}
      <div className="absolute inset-0 z-0 opacity-15">
        <Image
          src="/generated/infographic-network.png"
          alt=""
          fill
          className="object-cover mix-blend-screen pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020c07] via-transparent to-[#020c07]" />
      </div>
      <div className="absolute inset-0 bg-grid opacity-25 z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.05)_0%,transparent_60%)] z-0" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="section-label">Live Dealer Intelligence</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400/80 border border-emerald-500/30 bg-emerald-500/[0.06] px-2 py-0.5">
              UPDATED Q1 2026
            </span>
          </div>
          <h2 className="mt-4 heading-xl max-w-4xl">
            What&apos;s actually happening
            <br />
            in the <span className="text-emerald-400">SA market</span> &mdash; right now.
          </h2>
          <div className="mt-6 flex items-start gap-3 max-w-2xl">
            <div className="mt-1.5 h-px w-8 bg-emerald-500/40 shrink-0" />
            <p className="text-[15px] leading-relaxed text-white/50">
              Verified data. Cited sources. Actionable insight on every card.
              This is the live face of the{" "}
              <a
                href="/papers/intelligence-vol-1"
                className="text-emerald-400/80 hover:text-emerald-400 underline underline-offset-4"
              >
                Visio Intelligence Report
              </a>{" "}
              &mdash; updated as the market moves. Free for every dealership partner.
            </p>
          </div>
        </motion.div>

        {/* Real SVG charts — verified Q1 2026 data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-16 grid lg:grid-cols-2 gap-6"
        >
          <Q1SalesBarChart />
          <BrandShareDonut />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-6 grid lg:grid-cols-[3fr_2fr] gap-6"
        >
          <BrandRankingChart />
          <ExportCrisisChart />
        </motion.div>

        {/* Intel cards grid */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          className="mt-16 grid gap-px md:grid-cols-2 bg-white/[0.04] border border-white/[0.06]"
        >
          {intelCards.map((card) => (
            <motion.div
              key={card.headline}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
                },
              }}
              className="bg-[#020c07] p-7 hover:bg-white/[0.02] transition-colors group"
            >
              {/* Header row */}
              <div className="flex items-start justify-between mb-5">
                <card.icon className="h-5 w-5 text-emerald-500/50 group-hover:text-emerald-400 transition-colors" />
                <span
                  className={`font-mono text-[9px] uppercase tracking-[0.25em] border px-2 py-0.5 ${
                    colorMap[card.badgeColor as keyof typeof colorMap]
                  }`}
                >
                  {card.badge}
                </span>
              </div>

              {/* Headline */}
              <h3 className="text-[16px] font-medium text-white/85 leading-snug">
                {card.headline}
              </h3>

              {/* Metric + change */}
              <div className="mt-3 flex items-baseline gap-3 flex-wrap">
                <span className="font-mono text-2xl font-extralight text-emerald-400">
                  {card.metric}
                </span>
                <span className="font-mono text-[11px] text-white/40">
                  {card.change}
                </span>
              </div>

              {/* Divider */}
              <div className="mt-5 mb-4 h-px bg-white/[0.06]" />

              {/* Insight */}
              <div className="flex items-start gap-2.5">
                <div className="mt-1.5 h-1 w-1 rounded-full bg-emerald-500/60 shrink-0" />
                <p className="text-[13px] leading-relaxed text-white/55">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/70 mr-2">
                    What this means →
                  </span>
                  {card.insight}
                </p>
              </div>

              {/* Source */}
              <div className="mt-4 pt-3 border-t border-white/[0.04]">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/20">
                  Source: {card.source}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <a
            href="/papers/intelligence-vol-1"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400/60 hover:text-emerald-400 transition-colors border-b border-emerald-500/20 pb-1"
          >
            Read the full Intelligence Report Vol.1 →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
