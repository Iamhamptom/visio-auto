"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const signals = [
  { name: "Lease Expiring", probability: 85, category: "Financial", description: "Vehicle finance ending within 90 days" },
  { name: "Expat Arriving", probability: 80, category: "Relocation", description: "International professionals relocating to SA" },
  { name: "Fleet Expansion", probability: 80, category: "Corporate", description: "Companies hiring or expanding operations" },
  { name: "Property Purchase", probability: 78, category: "Lifestyle", description: "New home buyers in upgrading patterns" },
  { name: "Relocation", probability: 75, category: "Relocation", description: "Inter-city moves triggering vehicle needs" },
  { name: "Insurance Write-off", probability: 72, category: "Financial", description: "Recent claims needing replacement vehicles" },
  { name: "New Business", probability: 70, category: "Corporate", description: "CIPC registrations indicating new owners" },
  { name: "Job Promotion", probability: 68, category: "Lifestyle", description: "Career advancement signalling higher budget" },
  { name: "Graduation", probability: 65, category: "Lifestyle", description: "Recent graduates entering the workforce" },
  { name: "Marriage", probability: 63, category: "Lifestyle", description: "Life-stage change triggering family vehicle needs" },
  { name: "Social Intent", probability: 60, category: "Digital", description: "Car-related social media engagement signals" },
  { name: "Search Behaviour", probability: 58, category: "Digital", description: "AutoTrader, Cars.co.za browsing patterns" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function SignalShowcase() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section id="signals" className="relative py-32 bg-[#020c07]">
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="section-label">Signal Intelligence</span>
          <h2 className="mt-4 heading-xl max-w-3xl">
            23 predictive signals.
            <br />
            <span className="text-emerald-400">One buyer intent score.</span>
          </h2>
          <div className="mt-6 flex items-start gap-3 max-w-xl">
            <div className="mt-1.5 h-px w-8 bg-emerald-500/40 shrink-0" />
            <p className="text-[15px] leading-relaxed text-white/50">
              We track real-world life events that reliably predict vehicle purchases.
              Each signal is weighted and combined into a single qualification score.
            </p>
          </div>
        </motion.div>

        {/* Data table — VRL research style */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-16 border border-white/[0.06] overflow-hidden"
        >
          {/* Table header */}
          <div className="grid grid-cols-12 gap-0 bg-white/[0.04] px-6 py-3 border-b border-white/[0.06]">
            <div className="col-span-4 font-mono text-[10px] uppercase tracking-[0.25em] text-white/30">
              Signal
            </div>
            <div className="col-span-2 font-mono text-[10px] uppercase tracking-[0.25em] text-white/30 hidden md:block">
              Category
            </div>
            <div className="col-span-4 font-mono text-[10px] uppercase tracking-[0.25em] text-white/30 hidden sm:block">
              Description
            </div>
            <div className="col-span-2 font-mono text-[10px] uppercase tracking-[0.25em] text-white/30 text-right">
              Probability
            </div>
          </div>

          {/* Table rows */}
          {signals.map((signal, i) => (
            <motion.div
              key={signal.name}
              variants={rowVariants}
              className={`grid grid-cols-12 gap-0 px-6 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${
                i % 2 === 0 ? "bg-white/[0.01]" : "bg-transparent"
              }`}
            >
              <div className="col-span-4 text-[13px] text-white/70 font-medium">
                {signal.name}
              </div>
              <div className="col-span-2 hidden md:block">
                <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400/40">
                  {signal.category}
                </span>
              </div>
              <div className="col-span-4 text-[12px] text-white/30 hidden sm:block">
                {signal.description}
              </div>
              <div className="col-span-2 flex items-center justify-end gap-3">
                {/* Mini bar */}
                <div className="hidden md:block w-20 h-1.5 bg-white/[0.06] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${signal.probability}%` } : {}}
                    transition={{ duration: 1, delay: i * 0.05, ease: "easeOut" }}
                    className="h-full bg-emerald-500/50"
                  />
                </div>
                <span className="font-mono text-[13px] font-medium text-emerald-400/80 tabular-nums">
                  {signal.probability}%
                </span>
              </div>
            </motion.div>
          ))}

          {/* Footer note */}
          <div className="px-6 py-3 bg-white/[0.02]">
            <span className="font-mono text-[10px] text-white/20 tracking-wide">
              Showing 12 of 23 tracked signals. Probabilities based on historical conversion data across 329+ dealerships.
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
