"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Zap, Brain, Car, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const steps = [
  {
    step: "01",
    title: "Signal Detection",
    description:
      "Our AI monitors 23 life-event signals across social media, CIPC, property registrations, and job portals to detect imminent car buyers.",
    icon: Zap,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    borderColor: "border-emerald-500/30",
    glowColor: "shadow-emerald-500/10",
  },
  {
    step: "02",
    title: "AI Qualification",
    description:
      "Each prospect is scored 0-100 using budget estimation, timeline analysis, brand affinity, and finance readiness. Only qualified leads pass through.",
    icon: Brain,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    borderColor: "border-blue-500/30",
    glowColor: "shadow-blue-500/10",
  },
  {
    step: "03",
    title: "VIN Matching",
    description:
      "Leads are matched to specific vehicles in your inventory by brand, model, budget, and preferences. The right car for the right buyer.",
    icon: Car,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    borderColor: "border-amber-500/30",
    glowColor: "shadow-amber-500/10",
  },
  {
    step: "04",
    title: "WhatsApp Delivery",
    description:
      "Qualified leads are delivered to your sales team on WhatsApp within 30 seconds, with full context, matched vehicles, and suggested responses.",
    icon: MessageCircle,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    borderColor: "border-purple-500/30",
    glowColor: "shadow-purple-500/10",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="how-it-works"
      className="relative border-t border-zinc-800/50 py-28"
    >
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-emerald-500/3 blur-[150px]" />

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
            How It Works
          </Badge>
          <h2 className="text-3xl font-bold text-white md:text-5xl tracking-tight">
            From signal to sale in{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              4 steps
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-zinc-400 text-lg">
            Our AI pipeline detects life events that predict car purchases,
            qualifies the buyer, matches them to your inventory, and delivers the
            lead instantly.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {steps.map((step) => (
            <motion.div
              key={step.step}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className={`group relative rounded-2xl border ${step.borderColor} bg-zinc-900/60 p-6 backdrop-blur-sm hover:shadow-xl ${step.glowColor} transition-shadow`}
            >
              {/* Step number */}
              <span className="absolute top-4 right-4 font-mono text-xs text-zinc-600">
                {step.step}
              </span>

              {/* Icon */}
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${step.bg} mb-5`}
              >
                <step.icon className={`h-6 w-6 ${step.color}`} />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-white mb-3">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                {step.description}
              </p>

              {/* Bottom accent line */}
              <div
                className={`absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent ${step.color.replace("text-", "via-")}/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Connecting line (desktop) */}
        <div className="hidden lg:block absolute top-[calc(50%+60px)] left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] h-px">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="h-full bg-gradient-to-r from-emerald-500/30 via-blue-500/30 via-amber-500/30 to-purple-500/30 origin-left"
          />
        </div>
      </div>
    </section>
  );
}
