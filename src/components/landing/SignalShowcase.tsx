"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  CalendarClock,
  Plane,
  Building2,
  MapPin,
  ShieldAlert,
  Briefcase,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const signals = [
  {
    name: "Lease Expiring",
    probability: 85,
    icon: CalendarClock,
    description: "Vehicle finance agreements ending within 90 days",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    name: "Expat Arriving",
    probability: 80,
    icon: Plane,
    description: "International professionals relocating to South Africa",
    color: "from-blue-500 to-blue-600",
  },
  {
    name: "Fleet Expansion",
    probability: 80,
    icon: Building2,
    description: "Companies hiring or expanding operations",
    color: "from-violet-500 to-violet-600",
  },
  {
    name: "Relocation",
    probability: 75,
    icon: MapPin,
    description: "Inter-city moves triggering vehicle needs",
    color: "from-amber-500 to-amber-600",
  },
  {
    name: "Insurance Write-off",
    probability: 72,
    icon: ShieldAlert,
    description: "Recent claim settlements needing replacement vehicles",
    color: "from-red-500 to-red-600",
  },
  {
    name: "New Business",
    probability: 70,
    icon: Briefcase,
    description: "CIPC registrations indicating new business owners",
    color: "from-cyan-500 to-cyan-600",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function SignalShowcase() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative border-t border-zinc-800/50 py-28">
      <div className="absolute bottom-0 left-0 h-[300px] w-[400px] rounded-full bg-emerald-500/3 blur-[120px]" />

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
            Signal Intelligence
          </Badge>
          <h2 className="text-3xl font-bold text-white md:text-5xl tracking-tight">
            23 signals.{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              One buyer intent score.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-zinc-400 text-lg">
            We track real-world life events that reliably predict vehicle
            purchases. Here are the top signals by conversion probability.
          </p>
        </motion.div>

        {/* Signal cards */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {signals.map((signal) => (
            <motion.div
              key={signal.name}
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              className="group rounded-2xl border border-zinc-800/50 bg-zinc-900/60 p-6 backdrop-blur-sm hover:border-zinc-700/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800/80">
                    <signal.icon className="h-5 w-5 text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">
                      {signal.name}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {signal.description}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-lg font-bold text-white">
                  {signal.probability}%
                </span>
              </div>

              {/* Probability bar */}
              <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${signal.probability}%` } : {}}
                  transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                  className={`h-full rounded-full bg-gradient-to-r ${signal.color}`}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
