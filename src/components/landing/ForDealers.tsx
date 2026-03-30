"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Car, Crown, Gem, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const dealers = [
  {
    title: "Volume Dealers",
    subtitle: "Toyota, VW, Hyundai, Kia",
    icon: Car,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    borderHover: "hover:border-emerald-500/40",
    stat: "100 leads x 10% close = R3.5M",
    description:
      "High-volume lead flow for brands that sell on numbers. Our AI finds budget-conscious buyers actively researching their next family car.",
    features: [
      "100+ qualified leads/month",
      "Budget-matched prospects",
      "Finance-ready scoring",
    ],
  },
  {
    title: "Premium Dealers",
    subtitle: "BMW, Mercedes-Benz, Audi",
    icon: Crown,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    borderHover: "hover:border-blue-500/40",
    stat: "50 leads x 15% close = R6M",
    description:
      "Higher-value prospects with intent signals like promotions, relocations, and lease expirations. Quality over quantity.",
    features: [
      "50+ premium leads/month",
      "Income-verified prospects",
      "Brand affinity matching",
    ],
  },
  {
    title: "Luxury & Exotic",
    subtitle: "Pharoah, Daytona, Bentley",
    icon: Gem,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    borderHover: "hover:border-amber-500/40",
    stat: "10 HNW leads x 30% close = R6M",
    description:
      "Ultra-high-net-worth individuals identified through business registrations, property acquisitions, and lifestyle signals.",
    features: [
      "10+ HNW leads/month",
      "Wealth-verified signals",
      "Concierge matching",
    ],
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function ForDealers() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="why-visio-auto" className="relative border-t border-zinc-800/50 py-28 bg-zinc-900/20">
      <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-blue-500/3 blur-[150px]" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Badge className="mb-4 border-zinc-700 bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800">
            Built for SA Dealers
          </Badge>
          <h2 className="text-3xl font-bold text-white md:text-5xl tracking-tight">
            Every dealership type.{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              One platform.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-zinc-400 text-lg">
            Whether you move 100 cars a month or 10 exotics a year, our AI finds
            the right buyers for your showroom.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-16 grid gap-8 md:grid-cols-3"
        >
          {dealers.map((dealer) => (
            <motion.div
              key={dealer.title}
              variants={cardVariants}
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className={`group relative rounded-2xl border border-zinc-800/50 bg-zinc-900/60 p-8 backdrop-blur-sm ${dealer.borderHover} transition-all hover:shadow-2xl`}
            >
              {/* Icon */}
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-xl ${dealer.bg} mb-6`}
              >
                <dealer.icon className={`h-7 w-7 ${dealer.color}`} />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white">{dealer.title}</h3>
              <p className="text-sm text-zinc-500 mt-1">{dealer.subtitle}</p>

              {/* Stat */}
              <div className="mt-4 rounded-lg bg-zinc-800/50 px-4 py-3 border border-zinc-700/30">
                <p className="font-mono text-sm font-semibold text-emerald-400">
                  {dealer.stat}
                </p>
              </div>

              {/* Description */}
              <p className="mt-5 text-sm leading-relaxed text-zinc-400">
                {dealer.description}
              </p>

              {/* Features */}
              <ul className="mt-5 space-y-2">
                {dealer.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm text-zinc-300"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="mt-6">
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 group-hover:gap-2.5 transition-all">
                  Learn More <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
