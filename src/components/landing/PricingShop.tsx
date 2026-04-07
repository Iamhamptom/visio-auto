"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Check, MessageCircle } from "lucide-react";
import { CATALOG, formatPrice, type CatalogItem } from "@/lib/commerce/catalog";
import { SUITE_BY_KEY, type SuiteProductKey } from "@/lib/suite";

/**
 * PricingShop landing section.
 *
 * Renders every catalog SKU grouped by sibling product. Each card has a
 * "Buy" button that goes to /shop?sku=<sku> for the cart-style flow,
 * plus a "Talk to Jess" button for users who want the conversational close.
 */

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

// Group catalog by suite product
function groupByProduct(): Record<string, CatalogItem[]> {
  const groups: Record<string, CatalogItem[]> = {};
  for (const item of CATALOG) {
    const key = item.product;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return groups;
}

const PRODUCT_ORDER: Array<SuiteProductKey | "leads" | "concierge"> = [
  "trust",
  "bdc",
  "approve",
  "intent",
  "open-finance",
  "inspect",
  "leads",
  "concierge",
];

const PRODUCT_LABELS: Record<string, string> = {
  trust: "Visio Trust",
  bdc: "Visio BDC",
  approve: "Visio Approve",
  intent: "Visio Intent",
  "open-finance": "Visio Open Finance",
  inspect: "Visio Inspect",
  leads: "Lead Packs",
  concierge: "Visio Concierge",
};

const PRODUCT_BLURBS: Record<string, string> = {
  trust:
    "The unifying transaction OS. Escrow + delivery + 7-day return + stock velocity dashboard.",
  bdc: "WhatsApp-native BDC for SA dealers. 38 signals, 30 templates in EN/AF/ZU.",
  approve:
    "90-second pre-approval simulator. 4-bank rate compare, no credit pull.",
  intent:
    "K-anonymity-protected buying intent index. The Bloomberg of SA cars.",
  "open-finance":
    "Bank statement parser + NCA Section 81 affordability. Unlocks the thin-file 25%.",
  inspect:
    "12-photo AI condition reports. Confidence-gated grading. The trust layer.",
  leads:
    "AI-qualified buyer leads from the signal pool. Pay per pack, no subscription.",
  concierge:
    "UHNW African luxury concierge — Sandton showroom to Lagos doorstep.",
};

export default function PricingShop() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.05 });
  const groups = groupByProduct();

  return (
    <section id="pricing-shop" className="relative py-32 bg-[#020c07] overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-25 z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05)_0%,transparent_60%)] z-0" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="section-label">Pricing &amp; Shop</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400/80 border border-emerald-500/30 bg-emerald-500/[0.06] px-2 py-0.5">
              PAY VIA YOCO
            </span>
          </div>
          <h2 className="mt-4 heading-xl max-w-4xl">
            Subscribe, order, or
            <br />
            <span className="text-emerald-400">talk to Jess</span> in chat.
          </h2>
          <div className="mt-6 flex items-start gap-3 max-w-2xl">
            <div className="mt-1.5 h-px w-8 bg-emerald-500/40 shrink-0" />
            <p className="text-[15px] leading-relaxed text-white/50">
              Every SKU in the Visio Auto Suite, with transparent ZAR pricing.
              Subscribe to a tier, order a one-off pack, or open the chat and let{" "}
              <span className="text-emerald-400/90">Jess walk you through the value</span>{" "}
              and take the order in conversation. Yoco handles the payment. Entitlements
              activate the moment payment lands.
            </p>
          </div>
        </motion.div>

        {/* Product groups */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-16 space-y-16"
        >
          {PRODUCT_ORDER.map((productKey) => {
            const items = groups[productKey];
            if (!items || items.length === 0) return null;
            const label = PRODUCT_LABELS[productKey];
            const blurb = PRODUCT_BLURBS[productKey];
            const liveUrl =
              productKey in SUITE_BY_KEY
                ? SUITE_BY_KEY[productKey as SuiteProductKey].liveUrl
                : null;

            return (
              <motion.div key={productKey} variants={cardVariants}>
                {/* Product header */}
                <div className="mb-6 flex items-baseline justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-xl font-extralight text-white">
                      {label}
                    </h3>
                    <p className="text-[13px] text-white/40 mt-1 max-w-xl">
                      {blurb}
                    </p>
                  </div>
                  {liveUrl && (
                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400/60 hover:text-emerald-400 transition-colors border-b border-emerald-500/20 pb-0.5"
                    >
                      Open Tool ↗
                    </a>
                  )}
                </div>

                {/* Tier cards */}
                <div className="grid gap-px md:grid-cols-2 lg:grid-cols-3 bg-white/[0.04] border border-white/[0.06]">
                  {items.map((item) => {
                    const isCustom = item.amountCents === -1;
                    const isFree = item.amountCents === 0;

                    return (
                      <div
                        key={item.sku}
                        className="bg-[#020c07] p-7 hover:bg-white/[0.02] transition-colors flex flex-col"
                      >
                        {/* Header */}
                        <div className="flex items-baseline justify-between mb-3">
                          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-500/40">
                            {item.family === "subscription"
                              ? "Subscription"
                              : item.family === "one_off"
                                ? "One-off"
                                : "Quote-only"}
                          </span>
                          {item.tier && (
                            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">
                              {item.tier}
                            </span>
                          )}
                        </div>

                        {/* Label */}
                        <h4 className="text-[15px] font-medium text-white/85">
                          {item.label}
                        </h4>

                        {/* Price */}
                        <div className="mt-3 mb-4">
                          <span
                            className={`font-mono font-extralight ${
                              isCustom
                                ? "text-amber-400/80 text-lg"
                                : isFree
                                  ? "text-white/40 text-lg"
                                  : "text-emerald-400 text-2xl"
                            }`}
                          >
                            {formatPrice(item)}
                          </span>
                        </div>

                        {/* Value hook */}
                        <p className="text-[12px] italic leading-relaxed text-white/45 mb-4">
                          &ldquo;{item.valueHook}&rdquo;
                        </p>

                        {/* Includes */}
                        <ul className="space-y-2 mb-6 flex-1">
                          {item.includes.slice(0, 5).map((inc) => (
                            <li
                              key={inc}
                              className="flex items-start gap-2 text-[12px] text-white/50"
                            >
                              <Check className="h-3 w-3 text-emerald-500/50 shrink-0 mt-0.5" />
                              {inc}
                            </li>
                          ))}
                          {item.includes.length > 5 && (
                            <li className="text-[11px] text-white/25 ml-5">
                              + {item.includes.length - 5} more
                            </li>
                          )}
                        </ul>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-2">
                          {item.selfServe ? (
                            <Link
                              href={`/shop?sku=${item.sku}`}
                              className="inline-flex items-center justify-center gap-1.5 border border-emerald-500/30 bg-emerald-500/[0.05] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-emerald-400/80 hover:bg-emerald-500/[0.1] transition-colors"
                            >
                              {item.family === "subscription" ? "Subscribe" : "Buy"}
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          ) : (
                            <Link
                              href={`/shop?sku=${item.sku}`}
                              className="inline-flex items-center justify-center gap-1.5 border border-amber-500/30 bg-amber-500/[0.05] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-amber-400/80 hover:bg-amber-500/[0.1] transition-colors"
                            >
                              Quote
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          )}
                          <a
                            href={`/?sku=${item.sku}#chat`}
                            className="inline-flex items-center justify-center gap-1.5 border border-white/[0.08] bg-white/[0.02] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-white/50 hover:bg-white/[0.06] hover:text-white/80 transition-colors"
                          >
                            <MessageCircle className="h-3 w-3" />
                            Ask Jess
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-20 border border-white/[0.06] bg-white/[0.02] p-8 md:p-10 grid lg:grid-cols-[1fr_auto] gap-6 items-center"
        >
          <div>
            <span className="section-label">Bring Your Own Question</span>
            <h3 className="mt-3 text-2xl font-extralight tracking-tight text-white max-w-2xl">
              Not sure which product fits? Open the chat.
            </h3>
            <p className="mt-3 text-[13px] text-white/40 max-w-2xl leading-relaxed">
              Tell Jess what you&apos;re trying to do. She&apos;ll walk you through
              the value, run the ROI math, and create the order in chat. You pay via
              Yoco. Entitlements activate the moment payment lands.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 border border-emerald-500/40 bg-emerald-500/[0.08] px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400 hover:bg-emerald-500/[0.15] transition-colors whitespace-nowrap"
          >
            Open the Shop
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
