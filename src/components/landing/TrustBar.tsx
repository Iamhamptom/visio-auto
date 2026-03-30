"use client";

import { motion } from "framer-motion";
import { Shield, Globe, Bot, Clock } from "lucide-react";

const badges = [
  { label: "Built in South Africa", icon: Globe },
  { label: "POPIA Compliant", icon: Shield },
  { label: "AI-Powered", icon: Bot },
  { label: "24/7 Automated", icon: Clock },
];

export default function TrustBar() {
  return (
    <section className="border-t border-zinc-800/50 py-12 bg-zinc-900/30">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-16"
        >
          {badges.map((badge, i) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex items-center gap-2.5 text-zinc-500"
            >
              <badge.icon className="h-4 w-4 text-emerald-500/60" />
              <span className="text-sm font-medium">{badge.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
