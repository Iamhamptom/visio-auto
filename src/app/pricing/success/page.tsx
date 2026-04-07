"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowRight, MessageCircle } from "lucide-react";
import { VisioLogoMark } from "@/components/landing/VisioLogo";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const subscriptionNumber = searchParams.get("subscription");
  const quoteNumber = searchParams.get("quote");

  const isQuote = !!quoteNumber;
  const isSubscription = !!subscriptionNumber;
  const reference = orderNumber ?? subscriptionNumber ?? quoteNumber ?? "—";

  return (
    <div className="min-h-screen bg-[#020c07] text-white/80 flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-grid opacity-25 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06)_0%,transparent_60%)] pointer-events-none" />

      <div className="relative max-w-xl w-full">
        <div className="border border-emerald-500/30 bg-white/[0.02] p-10">
          <div className="flex items-center gap-3 mb-6">
            <VisioLogoMark size={28} />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-400/60">
              Visio Auto Shop
            </span>
          </div>

          <CheckCircle2 className="h-10 w-10 text-emerald-400 mb-5" />

          <h1 className="text-3xl font-extralight tracking-tight text-white">
            {isQuote
              ? "Quote request received."
              : isSubscription
                ? "Subscription started."
                : "Payment received."}
          </h1>

          <p className="mt-4 text-[14px] text-white/55 leading-relaxed">
            {isQuote ? (
              <>
                Your quote request has been logged. The Visio Concierge desk will
                respond within <strong className="text-white/80">4 business hours</strong>{" "}
                during SAST hours. You can also reach us directly at{" "}
                <a
                  href="mailto:concierge@visiocorp.co"
                  className="text-emerald-400/80 hover:text-emerald-400 underline underline-offset-4"
                >
                  concierge@visiocorp.co
                </a>
                .
              </>
            ) : isSubscription ? (
              <>
                Your subscription is now <strong className="text-emerald-400/90">active</strong>.
                Entitlements have been granted to your email and the relevant Visio
                Auto Suite tools have unlocked. You can start using them immediately.
              </>
            ) : (
              <>
                Your payment has been received and your order is{" "}
                <strong className="text-emerald-400/90">fulfilled</strong>. Any
                included entitlements are now active on your email.
              </>
            )}
          </p>

          <div className="mt-6 border border-white/[0.08] bg-white/[0.02] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
              Reference
            </div>
            <div className="font-mono text-[14px] text-emerald-400/90 mt-1">
              {reference}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 border border-white/[0.08] bg-white/[0.02] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 hover:bg-white/[0.06] hover:text-white transition-colors"
            >
              Back to Visio Auto
            </Link>
            <Link
              href="/#chat"
              className="inline-flex items-center justify-center gap-2 border border-emerald-500/30 bg-emerald-500/[0.05] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400 hover:bg-emerald-500/[0.1] transition-colors"
            >
              <MessageCircle className="h-3 w-3" />
              Talk to Jess
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <p className="mt-6 font-mono text-[10px] text-white/25 text-center leading-relaxed">
            A receipt has been sent to the email on file. Questions?{" "}
            <a
              href="mailto:concierge@visiocorp.co"
              className="text-emerald-400/60 hover:text-emerald-400"
            >
              concierge@visiocorp.co
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ShopSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#020c07] flex items-center justify-center" />
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
