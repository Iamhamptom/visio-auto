import Link from "next/link";
import type { Metadata } from "next";
import { VisioLogoMark } from "@/components/landing/VisioLogo";
import { ArrowLeft } from "lucide-react";
import LuxuryConcierge from "@/components/landing/LuxuryConcierge";

export const metadata: Metadata = {
  title: "Visio Concierge — UHNW African Luxury Car Delivery | Visio Auto",
  description:
    "White-glove concierge for high-net-worth buyers across Lagos, Lubumbashi, Luanda, Nairobi, Accra and Abidjan. Multilingual, bonded escrow, end-to-end logistics from Sandton to your residence.",
};

export default function ConciergePage() {
  return (
    <div className="min-h-screen bg-[#020c07] text-white/80">
      {/* Header */}
      <header className="border-b border-white/[0.06] sticky top-0 z-40 bg-[#020c07]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <VisioLogoMark size={24} />
            <span className="text-sm font-light tracking-wide text-white/80">Visio Auto</span>
            <span className="text-white/20 mx-1">/</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/60">
              Concierge
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Home
          </Link>
        </div>
      </header>

      <LuxuryConcierge />

      <footer className="border-t border-white/[0.06] py-12">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/30">
            Visio Concierge &middot; UHNW African Luxury Mobility
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400/60 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Visio Auto
          </Link>
        </div>
      </footer>
    </div>
  );
}
