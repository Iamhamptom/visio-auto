"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "Starter",
    monthlyPrice: "R5,000",
    annualPrice: "R4,165",
    leads: "25 leads/month",
    description: "For independent dealers getting started with AI leads.",
    features: [
      "25 AI-qualified leads",
      "WhatsApp delivery",
      "Lead scoring (0-100)",
      "Basic dashboard",
      "Email support",
    ],
    cta: "Start Free Trial",
    href: "/get-started?tier=starter",
    highlighted: false,
  },
  {
    name: "Growth",
    monthlyPrice: "R15,000",
    annualPrice: "R12,500",
    leads: "100 leads/month",
    description: "Most dealerships choose this. The sweet spot for ROI.",
    features: [
      "100 AI-qualified leads",
      "WhatsApp + CRM integration",
      "23 signal types tracked",
      "VIN matching",
      "Inventory sync",
      "Analytics dashboard",
      "Priority support",
    ],
    cta: "Get Started",
    href: "/get-started?tier=growth",
    highlighted: true,
  },
  {
    name: "Pro",
    monthlyPrice: "R50,000",
    annualPrice: "R41,665",
    leads: "500 leads/month",
    description: "For dealer groups scaling across regions.",
    features: [
      "500 AI-qualified leads",
      "Multi-branch support",
      "Social radar monitoring",
      "Market intelligence",
      "Custom AI scoring",
      "API access",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    href: "/get-started?tier=pro",
    highlighted: false,
  },
  {
    name: "Enterprise",
    monthlyPrice: "R150,000+",
    annualPrice: "R125,000+",
    leads: "Unlimited",
    description: "For OEMs and national dealer networks.",
    features: [
      "Unlimited leads",
      "White-label platform",
      "National coverage",
      "Custom signal development",
      "Fleet & corporate leads",
      "SLA guarantee",
      "On-site training",
      "24/7 support",
    ],
    cta: "Talk to Us",
    href: "/get-started?tier=enterprise",
    highlighted: false,
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section id="pricing" className="relative py-32 bg-[#030f0a]">
      <div className="absolute inset-0 bg-dots opacity-30" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <span className="section-label">Pricing</span>
          <h2 className="mt-4 heading-xl">
            Transparent <span className="text-emerald-400">pricing</span>.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] text-white/40">
            No setup fees. No lock-in contracts. Cancel anytime.
            Every plan includes our 4x ROI guarantee.
          </p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center border border-white/[0.08] bg-white/[0.02]">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2.5 font-mono text-[11px] uppercase tracking-wider transition-all ${
                !annual
                  ? "bg-white/[0.08] text-white"
                  : "text-white/30 hover:text-white/50"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2.5 font-mono text-[11px] uppercase tracking-wider transition-all ${
                annual
                  ? "bg-white/[0.08] text-white"
                  : "text-white/30 hover:text-white/50"
              }`}
            >
              Annual{" "}
              <span className="text-emerald-400/70">-17%</span>
            </button>
          </div>
        </motion.div>

        {/* Tier Cards */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-16 grid gap-px md:grid-cols-4 bg-white/[0.04] border border-white/[0.06]"
        >
          {tiers.map((tier) => (
            <motion.div
              key={tier.name}
              variants={cardVariants}
              className={`relative flex flex-col p-8 transition-colors ${
                tier.highlighted
                  ? "bg-emerald-500/[0.04] border-emerald-500/10"
                  : "bg-[#030f0a] hover:bg-white/[0.02]"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute top-0 left-0 right-0 h-px bg-emerald-500/40" />
              )}

              {/* Name */}
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-500/40">
                {tier.name}
              </span>
              <p className="mt-2 text-[12px] text-white/30">{tier.description}</p>

              {/* Price */}
              <div className="mt-6 mb-1">
                <span className="font-mono text-3xl font-extralight text-white">
                  {annual ? tier.annualPrice : tier.monthlyPrice}
                </span>
                <span className="text-[12px] text-white/30 ml-1">/mo</span>
              </div>
              <p className="font-mono text-[11px] text-emerald-400/60 mb-8">
                {tier.leads}
              </p>

              {/* Features */}
              <ul className="flex-1 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px]">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500/50" />
                    <span className="text-white/45">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="mt-8">
                <Link href={tier.href}>
                  <Button
                    className={`w-full text-[12px] font-mono uppercase tracking-wider h-10 ${
                      tier.highlighted
                        ? "bg-emerald-600 text-white hover:bg-emerald-500"
                        : "bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]"
                    }`}
                  >
                    {tier.cta}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
