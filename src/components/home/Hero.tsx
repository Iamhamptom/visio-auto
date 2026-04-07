"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

/**
 * World-class hero.
 *
 * One headline. Two CTAs. Four verified stats. One product visual.
 * Not Jess. Not the architecture. Not the paper IDs.
 * Just: what do we do, for whom, and why it matters.
 */

const STATS = [
  { value: "329+", label: "SA Dealerships" },
  { value: "84+", label: "Buying Signals" },
  { value: "<30s", label: "WhatsApp Delivery" },
  { value: "POPIA", label: "Compliant" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export default function HomeHero() {
  return (
    <section className="relative min-h-[92vh] overflow-hidden bg-[#030f0a] flex items-center">
      {/* Background car image — subtle, stays in its lane */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 ken-burns">
          <Image
            src="/generated/hero-car.png"
            alt=""
            fill
            priority
            className="object-cover object-right opacity-30 mix-blend-screen pointer-events-none"
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_left,rgba(3,15,10,0.7)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030f0a] via-transparent to-transparent" />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-30 z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.05)_0%,transparent_60%)] z-0" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-32 pb-20 w-full">
        {/* Eyebrow */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400/70 border border-emerald-500/25 bg-emerald-500/[0.04] px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            AI Automotive Intelligence · South Africa
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-8 text-5xl sm:text-6xl md:text-7xl lg:text-[84px] font-extralight leading-[1.02] tracking-[-0.02em] text-white max-w-5xl"
        >
          More qualified
          <br />
          car buyers.
          <br />
          <span className="text-emerald-400">Delivered.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-8 text-[17px] md:text-[18px] leading-relaxed text-white/55 max-w-2xl"
        >
          The AI platform South African dealerships use to find ready-to-buy customers, close
          more sales, and stay ahead of the market — with world-class industrial intelligence
          and WhatsApp delivery in under 30 seconds.
        </motion.p>

        {/* CTAs */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-10 flex flex-col items-start gap-4 sm:flex-row"
        >
          <Link
            href="/get-started"
            className="inline-flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 px-8 py-4 font-mono text-[12px] uppercase tracking-[0.2em] text-[#030f0a] font-medium transition-colors"
          >
            Start Free Trial
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2.5 border border-white/[0.1] bg-white/[0.02] hover:bg-white/[0.06] px-8 py-4 font-mono text-[12px] uppercase tracking-[0.2em] text-white/80 hover:text-white transition-colors"
          >
            See Pricing
          </Link>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-20 grid grid-cols-2 md:grid-cols-4 border border-white/[0.06] divide-x divide-y md:divide-y-0 divide-white/[0.06] max-w-3xl"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-white/[0.02] px-5 py-5 text-center">
              <div className="font-mono text-2xl md:text-3xl font-extralight text-emerald-400">
                {stat.value}
              </div>
              <div className="font-mono text-[9px] md:text-[10px] uppercase tracking-[0.25em] text-white/40 mt-1.5">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Small print */}
        <motion.p
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-white/25"
        >
          No credit card · 5 qualified leads free · POPIA compliant
        </motion.p>
      </div>
    </section>
  );
}
