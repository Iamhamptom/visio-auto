"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { ArrowRight, Download, FileText } from "lucide-react";
import WindowFrame from "./WindowFrame";

const intelCategories = [
  {
    label: "SA Market",
    items: [
      "NAAMSA monthly sales by brand & model",
      "Top 10 selling vehicles (passenger / SUV / bakkie / luxury)",
      "Dealer group performance (Motus, CMH, Halfway, etc.)",
      "Used market dynamics (AutoTrader, Cars.co.za)",
      "Provincial sales heatmaps",
    ],
  },
  {
    label: "Macroeconomic",
    items: [
      "Brent crude → SA fuel price → vehicle demand correlation",
      "ZAR exchange rate impact on import pricing",
      "Repo rate & vehicle finance approval trends",
      "CPI inflation & disposable income",
      "WesBank & MFC finance volume reports",
    ],
  },
  {
    label: "Business Intelligence",
    items: [
      "CIPC new business registrations by sector",
      "Job market: Stats SA QLFS, sector growth",
      "Major foreign investment & expansion announcements",
      "Forbes Africa, Daily Maverick, Business Day briefings",
      "Sandton, Cape Town, Umhlanga corporate hotspots",
    ],
  },
  {
    label: "Global Context",
    items: [
      "Chinese OEM expansion (BYD, GWM, Chery, Omoda)",
      "EV transition & charging infrastructure",
      "Global supply chain & lead times",
      "Toyota / VW / BMW global strategy shifts",
      "EU CBAM impact on SA automotive exports",
    ],
  },
];

const reportFeatures = [
  { value: "Monthly", label: "Cadence" },
  { value: "100+ pages", label: "Depth" },
  { value: "Cited", label: "Every claim sourced" },
  { value: "FREE", label: "For all dealership partners" },
];

export default function VisioIntel() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section id="intelligence" className="relative py-32 bg-[#030f0a] overflow-hidden">
      {/* Bar chart infographic accent — top right */}
      <div className="absolute top-20 right-0 w-[600px] h-[400px] z-0 opacity-20">
        <Image
          src="/generated/infographic-bars.png"
          alt=""
          fill
          className="object-cover mix-blend-screen pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#030f0a]" />
      </div>
      <div className="absolute inset-0 bg-dots opacity-30 z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.05)_0%,transparent_60%)] z-0" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="section-label">Visio Intelligence</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400/80 border border-emerald-500/30 bg-emerald-500/[0.06] px-2 py-0.5">
              FREE FOR PARTNERS
            </span>
          </div>
          <h2 className="mt-4 heading-xl max-w-4xl">
            A Bloomberg Terminal
            <br />
            for the <span className="text-emerald-400">SA auto industry</span>.
          </h2>
          <div className="mt-6 flex items-start gap-3 max-w-2xl">
            <div className="mt-1.5 h-px w-8 bg-emerald-500/40 shrink-0" />
            <p className="text-[15px] leading-relaxed text-white/50">
              Visio Intelligence delivers research-grade market data to every
              dealership partner, every month, free. Built by Visio Research
              Labs &mdash; the research arm behind our healthcare and music
              intelligence platforms.
            </p>
          </div>
        </motion.div>

        {/* Stat strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 border border-white/[0.06] divide-x divide-white/[0.06]"
        >
          {reportFeatures.map((f) => (
            <div key={f.label} className="bg-white/[0.02] px-5 py-5 text-center">
              <div className="font-mono text-xl font-extralight text-emerald-400">
                {f.value}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30 mt-1">
                {f.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Sample report preview window */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-16"
        >
          <WindowFrame title="VRL-AUTO-001 — SA Auto Market Vol.1 2026.pdf" variant="browser">
            <div className="p-8 md:p-10">
              {/* Doc header */}
              <div className="border-b border-white/[0.06] pb-6 mb-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-400/50">
                      VRL-AUTO-001 &middot; April 2026
                    </span>
                    <h3 className="mt-2 text-2xl md:text-3xl font-extralight tracking-tight text-white leading-tight max-w-2xl">
                      South African Automotive Intelligence Report
                    </h3>
                    <p className="mt-2 font-mono text-[11px] text-white/30">
                      Visio Research Labs &middot; Authored by Jess (AI) &middot; Reviewed by VRL Editorial
                    </p>
                  </div>
                  <a
                    href="/papers/intelligence-vol-1"
                    className="inline-flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/[0.05] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/80 hover:bg-emerald-500/[0.1] transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Read Full Report
                  </a>
                </div>
              </div>

              {/* Categories grid */}
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                {intelCategories.map((cat) => (
                  <div key={cat.label}>
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-3.5 w-3.5 text-emerald-500/50" />
                      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400/60">
                        {cat.label}
                      </span>
                    </div>
                    <ul className="space-y-2.5">
                      {cat.items.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-[12px] text-white/45 leading-relaxed">
                          <div className="mt-1.5 h-1 w-1 rounded-full bg-emerald-500/40 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Footer note */}
              <div className="mt-8 pt-6 border-t border-white/[0.06]">
                <p className="font-mono text-[11px] text-white/25 leading-relaxed">
                  Vol.1 covers verified 2025 NAAMSA data: <span className="text-emerald-400/60">596,818 units (+15.7% YoY)</span>,
                  Toyota Hilux <span className="text-emerald-400/60">36,525 units (#1, 13th straight year)</span>,
                  <span className="text-emerald-400/60"> Suzuki overtakes VW for #2</span>, Chery #8 (+26.7%),
                  Q4 2025 unemployment 5-year low at 31.4%, BankservAfrica avg take-home R18,098.
                  Every figure cited. Sources: NAAMSA, Stats SA, CIPC, SARB, Motus SENS, TransUnion, AutoTrader.
                </p>
              </div>
            </div>
          </WindowFrame>
        </motion.div>

        {/* Custom data points pitch */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 grid md:grid-cols-2 gap-px bg-white/[0.04] border border-white/[0.06]"
        >
          <div className="bg-[#030f0a] p-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-500/50">
              Custom Tracking
            </span>
            <h4 className="mt-3 text-xl font-extralight text-white">
              Track what matters to <span className="text-emerald-400">you</span>.
            </h4>
            <p className="mt-3 text-[13px] leading-relaxed text-white/40">
              Need to monitor a specific competitor, model, brand, or region?
              Tell Jess. Our agents will spin up a new data point and add it to
              your monthly report. No extra charge for partners.
            </p>
          </div>
          <div className="bg-[#030f0a] p-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-500/50">
              Your Data, Your Property
            </span>
            <h4 className="mt-3 text-xl font-extralight text-white">
              All intelligence belongs to <span className="text-emerald-400">your dealership</span>.
            </h4>
            <p className="mt-3 text-[13px] leading-relaxed text-white/40">
              You own the reports, the custom data points, and any insights
              generated. Export to PDF, Excel, or feed it directly into your
              strategy generator. Cancel anytime &mdash; you keep everything.
            </p>
          </div>
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
            className="inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400/60 hover:text-emerald-400 transition-colors border-b border-emerald-500/20 pb-1"
          >
            Read Vol. 1 — South African Automotive Intelligence Report
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
