"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

/**
 * Pricing Teaser — 3 anchor tiers on the home, full catalogue at /pricing.
 *
 * Clean, scannable, one clear primary tier (Growth), two flanking options.
 * The full 18-SKU catalogue lives at /pricing. Do NOT dump all SKUs here.
 */

const TIERS = [
  {
    name: "Starter",
    price: "R1,500",
    cadence: "/mo",
    description: "For solo dealers and small lots getting started.",
    features: [
      "25 qualified leads/mo",
      "WhatsApp delivery",
      "Lead scoring (0-100)",
      "Basic market intelligence",
      "Email support",
    ],
    cta: "Start Free Trial",
    href: "/get-started?tier=starter",
    popular: false,
  },
  {
    name: "Growth",
    price: "R5,000",
    cadence: "/mo",
    description: "The anchor tier. Most dealerships choose this.",
    features: [
      "100 qualified leads/mo",
      "WhatsApp + voice delivery",
      "Full market intelligence",
      "All 84 signal types",
      "Visio Approve widget",
      "Visio Inspect reports",
      "Priority support",
    ],
    cta: "Start Free Trial",
    href: "/get-started?tier=growth",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    description: "For OEMs, banks, and national dealer networks.",
    features: [
      "Unlimited qualified leads",
      "Full Visio Auto Suite",
      "Visio Intent OEM tier",
      "White-label options",
      "Dedicated account manager",
      "Custom signal engineering",
      "SLA + priority support",
    ],
    cta: "Talk to Sales",
    href: "/pricing?tier=enterprise",
    popular: false,
  },
];

export default function HomePricingTeaser() {
  return (
    <section id="pricing" className="relative py-32 bg-[#030f0a]">
      <div className="absolute inset-0 bg-dots opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.04)_0%,transparent_70%)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400/70">
            Pricing
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl font-extralight tracking-tight text-white leading-[1.1]">
            Simple pricing.
            <br />
            <span className="text-emerald-400">Pay for results.</span>
          </h2>
          <p className="mt-6 text-[15px] text-white/50 max-w-lg mx-auto">
            Start free. Upgrade as you grow. Cancel anytime. No credit card required for the
            free trial.
          </p>
        </motion.div>

        {/* Tiers */}
        <div className="mt-16 grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1] as const,
              }}
              className={`flex flex-col border bg-[#030f0a] p-8 ${
                tier.popular
                  ? "border-emerald-500/40 bg-emerald-500/[0.02] lg:scale-[1.02]"
                  : "border-white/[0.06]"
              }`}
            >
              {tier.popular && (
                <div className="mb-4">
                  <span className="inline-block font-mono text-[9px] uppercase tracking-[0.25em] text-emerald-400 bg-emerald-500/[0.08] border border-emerald-500/30 px-2 py-1">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Name + price */}
              <h3 className="text-xl font-extralight tracking-tight text-white">
                {tier.name}
              </h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-mono text-4xl font-extralight text-white">
                  {tier.price}
                </span>
                {tier.cadence && (
                  <span className="font-mono text-[12px] text-white/40">{tier.cadence}</span>
                )}
              </div>

              {/* Description */}
              <p className="mt-3 text-[13px] text-white/45 leading-relaxed">
                {tier.description}
              </p>

              {/* Features */}
              <ul className="mt-6 space-y-3 flex-1">
                {tier.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-[13px] text-white/60">
                    <Check className="h-3.5 w-3.5 text-emerald-500/60 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={tier.href}
                className={`mt-8 inline-flex items-center justify-center gap-2 py-3 px-5 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${
                  tier.popular
                    ? "bg-emerald-500 hover:bg-emerald-400 text-[#030f0a] font-medium"
                    : "border border-white/[0.1] bg-white/[0.02] hover:bg-white/[0.06] text-white/80 hover:text-white"
                }`}
              >
                {tier.cta}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* See all link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 text-center"
        >
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400/70 hover:text-emerald-400 transition-colors border-b border-emerald-500/20 pb-1"
          >
            See all plans and add-ons
            <ArrowRight className="h-3 w-3" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
