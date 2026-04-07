"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { SUITE } from "@/lib/suite";

/**
 * Suite Grid — 6 sibling products as clean cards.
 *
 * Replaces the old VisioAutoSuite section (which had architecture diagrams
 * and internal jargon). This is customer-facing: name · one line · two links.
 * No vt_transactions. No paper IDs. No ARR targets.
 */

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

// Customer-facing taglines (not the internal `tagline` which is more technical)
const CUSTOMER_COPY: Record<string, { oneLiner: string; plainRole: string }> = {
  approve: {
    oneLiner: "Pre-approve buyers in 90 seconds",
    plainRole:
      "Compare four bank rates instantly. No credit pull. No rejected applications. Fewer wasted F&I hours.",
  },
  inspect: {
    oneLiner: "AI condition reports from 12 phone photos",
    plainRole:
      "Build buyer trust on any used car. R49 per report or R299/mo unlimited. Confidence-gated grading.",
  },
  bdc: {
    oneLiner: "WhatsApp-native lead routing and templates",
    plainRole:
      "30 templates in English, Afrikaans, and Zulu. Built for SA dealers at SA prices. 5× cheaper than US tools.",
  },
  intent: {
    oneLiner: "Real-time buying intent data for OEMs and banks",
    plainRole:
      "The forward-looking layer Lightstone and TransUnion do not publish. Subscribe monthly. Free public Index.",
  },
  "open-finance": {
    oneLiner: "Bank statement affordability for thin-file buyers",
    plainRole:
      "Approve the gig workers, freelancers, and self-employed buyers the bureaus cannot see. Audit-grade PDF for banks.",
  },
  trust: {
    oneLiner: "Escrow, delivery, and 7-day returns",
    plainRole:
      "The unified transaction layer — buyer trust, dealer stock velocity, no inventory risk. Save R1.25M/year in floorplan interest.",
  },
};

export default function HomeSuiteGrid() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section id="suite" className="relative py-32 bg-[#020c07]">
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400/70">
            The Suite
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl font-extralight tracking-tight text-white max-w-3xl leading-[1.1]">
            Six connected products.
            <br />
            <span className="text-emerald-400">One platform.</span>
          </h2>
          <p className="mt-6 text-[15px] leading-relaxed text-white/50 max-w-xl">
            Every product solves one piece of the SA car-buying journey. Together they cover
            the whole thing — from pre-approval to delivery to buyer trust.
          </p>
        </motion.div>

        {/* Grid */}
        <div ref={ref} className="mt-16 grid gap-px md:grid-cols-2 lg:grid-cols-3 bg-white/[0.04] border border-white/[0.06]">
          {SUITE.map((product, i) => {
            const copy = CUSTOMER_COPY[product.key];
            return (
              <motion.div
                key={product.key}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className="bg-[#020c07] p-7 hover:bg-white/[0.02] transition-colors group flex flex-col"
              >
                {/* Status */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-500/40">
                    {product.shortName}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-400/70">
                      Live
                    </span>
                  </div>
                </div>

                {/* Name */}
                <h3 className="text-[17px] font-medium text-white/90">{product.name}</h3>
                <p className="mt-2 text-[13px] text-emerald-400/80">{copy.oneLiner}</p>

                {/* Description */}
                <p className="mt-4 text-[12px] leading-relaxed text-white/40 flex-1">
                  {copy.plainRole}
                </p>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-between">
                  <a
                    href={product.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-emerald-400/80 hover:text-emerald-400 transition-colors"
                  >
                    Open Tool
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                  <Link
                    href={`/pricing?sku=${product.key}`}
                    className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40 hover:text-white/70 transition-colors"
                  >
                    Pricing →
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 text-center"
        >
          <Link
            href="/research"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/40 hover:text-emerald-400 transition-colors"
          >
            Read the full architecture in our research papers →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
