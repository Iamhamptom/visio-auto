"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const dealers = [
  {
    tier: "Volume",
    brands: "Toyota, VW, Hyundai, Kia",
    stat: "R3.5M",
    statLabel: "Projected monthly revenue from 100 leads at 10% close rate",
    description:
      "High-volume lead flow for brands that sell on numbers. Our AI finds budget-conscious buyers actively researching their next family car.",
    features: [
      "100+ qualified leads/month",
      "Budget-matched prospects",
      "Finance-ready scoring",
      "WhatsApp delivery",
    ],
    image: "/generated/car-volume.png",
  },
  {
    tier: "Premium",
    brands: "BMW, Mercedes-Benz, Audi",
    stat: "R6M",
    statLabel: "Projected monthly revenue from 50 leads at 15% close rate",
    description:
      "Higher-value prospects with intent signals like promotions, relocations, and lease expirations. Quality over quantity.",
    features: [
      "50+ premium leads/month",
      "Income-verified prospects",
      "Brand affinity matching",
      "Concierge support",
    ],
    image: "/generated/car-premium.png",
  },
  {
    tier: "Luxury & Exotic",
    brands: "Porsche, Bentley, Ferrari",
    stat: "R6M",
    statLabel: "Projected monthly revenue from 10 HNW leads at 30% close rate",
    description:
      "Ultra-high-net-worth individuals identified through business registrations, property acquisitions, and lifestyle signals.",
    features: [
      "10+ HNW leads/month",
      "Wealth-verified signals",
      "Concierge matching",
      "White-glove delivery",
    ],
    image: "/generated/car-luxury.png",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function ForDealers() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section className="relative py-32 bg-[#030f0a]">
      <div className="absolute inset-0 bg-dots opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.04)_0%,transparent_60%)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="section-label">Built for SA Dealers</span>
          <h2 className="mt-4 heading-xl max-w-3xl">
            Every dealership type.
            <br />
            <span className="text-emerald-400">One platform.</span>
          </h2>
          <div className="mt-6 flex items-start gap-3 max-w-xl">
            <div className="mt-1.5 h-px w-8 bg-emerald-500/40 shrink-0" />
            <p className="text-[15px] leading-relaxed text-white/50">
              Whether you move 100 cars a month or 10 exotics a year, our AI finds
              the right buyers for your showroom.
            </p>
          </div>
        </motion.div>

        {/* Cards */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-16 grid gap-px md:grid-cols-3 bg-white/[0.04] border border-white/[0.06]"
        >
          {dealers.map((dealer) => (
            <motion.div
              key={dealer.tier}
              variants={cardVariants}
              className="group relative bg-[#030f0a] hover:bg-white/[0.02] transition-colors overflow-hidden"
            >
              {/* Car image — Gemini generated */}
              <div className="relative h-56 overflow-hidden">
                <motion.div
                  className="absolute inset-0"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Image
                    src={dealer.image}
                    alt={`${dealer.tier} segment vehicle`}
                    fill
                    className="object-cover object-center opacity-70 group-hover:opacity-90 transition-opacity duration-700"
                  />
                </motion.div>
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#030f0a] via-[#030f0a]/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#030f0a]/40 via-transparent to-[#030f0a]/40" />

                {/* Tier label overlay */}
                <div className="absolute bottom-4 left-6">
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-400/80">
                    {dealer.tier}
                  </span>
                  <p className="text-[11px] text-white/50 mt-1 font-mono">{dealer.brands}</p>
                </div>
              </div>

              <div className="p-8 pt-6">
                {/* Revenue stat */}
                <div className="mb-6 border-l-[2px] border-emerald-500/30 pl-4">
                  <div className="font-mono text-3xl font-extralight text-emerald-400">
                    {dealer.stat}
                  </div>
                  <p className="text-[11px] text-white/30 mt-1 leading-relaxed">
                    {dealer.statLabel}
                  </p>
                </div>

                {/* Description */}
                <p className="text-[13px] leading-relaxed text-white/40 mb-6">
                  {dealer.description}
                </p>

                {/* Features */}
                <ul className="space-y-2.5">
                  {dealer.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-[13px] text-white/50">
                      <div className="h-1 w-1 rounded-full bg-emerald-500/50" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href="/get-started"
                  className="mt-8 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-emerald-400/60 hover:text-emerald-400 transition-colors group-hover:gap-2.5"
                >
                  Get started <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
