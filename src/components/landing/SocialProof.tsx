"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const proofPoints = [
  {
    stat: "329+",
    label: "Dealerships Connected",
    detail: "Across Gauteng, Western Cape, KwaZulu-Natal, and 12 other regions",
  },
  {
    stat: "23",
    label: "Predictive Signals",
    detail: "Life events tracked from CIPC, property registrations, job portals, and social data",
  },
  {
    stat: "<30s",
    label: "Lead Delivery",
    detail: "From signal detection to WhatsApp notification on your sales team's phone",
  },
  {
    stat: "6",
    label: "Languages Supported",
    detail: "English, Afrikaans, isiZulu, Sesotho, Xitsonga, isiXhosa",
  },
  {
    stat: "24/7",
    label: "Autonomous Operation",
    detail: "Your AI agent finds, qualifies, and delivers leads while your team sleeps",
  },
  {
    stat: "POPIA",
    label: "Fully Compliant",
    detail: "All data processing adheres to South African data protection regulations",
  },
];

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

export default function SocialProof() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section className="relative py-32 bg-[#020c07]">
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <span className="section-label">By the Numbers</span>
          <h2 className="mt-4 heading-xl">
            Built for <span className="text-emerald-400">South Africa</span>.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] text-white/40">
            Real infrastructure. Real signals. Real results for dealerships
            across the country.
          </p>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-16 grid gap-px md:grid-cols-3 bg-white/[0.04] border border-white/[0.06]"
        >
          {proofPoints.map((point) => (
            <motion.div
              key={point.label}
              variants={cardVariants}
              className="bg-[#020c07] p-8 hover:bg-white/[0.02] transition-colors text-center"
            >
              <div className="font-mono text-3xl md:text-4xl font-extralight text-emerald-400">
                {point.stat}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mt-2">
                {point.label}
              </div>
              <p className="text-[12px] leading-relaxed text-white/25 mt-3 max-w-xs mx-auto">
                {point.detail}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Follow us */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 text-center"
        >
          <a
            href="https://instagram.com/visiocorp"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/20 hover:text-emerald-400/60 transition-colors"
          >
            Follow us @visiocorp
          </a>
        </motion.div>
      </div>
    </section>
  );
}
