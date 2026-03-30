"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const tiers = [
  {
    name: "Starter",
    monthlyPrice: "R5,000",
    annualPrice: "R4,165",
    period: "/month",
    leads: "25 leads/month",
    description: "For independent dealers getting started with AI leads.",
    features: [
      "25 AI-qualified leads",
      "WhatsApp delivery",
      "Lead scoring",
      "Basic dashboard",
      "Email support",
    ],
    cta: "Start Free Trial",
    href: "/get-started?tier=starter",
    popular: false,
  },
  {
    name: "Growth",
    monthlyPrice: "R15,000",
    annualPrice: "R12,500",
    period: "/month",
    leads: "100 leads/month",
    description: "The sweet spot. Most dealerships choose this.",
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
    popular: true,
  },
  {
    name: "Pro",
    monthlyPrice: "R50,000",
    annualPrice: "R41,665",
    period: "/month",
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
    popular: false,
  },
  {
    name: "Enterprise",
    monthlyPrice: "R150,000+",
    annualPrice: "R125,000+",
    period: "/month",
    leads: "Unlimited leads",
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
    popular: false,
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="pricing" className="relative border-t border-zinc-800/50 py-28">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-emerald-500/3 blur-[150px]" />

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
            Pricing
          </Badge>
          <h2 className="text-3xl font-bold text-white md:text-5xl tracking-tight">
            Simple, transparent{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              pricing
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-zinc-400 text-lg">
            No setup fees. No lock-in contracts. Cancel anytime. Every plan
            includes our 4x ROI guarantee.
          </p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900/80 p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                !annual
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-300"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                annual
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-300"
              }`}
            >
              Annual{" "}
              <span className="text-emerald-400 text-xs font-semibold">
                Save 2 months
              </span>
            </button>
          </div>
        </motion.div>

        {/* Tier Cards */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {tiers.map((tier) => (
            <motion.div
              key={tier.name}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className={`relative flex flex-col rounded-2xl border bg-zinc-900/60 backdrop-blur-sm p-6 ${
                tier.popular
                  ? "border-emerald-500/50 shadow-[0_0_60px_-15px_rgba(16,185,129,0.25)]"
                  : "border-zinc-800/50 hover:border-zinc-700/50"
              } transition-all`}
            >
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-emerald-600 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 px-4">
                    Most Popular
                  </Badge>
                </div>
              )}

              {/* Name */}
              <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
              <p className="mt-1 text-sm text-zinc-500">{tier.description}</p>

              {/* Price */}
              <div className="mt-6 mb-1">
                <span className="font-mono text-3xl font-bold text-white">
                  {annual ? tier.annualPrice : tier.monthlyPrice}
                </span>
                <span className="text-sm text-zinc-500">{tier.period}</span>
              </div>
              <p className="text-xs font-medium text-emerald-400 mb-6">
                {tier.leads}
              </p>

              {/* Features */}
              <ul className="flex-1 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span className="text-zinc-300">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="mt-8">
                <Link href={tier.href}>
                  <Button
                    className={`w-full ${
                      tier.popular
                        ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20"
                        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
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
