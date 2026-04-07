"use client";

import { motion } from "framer-motion";
import { Shield, Database, Globe2, Lock, Zap, Award } from "lucide-react";

/**
 * Trust bar — verified facts only, no fake customer logos.
 * Six icon-labels in a horizontal strip.
 */

const TRUST_POINTS = [
  { icon: Database, label: "Built on NAAMSA-verified data" },
  { icon: Shield, label: "POPIA Compliant" },
  { icon: Globe2, label: "Built in South Africa" },
  { icon: Lock, label: "Bank-Level Security" },
  { icon: Zap, label: "24/7 Autonomous AI" },
  { icon: Award, label: "Visio Research Labs" },
];

export default function HomeTrustBar() {
  return (
    <section className="relative border-y border-white/[0.06] bg-white/[0.01] py-6">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
        >
          {TRUST_POINTS.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="flex items-center gap-2"
            >
              <item.icon className="h-3.5 w-3.5 text-emerald-500/50" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
                {item.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
