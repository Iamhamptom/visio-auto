"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Radar, Target, Car, MessageCircle } from "lucide-react";

/**
 * How It Works — 3 steps + the delivery channel.
 *
 * Replaces the old HowItWorks, AgentPlatform, SignalDepth clutter.
 * One clean 4-step horizontal flow. No rounded cards. No gradients.
 */

const STEPS = [
  {
    icon: Radar,
    step: "01",
    title: "Signal Detected",
    description:
      "We monitor 84+ buying signals across SA — lease expirations, new jobs, property purchases, insurance claims, social mentions, CIPC registrations.",
  },
  {
    icon: Target,
    step: "02",
    title: "AI Qualified",
    description:
      "Every prospect scored 0-100 for intent, budget, timeline, brand affinity, and bank-grade affordability. Only the ready-to-buy reach you.",
  },
  {
    icon: Car,
    step: "03",
    title: "Inventory Matched",
    description:
      "Leads matched to specific vehicles in your stock by brand, model, price band, and buyer preferences. The right car for the right buyer.",
  },
  {
    icon: MessageCircle,
    step: "04",
    title: "Delivered in 30s",
    description:
      "Qualified leads land on your WhatsApp within 30 seconds — with full buyer context, suggested vehicles, and AI-written talking points.",
  },
];

export default function HomeHowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section id="how-it-works" className="relative py-32 bg-[#020c07]">
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400/70">
            How it works
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl font-extralight tracking-tight text-white max-w-3xl leading-[1.1]">
            Most dealers wait.
            <br />
            <span className="text-emerald-400">The best ones hunt.</span>
          </h2>
          <p className="mt-6 text-[15px] leading-relaxed text-white/50 max-w-xl">
            The average SA dealership holds stock 47 days. 25% of walk-ins get rejected for
            finance. The buyers who would have qualified are already browsing competitors
            online. Visio Auto finds them first.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
          className="mt-16 grid gap-px md:grid-cols-4 bg-white/[0.04] border border-white/[0.06]"
        >
          {STEPS.map((step) => (
            <motion.div
              key={step.step}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
                },
              }}
              className="bg-[#020c07] p-8 hover:bg-white/[0.02] transition-colors group"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-500/40">
                Step {step.step}
              </span>
              <step.icon className="mt-5 h-6 w-6 text-emerald-500/50 group-hover:text-emerald-400 transition-colors" />
              <h3 className="mt-5 text-[15px] font-medium text-white/85">{step.title}</h3>
              <p className="mt-3 text-[13px] leading-relaxed text-white/40">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Proof strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 border-l-[2px] border-l-emerald-500/40 pl-5 max-w-2xl"
        >
          <p className="text-[13px] italic text-white/50 leading-relaxed">
            &ldquo;Dealers using Visio Auto turn stock 1.6× faster. A typical 40-car-per-month
            dealer saves approximately R1.25M per year in floorplan interest.&rdquo;
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/50">
            Visio Research Labs — Stock Velocity Analysis, 2026
          </p>
        </motion.div>
      </div>
    </section>
  );
}
