"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

/**
 * Final CTA — the last conversion block.
 *
 * One headline. Two buttons. Small print.
 * Primary repeats the hero CTA. Secondary offers enterprise path.
 */

export default function HomeFinalCTA() {
  return (
    <section className="relative py-32 bg-[#030f0a] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-dots opacity-25" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400/70">
            Get started
          </span>
          <h2 className="mt-6 text-5xl md:text-6xl font-extralight tracking-tight text-white leading-[1.05]">
            Start free.
            <br />
            <span className="text-emerald-400">Pay when it works.</span>
          </h2>
          <p className="mt-8 text-[16px] text-white/50 max-w-xl mx-auto leading-relaxed">
            Join the South African dealerships finding qualified buyers before they walk into
            a competitor. Five leads free. No credit card. Cancel anytime.
          </p>

          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/get-started"
              className="inline-flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 px-8 py-4 font-mono text-[12px] uppercase tracking-[0.2em] text-[#030f0a] font-medium transition-colors"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing?tier=enterprise"
              className="inline-flex items-center gap-2.5 border border-white/[0.1] bg-white/[0.02] hover:bg-white/[0.06] px-8 py-4 font-mono text-[12px] uppercase tracking-[0.2em] text-white/80 hover:text-white transition-colors"
            >
              Talk to Sales
            </Link>
          </div>

          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-white/25">
            5 qualified leads free · No credit card required · POPIA compliant · Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}
