"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Radar, Brain, Car, MessageCircle } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Signal Detection",
    description:
      "Our AI monitors 23 life-event signals across social media, CIPC registrations, property records, and job portals to detect imminent car buyers before they start searching.",
    icon: Radar,
  },
  {
    step: "02",
    title: "AI Qualification",
    description:
      "Each prospect is scored 0-100 using budget estimation, timeline analysis, brand affinity, and finance readiness. Only verified, high-intent leads pass through to your team.",
    icon: Brain,
  },
  {
    step: "03",
    title: "Inventory Matching",
    description:
      "Leads are matched to specific vehicles in your stock by brand, model, budget, and preferences. The right car for the right buyer, automatically.",
    icon: Car,
  },
  {
    step: "04",
    title: "Instant Delivery",
    description:
      "Qualified leads arrive on WhatsApp within 30 seconds with full buyer context, matched vehicles, and AI-generated talking points for your sales team.",
    icon: MessageCircle,
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section id="how-it-works" className="relative py-32 bg-[#020c07]">
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="section-label">How It Works</span>
          <h2 className="mt-4 heading-xl max-w-2xl">
            From signal to sale
            <br />
            in <span className="text-emerald-400">four steps</span>.
          </h2>
          <div className="mt-6 flex items-start gap-3 max-w-xl">
            <div className="mt-1.5 h-px w-8 bg-emerald-500/40 shrink-0" />
            <p className="text-[15px] leading-relaxed text-white/50">
              Our AI pipeline detects life events that predict car purchases,
              qualifies the buyer, matches them to your inventory, and delivers the
              lead instantly.
            </p>
          </div>
        </motion.div>

        {/* Steps */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-20 grid gap-px md:grid-cols-4 bg-white/[0.04] border border-white/[0.06]"
        >
          {steps.map((step) => (
            <motion.div
              key={step.step}
              variants={cardVariants}
              className="group relative bg-[#020c07] p-8 hover:bg-white/[0.02] transition-colors"
            >
              {/* Step number */}
              <span className="font-mono text-[10px] tracking-[0.3em] text-emerald-500/30 uppercase">
                Step {step.step}
              </span>

              {/* Icon */}
              <div className="mt-5 mb-5">
                <step.icon className="h-6 w-6 text-emerald-500/40 group-hover:text-emerald-400 transition-colors" />
              </div>

              {/* Content */}
              <h3 className="text-[15px] font-medium text-white/80 mb-3">
                {step.title}
              </h3>
              <p className="text-[13px] leading-relaxed text-white/35">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
