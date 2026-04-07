import Link from "next/link";
import type { Metadata } from "next";
import { VisioLogoMark } from "@/components/landing/VisioLogo";
import { JessAvatar } from "@/components/landing/JessAvatar";
import LanguageAdapter from "@/components/landing/LanguageAdapter";
import StrategyAgent from "@/components/landing/StrategyAgent";
import { ArrowLeft, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Meet Jess — AI Sales Agent for Visio Auto",
  description:
    "Jess is the AI sales agent who runs the Visio Auto platform. Seven languages, 28 tools, available 24/7 in the chat widget. Watch her close a deal in real time.",
};

export default function JessPage() {
  return (
    <div className="min-h-screen bg-[#020c07] text-white/80">
      <header className="border-b border-white/[0.06] sticky top-0 z-40 bg-[#020c07]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <VisioLogoMark size={24} />
            <span className="text-sm font-light tracking-wide text-white/80">Visio Auto</span>
            <span className="text-white/20 mx-1">/</span>
            <Link href="/about" className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white/70">
              About
            </Link>
            <span className="text-white/20 mx-1">/</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/60">
              Jess
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

      {/* Hero */}
      <section className="relative py-24 border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06)_0%,transparent_60%)]" />

        <div className="relative mx-auto max-w-5xl px-6">
          <div className="grid lg:grid-cols-[auto_1fr] gap-10 items-start">
            <JessAvatar size={120} />
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400/70 border border-emerald-500/30 bg-emerald-500/[0.05] px-3 py-1.5">
                AI Sales Agent
              </span>
              <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-extralight leading-[1.1] tracking-tight text-white">
                Meet Jess.
              </h1>
              <p className="mt-6 text-[15px] leading-relaxed text-white/50 max-w-2xl">
                Jess is the AI sales agent who runs the Visio Auto platform. She speaks seven
                languages. She knows every dealer in South Africa. She can search inventory,
                score leads, book test drives, explain finance, pre-qualify buyers, and close
                sales in chat. She is available 24/7 in the chat widget on every page.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <div className="inline-flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/[0.05] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400/80">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online Now
                </div>
                <p className="font-mono text-[10px] text-white/30">
                  Click the emerald pill bottom-right on any page
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Jess can do */}
      <section className="py-20 border-b border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-6">
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/40">
            Capabilities
          </span>
          <h2 className="mt-3 text-3xl font-extralight tracking-tight text-white">
            28 tools. One chat. Zero handoffs.
          </h2>
          <p className="mt-4 text-[14px] text-white/40 max-w-2xl">
            Jess is not a chatbot. She is an action-taking agent with a real SDK, real tool
            routing, and real access to the Visio Auto platform. She does not say &ldquo;let me
            connect you to someone&rdquo; — she just does the thing.
          </p>

          <div className="mt-12 grid gap-px md:grid-cols-2 lg:grid-cols-4 bg-white/[0.04] border border-white/[0.06]">
            {[
              { t: "Find buyers", d: "Searches 84+ signal types across SA" },
              { t: "Score leads", d: "0-100 intent + Reg 23A affordability" },
              { t: "Book test drives", d: "Direct to dealer calendars" },
              { t: "Explain finance", d: "4-bank rate compare, no credit pull" },
              { t: "Pre-qualify", d: "Visio Approve in 90 seconds" },
              { t: "Order Inspect reports", d: "R49 for private sellers, R299/mo dealers" },
              { t: "Start subscriptions", d: "Takes payment via Yoco in chat" },
              { t: "Speak 7 languages", d: "EN/FR/PT/SW/AR/Lingala/Pidgin" },
            ].map((cap) => (
              <div key={cap.t} className="bg-[#020c07] p-5">
                <h3 className="text-[13px] font-medium text-white/80">{cap.t}</h3>
                <p className="mt-1.5 text-[11px] text-white/35 leading-relaxed">{cap.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-language */}
      <section className="py-20 border-b border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-6">
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/40">
            Multilingual
          </span>
          <h2 className="mt-3 text-3xl font-extralight tracking-tight text-white">
            Jess speaks the language of the deal.
          </h2>
          <p className="mt-4 text-[14px] text-white/40 max-w-2xl">
            For wealthy African buyers in Lagos, Lubumbashi, Luanda, Abidjan, Casablanca or
            Cairo, the language of the first message is the trust signal that opens the deal.
          </p>
          <div className="mt-10 max-w-2xl">
            <LanguageAdapter />
          </div>
        </div>
      </section>

      {/* Strategy Agent demo */}
      <StrategyAgent />

      {/* CTA */}
      <section className="py-20 border-t border-white/[0.06]">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-extralight tracking-tight text-white">
            Talk to Jess now.
          </h2>
          <p className="mt-4 text-[14px] text-white/40 max-w-xl mx-auto">
            Click the emerald pill in the bottom-right of any page. She will greet you, ask what
            you need, and either close the deal or route you to the right tool in the suite.
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/[0.05] px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400/80 hover:bg-emerald-500/[0.1] transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Open Chat on Home
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-12">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400/60 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Visio Auto
          </Link>
        </div>
      </footer>
    </div>
  );
}
