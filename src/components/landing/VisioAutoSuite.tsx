"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, FileText, ExternalLink } from "lucide-react";
import { SUITE, SUITE_META } from "@/lib/suite";
import WindowFrame from "./WindowFrame";

/**
 * The Visio Auto Suite — 6 sub-products live on their own Vercel deploys.
 *
 * Each card has TWO links:
 *   1. Live URL → opens the actual deployed tool (visio-{product}.vercel.app)
 *   2. Paper URL → opens the VRL paper inside visio-auto (/papers/visio-{product})
 *
 * URLs are sourced from `lib/suite.ts` so this stays in sync with Hero, Navbar,
 * Footer, and the Jess SDK agent.
 */

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function VisioAutoSuite() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.05 });

  return (
    <section id="suite" className="relative py-32 bg-[#020c07] overflow-hidden">
      {/* Network infographic backdrop — Nano Banana generated */}
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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05)_0%,transparent_60%)] z-0" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="section-label">The Visio Auto Suite</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400/80 border border-emerald-500/30 bg-emerald-500/[0.06] px-2 py-0.5">
              6 PRODUCTS LIVE
            </span>
          </div>
          <h2 className="mt-4 heading-xl max-w-4xl">
            One suite. Six products.
            <br />
            <span className="text-emerald-400">Carvana for South Africa</span>{" "}
            &mdash; without the balance sheet.
          </h2>
          <div className="mt-6 flex items-start gap-3 max-w-2xl">
            <div className="mt-1.5 h-px w-8 bg-emerald-500/40 shrink-0" />
            <p className="text-[15px] leading-relaxed text-white/50">
              Six structural information asymmetries in the SA car market. Six independent
              products, each profitable on its own. <strong className="text-white/70">One unified{" "}
              <code className="text-emerald-400/80 bg-white/[0.04] px-1 py-0.5 rounded-sm text-[12px]">
                vt_transactions
              </code>{" "}
              ledger</strong> tying them together. Built in a single sprint, deployed in a single
              day, operating inside a single legal gap with{" "}
              <span className="text-emerald-400/80">zero financial-services regulatory burden</span>.
            </p>
          </div>
        </motion.div>

        {/* Suite metrics strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 border border-white/[0.06] divide-x divide-white/[0.06]"
        >
          <div className="bg-white/[0.02] px-5 py-5 text-center">
            <div className="font-mono text-2xl font-extralight text-emerald-400">
              {SUITE.length}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30 mt-1">
              Live Products
            </div>
          </div>
          <div className="bg-white/[0.02] px-5 py-5 text-center">
            <div className="font-mono text-2xl font-extralight text-emerald-400">
              {SUITE_META.totalAnnualRevenueTarget}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30 mt-1">
              Year-2 Target
            </div>
          </div>
          <div className="bg-white/[0.02] px-5 py-5 text-center">
            <div className="font-mono text-2xl font-extralight text-emerald-400">29</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30 mt-1">
              Supabase Tables
            </div>
          </div>
          <div className="bg-white/[0.02] px-5 py-5 text-center">
            <div className="font-mono text-2xl font-extralight text-emerald-400">0</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30 mt-1">
              Regulatory Burden
            </div>
          </div>
        </motion.div>

        {/* The 6 product cards */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-12 grid gap-px md:grid-cols-2 lg:grid-cols-3 bg-white/[0.04] border border-white/[0.06]"
        >
          {SUITE.map((product, i) => (
            <motion.div
              key={product.key}
              variants={cardVariants}
              className="bg-[#020c07] p-7 hover:bg-white/[0.02] transition-colors group flex flex-col"
            >
              {/* Number + status */}
              <div className="flex items-baseline justify-between mb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-500/40">
                  Product {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-400/70">
                    LIVE
                  </span>
                </div>
              </div>

              {/* Name + tagline */}
              <h3 className="text-[16px] font-medium text-white/85">{product.name}</h3>
              <p className="text-[13px] text-emerald-400/70 mt-1">{product.tagline}</p>

              {/* Role */}
              <p className="text-[12px] text-white/35 mt-3 leading-relaxed flex-1">
                {product.role}
              </p>

              {/* Revenue + paper number */}
              <div className="mt-5 flex items-center justify-between">
                <span className="font-mono text-[11px] text-emerald-400/60">
                  {product.revenueTarget}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/25">
                  {product.paperNumber}
                </span>
              </div>

              {/* Action buttons */}
              <div className="mt-6 grid grid-cols-2 gap-2">
                <a
                  href={product.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 border border-emerald-500/30 bg-emerald-500/[0.05] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-emerald-400/80 hover:bg-emerald-500/[0.1] transition-colors"
                >
                  Open Tool
                  <ArrowUpRight className="h-3 w-3" />
                </a>
                <Link
                  href={product.paperUrl}
                  className="inline-flex items-center justify-center gap-1.5 border border-white/[0.08] bg-white/[0.02] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-white/50 hover:bg-white/[0.06] hover:text-white/80 transition-colors"
                >
                  <FileText className="h-3 w-3" />
                  Paper
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Architecture diagram window */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-16"
        >
          <WindowFrame title="vt_transactions.architecture" variant="terminal">
            <div className="p-8 md:p-10 scanlines relative">
              <div className="mb-6">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-400/60">
                  The Unifying Schema
                </span>
                <h4 className="mt-2 text-xl font-extralight text-white">
                  Every product writes into{" "}
                  <code className="text-emerald-400">vt_transactions</code>
                </h4>
              </div>

              <pre className="font-mono text-[11px] leading-relaxed text-white/40 overflow-x-auto">
{`                              ┌─────────────────────────┐
                              │      VISIO INTENT       │  ← Aggregated data layer
                              │  (Bloomberg of SA cars) │     OEMs + banks subscribe
                              └────────────┬────────────┘
                                           │ feeds market pricing into Trust
                                           ▼
        ┌──────────────┐         ┌─────────────────────┐         ┌──────────────┐
        │  VISIO BDC   │ ──────▶ │     VISIO TRUST     │ ◀────── │ VISIO INSPECT│
        │  (WhatsApp + │ signals │  (Transaction OS)   │ reports │ (AI condition)│
        │  38 signals) │         │                     │         └──────────────┘
        └──────────────┘         │   vt_transactions   │
                                 │  ─────────────────  │         ┌──────────────┐
        ┌──────────────┐ approvals│  • inspect_id       │ ────▶  │VISIO APPROVE │
        │  VISIO OPEN  │ ──────▶ │  • approve_id       │         │  (4-bank     │
        │   FINANCE    │         │  • open_finance_id  │ ◀────── │ pre-approval)│
        │ (statements) │ verified│  • bdc_lead_id      │  rates  └──────────────┘
        └──────────────┘ income  │  • intent_pricing   │
                                 │  • escrow_account   │
                                 │  • delivery_status  │
                                 │  • return_window    │
                                 └─────────────────────┘`}
              </pre>

              <p className="mt-6 font-mono text-[11px] text-white/30 leading-relaxed">
                Read the full architecture in{" "}
                <Link
                  href="/papers/suite-overview"
                  className="text-emerald-400/80 hover:text-emerald-400 underline underline-offset-4"
                >
                  VRL-AUTO-010 — Suite Overview
                </Link>
                .
              </p>
            </div>
          </WindowFrame>
        </motion.div>

        {/* Legal posture grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16"
        >
          <div className="text-center mb-8">
            <span className="section-label">Legal Posture</span>
            <h3 className="mt-3 heading-md">
              Zero financial-services <span className="text-emerald-400">regulatory burden</span>.
            </h3>
          </div>

          <div className="grid gap-px md:grid-cols-3 bg-white/[0.04] border border-white/[0.06]">
            {SUITE_META.legalPosture.map((line) => (
              <div
                key={line}
                className="bg-[#020c07] p-5 flex items-start gap-3"
              >
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500/60 shrink-0" />
                <span className="text-[12px] leading-relaxed text-white/50">{line}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 text-center"
        >
          <Link
            href="/papers/suite-overview"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400/60 hover:text-emerald-400 transition-colors border-b border-emerald-500/20 pb-1"
          >
            Read the Suite Overview Paper (VRL-AUTO-010)
            <ExternalLink className="h-3 w-3" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
