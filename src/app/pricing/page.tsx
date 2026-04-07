"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2, MessageCircle } from "lucide-react";
import {
  CATALOG,
  CATALOG_BY_SKU,
  formatPrice,
  type CatalogItem,
} from "@/lib/commerce/catalog";
import { VisioLogoMark } from "@/components/landing/VisioLogo";
import Navbar from "@/components/home/Navbar";

/**
 * Visio Auto Pricing — full catalog + checkout flow.
 *
 * Three states:
 *   1. Browse — see every plan + add-on, filterable
 *   2. Configure — selected plan + buyer details form
 *   3. Submitting — POST to /api/commerce/orders or /api/commerce/subscriptions
 *
 * Pre-selectable via URL: /pricing?sku=bdc-pro
 */

function PricingContent() {
  const searchParams = useSearchParams();
  const initialSku = searchParams.get("sku");
  const cancelled = searchParams.get("cancelled");

  const [selectedSku, setSelectedSku] = useState<string | null>(initialSku);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (initialSku && CATALOG_BY_SKU[initialSku]) {
      setSelectedSku(initialSku);
    }
  }, [initialSku]);

  const selected = selectedSku ? CATALOG_BY_SKU[selectedSku] : null;

  const filtered =
    filter === "all"
      ? CATALOG
      : CATALOG.filter((c) => c.family === filter);

  async function handleCheckout() {
    if (!selected || !email) return;
    setSubmitting(true);
    setError(null);

    try {
      if (selected.family === "custom") {
        // Quote-only — submit a concierge request
        const res = await fetch("/api/commerce/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            buyer_email: email,
            buyer_name: name || undefined,
            buyer_phone: phone || undefined,
            items: [{ sku: selected.sku }],
            data_source: "shop_page",
            buyer_notes: "Quote request from /shop page",
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error ?? "Quote request failed");
          setSubmitting(false);
          return;
        }
        // For quote-only, redirect to a success page
        window.location.href = `/shop/success?quote=${json.order?.order_number ?? "submitted"}`;
        return;
      }

      const endpoint =
        selected.family === "subscription"
          ? "/api/commerce/subscriptions"
          : "/api/commerce/orders";
      const body =
        selected.family === "subscription"
          ? {
              buyer_email: email,
              buyer_name: name || undefined,
              buyer_phone: phone || undefined,
              sku: selected.sku,
              data_source: "shop_page",
            }
          : {
              buyer_email: email,
              buyer_name: name || undefined,
              buyer_phone: phone || undefined,
              items: [{ sku: selected.sku }],
              data_source: "shop_page",
            };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Checkout failed");
        setSubmitting(false);
        return;
      }
      const checkoutUrl = json.checkout?.redirect_url;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        setError("No checkout URL returned");
        setSubmitting(false);
      }
    } catch (e) {
      setError((e as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020c07] text-white/80 cursor-xp">
      <Navbar />

      <div className="relative pt-32 pb-20">
        <div className="absolute inset-0 bg-grid opacity-25 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.04)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative mx-auto max-w-6xl px-6">
          {/* Header */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-white/70 transition-colors mb-8"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Visio Auto
          </Link>

          <div className="flex items-center gap-4 mb-3">
            <VisioLogoMark size={32} />
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400/60">
              Pricing
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extralight tracking-tight text-white max-w-3xl">
            Simple pricing.
            <br />
            Pay for results.
          </h1>
          <p className="mt-4 text-[15px] text-white/50 max-w-2xl">
            Plans for dealerships, add-ons for power users, and data tiers for OEMs and banks.
            Start free, upgrade as you grow. Need help choosing?{" "}
            <span className="text-emerald-400/80">Ask Jess</span> in the chat widget and she
            will walk you through it in plain English.
          </p>

          {cancelled && (
            <div className="mt-6 border border-amber-500/30 bg-amber-500/[0.05] p-4 max-w-2xl">
              <p className="font-mono text-[12px] text-amber-400/80">
                Order cancelled — {cancelled}. Restart below or contact concierge@visiocorp.co.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-6 border border-red-500/30 bg-red-500/[0.05] p-4 max-w-2xl">
              <p className="font-mono text-[12px] text-red-400/80">
                {error}
              </p>
            </div>
          )}

          <div className="mt-12 grid lg:grid-cols-[1fr_400px] gap-8">
            {/* Catalog list */}
            <div>
              {/* Filter */}
              <div className="mb-6 flex items-center gap-2">
                {(["all", "subscription", "one_off", "custom"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] border transition-colors ${
                      filter === f
                        ? "border-emerald-500/40 bg-emerald-500/[0.08] text-emerald-400"
                        : "border-white/[0.08] bg-white/[0.02] text-white/40 hover:text-white/70"
                    }`}
                  >
                    {f === "all"
                      ? "All"
                      : f === "subscription"
                        ? "Subscriptions"
                        : f === "one_off"
                          ? "One-off"
                          : "Quote"}
                  </button>
                ))}
              </div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.04 } },
                }}
                className="space-y-px bg-white/[0.04] border border-white/[0.06]"
              >
                {filtered.map((item) => (
                  <motion.button
                    key={item.sku}
                    variants={{
                      hidden: { opacity: 0, x: -8 },
                      visible: { opacity: 1, x: 0 },
                    }}
                    onClick={() => setSelectedSku(item.sku)}
                    className={`block w-full text-left bg-[#020c07] p-5 hover:bg-white/[0.02] transition-colors border-l-[3px] ${
                      selectedSku === item.sku
                        ? "border-l-emerald-500/80"
                        : "border-l-transparent"
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-emerald-500/40">
                            {item.family === "subscription"
                              ? "SUB"
                              : item.family === "one_off"
                                ? "ORDER"
                                : "QUOTE"}
                          </span>
                          <span className="text-[14px] text-white/85 font-medium">
                            {item.label}
                          </span>
                        </div>
                        <p className="text-[12px] text-white/40">
                          {item.shortDescription}
                        </p>
                      </div>
                      <span className="font-mono text-[14px] text-emerald-400 whitespace-nowrap">
                        {formatPrice(item)}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            </div>

            {/* Cart sidebar */}
            <div className="lg:sticky lg:top-24 self-start">
              <CartPanel
                selected={selected}
                email={email}
                name={name}
                phone={phone}
                submitting={submitting}
                onEmailChange={setEmail}
                onNameChange={setName}
                onPhoneChange={setPhone}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartPanel(props: {
  selected: CatalogItem | null;
  email: string;
  name: string;
  phone: string;
  submitting: boolean;
  onEmailChange: (v: string) => void;
  onNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onCheckout: () => void;
}) {
  const { selected, email, name, phone, submitting } = props;

  if (!selected) {
    return (
      <div className="border border-white/[0.06] bg-white/[0.02] p-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400/60">
          Your Cart
        </span>
        <p className="mt-4 text-[13px] text-white/40 leading-relaxed">
          Pick a SKU from the catalog on the left. The cart will appear here with
          the value pitch and a single checkout button.
        </p>
        <Link
          href="/#chat"
          className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400/60 hover:text-emerald-400 transition-colors border-b border-emerald-500/20 pb-0.5"
        >
          <MessageCircle className="h-3 w-3" />
          Or ask Jess in chat
        </Link>
      </div>
    );
  }

  const isCustom = selected.family === "custom";

  return (
    <div className="border border-emerald-500/30 bg-white/[0.02] p-6 space-y-5">
      <div>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400/70">
          Selected
        </span>
        <h3 className="mt-2 text-lg font-medium text-white">
          {selected.label}
        </h3>
        <p className="text-[12px] text-white/40 mt-1">
          {selected.shortDescription}
        </p>
      </div>

      {/* Price */}
      <div className="border-y border-white/[0.06] py-4">
        <div className="font-mono text-2xl font-extralight text-emerald-400">
          {formatPrice(selected)}
        </div>
        <p className="text-[11px] italic text-white/40 mt-2 leading-relaxed">
          &ldquo;{selected.valueHook}&rdquo;
        </p>
      </div>

      {/* Includes */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30 mb-3">
          Included
        </div>
        <ul className="space-y-2">
          {selected.includes.map((inc) => (
            <li
              key={inc}
              className="flex items-start gap-2 text-[12px] text-white/55"
            >
              <Check className="h-3 w-3 text-emerald-500/50 shrink-0 mt-0.5" />
              {inc}
            </li>
          ))}
        </ul>
      </div>

      {/* Form */}
      <div className="space-y-3 border-t border-white/[0.06] pt-5">
        <input
          type="email"
          required
          placeholder="Your email"
          value={email}
          onChange={(e) => props.onEmailChange(e.target.value)}
          className="w-full bg-white/[0.02] border border-white/[0.08] px-4 py-2.5 text-[13px] text-white/80 placeholder:text-white/25 focus:border-emerald-500/40 outline-none transition-colors"
        />
        <input
          type="text"
          placeholder="Your name (optional)"
          value={name}
          onChange={(e) => props.onNameChange(e.target.value)}
          className="w-full bg-white/[0.02] border border-white/[0.08] px-4 py-2.5 text-[13px] text-white/80 placeholder:text-white/25 focus:border-emerald-500/40 outline-none transition-colors"
        />
        <input
          type="tel"
          placeholder="Phone / WhatsApp (optional)"
          value={phone}
          onChange={(e) => props.onPhoneChange(e.target.value)}
          className="w-full bg-white/[0.02] border border-white/[0.08] px-4 py-2.5 text-[13px] text-white/80 placeholder:text-white/25 focus:border-emerald-500/40 outline-none transition-colors"
        />
      </div>

      {/* CTA */}
      <button
        onClick={props.onCheckout}
        disabled={!email || submitting}
        className="w-full bg-emerald-600 disabled:bg-white/[0.06] disabled:text-white/30 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-white hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Creating order...
          </>
        ) : isCustom ? (
          <>
            Request Quote
            <ArrowRight className="h-3.5 w-3.5" />
          </>
        ) : (
          <>
            Continue to Yoco
            <ArrowRight className="h-3.5 w-3.5" />
          </>
        )}
      </button>

      <p className="font-mono text-[10px] text-white/25 text-center leading-relaxed">
        Payment via Yoco. POPIA-compliant. You receive a receipt by email.
      </p>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#020c07] flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-emerald-500/60 animate-spin" />
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  );
}
