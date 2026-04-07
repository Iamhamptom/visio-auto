"use client";

import { motion } from "framer-motion";
import { Shield, Globe, Bot, Clock, Award, Lock } from "lucide-react";

const badges = [
  { label: "Built in South Africa", icon: Globe },
  { label: "POPIA Compliant", icon: Shield },
  { label: "AI-Powered Agent", icon: Bot },
  { label: "24/7 Autonomous", icon: Clock },
  { label: "Enterprise Grade", icon: Award },
  { label: "Bank-Level Security", icon: Lock },
];

export default function TrustBar() {
  return (
    <section className="border-y border-white/[0.06] bg-white/[0.01] py-6">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
        >
          {badges.map((badge, i) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="flex items-center gap-2"
            >
              <badge.icon className="h-3.5 w-3.5 text-emerald-500/40" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
                {badge.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
