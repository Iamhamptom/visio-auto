"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ShieldCheck } from "lucide-react";
import { MiniWindow } from "./WindowFrame";
import {
  IconSignal,
  IconBrain,
  IconEmail,
  IconCalendar,
  IconPhone,
  IconWhatsApp,
  IconPipeline,
  IconChart,
  IconGlobe,
} from "./RetroIcons";

const agentCapabilities = [
  {
    icon: IconSignal,
    title: "Signal Detection",
    description:
      "Monitors 23 life-event signals across CIPC, property registrations, job portals, and social platforms to identify imminent car buyers.",
  },
  {
    icon: IconBrain,
    title: "Lead Qualification",
    description:
      "Scores every prospect 0-100 using budget estimation, timeline analysis, brand affinity, and finance readiness. Only qualified leads reach your team.",
  },
  {
    icon: IconEmail,
    title: "Email Outreach",
    description:
      "Crafts and sends personalised outreach sequences to qualified prospects. Follows up automatically based on engagement signals.",
  },
  {
    icon: IconCalendar,
    title: "Calendar & Booking",
    description:
      "Syncs with your sales team calendars. Books test drives, follow-up calls, and showroom visits directly into available slots.",
  },
  {
    icon: IconPhone,
    title: "Call Scheduling",
    description:
      "Triggers outbound call queues for your BDC team. Prioritises high-intent leads with full context briefings before each call.",
  },
  {
    icon: IconWhatsApp,
    title: "WhatsApp Delivery",
    description:
      "Pushes qualified leads to your sales floor on WhatsApp within 30 seconds, with matched vehicles and suggested talking points.",
  },
  {
    icon: IconPipeline,
    title: "Pipeline Management",
    description:
      "Tracks every lead from signal to sale. Updates deal stages, flags stalled opportunities, and provides real-time conversion analytics.",
  },
  {
    icon: IconChart,
    title: "Market Intelligence",
    description:
      "Analyses competitor pricing, regional demand patterns, and inventory gaps. Recommends stock adjustments based on incoming signal data.",
  },
  {
    icon: IconGlobe,
    title: "Multi-Language",
    description:
      "Communicates in English, Afrikaans, isiZulu, Sesotho, Xitsonga, and isiXhosa. Matches the prospect's preferred language automatically.",
  },
];

const metrics = [
  { value: "23", label: "Signal Types", description: "Life events tracked across public and proprietary data sources" },
  { value: "0–100", label: "Lead Score", description: "AI qualification score combining intent, budget, and timeline" },
  { value: "<30s", label: "Delivery", description: "From signal detection to WhatsApp notification on your phone" },
  { value: "6", label: "Languages", description: "Native support for South Africa's major business languages" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function AgentPlatform() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section id="platform" className="relative py-32 bg-[#030f0a]">
      <div className="absolute inset-0 bg-dots opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.04)_0%,transparent_60%)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <span className="section-label">The Platform</span>
          <h2 className="mt-4 heading-xl max-w-3xl">
            One autonomous agent.
            <br />
            <span className="text-emerald-400">End-to-end</span> car sales.
          </h2>
          <div className="mt-6 flex items-start gap-3 max-w-2xl">
            <div className="mt-1.5 h-px w-8 bg-emerald-500/40 shrink-0" />
            <p className="text-[15px] leading-relaxed text-white/50">
              Visio Auto is not a lead list. It&apos;s an AI agent that operates across your entire sales funnel &mdash;
              finding buyers through predictive signals, qualifying them with proprietary scoring,
              sending personalised outreach, booking appointments, and delivering ready-to-close leads
              to your sales team on WhatsApp. It works 24/7 while your team focuses on closing.
            </p>
          </div>
        </motion.div>

        {/* Metrics bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 border border-white/[0.06] divide-x divide-white/[0.06]"
        >
          {metrics.map((m) => (
            <div key={m.label} className="px-5 py-6 bg-white/[0.02]">
              <div className="font-mono text-2xl font-extralight text-emerald-400">
                {m.value}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mt-1">
                {m.label}
              </div>
              <p className="text-[12px] leading-relaxed text-white/25 mt-2">
                {m.description}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Capability grid — MiniWindows with retro icons */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-12 grid gap-3 md:grid-cols-3"
        >
          {agentCapabilities.map((cap) => (
            <motion.div key={cap.title} variants={cardVariants}>
              <MiniWindow title={cap.title.toLowerCase().replace(/ /g, "-")}>
                <div className="p-5">
                  <cap.icon size={28} className="mb-4" />
                  <h3 className="text-[14px] font-medium text-white/80 mb-2">
                    {cap.title}
                  </h3>
                  <p className="text-[12px] leading-relaxed text-white/30">
                    {cap.description}
                  </p>
                </div>
              </MiniWindow>
            </motion.div>
          ))}
        </motion.div>

        {/* POPIA compliance note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex items-center gap-3 text-white/20"
        >
          <ShieldCheck className="h-4 w-4 text-emerald-500/40" />
          <span className="font-mono text-[11px] tracking-wide">
            Fully POPIA compliant. All data processing adheres to South African data protection regulations.
          </span>
        </motion.div>
      </div>
    </section>
  );
}
