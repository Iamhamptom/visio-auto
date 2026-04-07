"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { Sparkles, Plus, Zap } from "lucide-react";
import WindowFrame from "./WindowFrame";

const signalUniverse = [
  {
    category: "Lifecycle",
    color: "emerald",
    signals: [
      { name: "Turning 18", note: "First license eligibility" },
      { name: "Driver's License Issued", note: "First car window opens" },
      { name: "Provisional License", note: "Parents pre-shop" },
      { name: "License Renewal", note: "Often + car upgrade" },
      { name: "Graduation (Matric)", note: "First job, first car" },
      { name: "University Graduation", note: "Career launch" },
      { name: "First Job", note: "Salary verification" },
      { name: "Job Promotion", note: "Income jump" },
      { name: "Marriage", note: "Family vehicle need" },
      { name: "New Baby", note: "Upgrade to family car" },
      { name: "Divorce", note: "Often new vehicle" },
      { name: "Retirement", note: "Cash-out moment" },
    ],
  },
  {
    category: "Financial",
    color: "emerald",
    signals: [
      { name: "Lease Expiring", note: "90-day window" },
      { name: "Tax Refund Season", note: "Feb-Apr buying spike" },
      { name: "13th Cheque / Bonus", note: "Dec / Mar windows" },
      { name: "Salary Increase", note: "Disposable income up" },
      { name: "Insurance Write-off", note: "Forced replacement" },
      { name: "Vehicle Pre-Approval", note: "Bank partnerships" },
      { name: "Credit Score Improvement", note: "Court clearance" },
      { name: "Investment Top-up", note: "HNW signal" },
      { name: "Crypto Wallet Activity", note: "Wealth indicator" },
      { name: "Property Sale", note: "Cash on hand" },
      { name: "Inheritance Filing", note: "Public estate" },
      { name: "B-BBEE Rating Up", note: "Corporate buyer" },
    ],
  },
  {
    category: "Corporate",
    color: "emerald",
    signals: [
      { name: "CIPC New Business", note: "Live API" },
      { name: "Director Appointment", note: "JSE listings" },
      { name: "Funding Round Closed", note: "Press release scrape" },
      { name: "Office Relocation", note: "Address changes" },
      { name: "Mass Hiring Posts", note: "Fleet expansion" },
      { name: "B-BBEE Verification", note: "Empowerment pivot" },
      { name: "VAT Registration", note: "Crossing thresholds" },
      { name: "Annual Return Filing", note: "Growth indicators" },
      { name: "Insolvency Status Cleared", note: "Restart signal" },
      { name: "Tender Award Public", note: "Cash inflow" },
      { name: "Government Gazette", note: "Public sector buyer" },
      { name: "Listed Company SENS", note: "Capex announcements" },
    ],
  },
  {
    category: "Property",
    color: "emerald",
    signals: [
      { name: "Property Purchase", note: "Deeds Office" },
      { name: "Suburb Relocation", note: "Car-dependent area" },
      { name: "New Townhouse Move-in", note: "Parking allocation" },
      { name: "Bond Application", note: "Pre-approval phase" },
      { name: "Building Plan Approved", note: "Garage upgrade" },
      { name: "Sectional Title Levy", note: "Vehicle access" },
      { name: "First-Time Buyer Bond", note: "Life milestone" },
      { name: "Holiday Home Purchase", note: "Second car need" },
      { name: "Estate Living Move", note: "Brand affinity" },
      { name: "Inter-City Move", note: "New routes" },
      { name: "Smallholding Purchase", note: "Bakkie demand" },
      { name: "Coastal Move", note: "Weather-resistant" },
    ],
  },
  {
    category: "Behavioural",
    color: "emerald",
    signals: [
      { name: "AutoTrader Browsing", note: "Search depth" },
      { name: "Cars.co.za Saved Searches", note: "Active intent" },
      { name: "Test Drive Bookings", note: "Competitor dealers" },
      { name: "Trade-In Valuations", note: "Selling current" },
      { name: "Insurance Quote Requests", note: "Cross-shopping" },
      { name: "Finance Calculators", note: "Budget testing" },
      { name: "YouTube Review Watching", note: "Specific models" },
      { name: "Forum Comments", note: "Technical questions" },
      { name: "Marketplace Selling", note: "Selling old car" },
      { name: "Brand Page Engagement", note: "Aspirational" },
      { name: "Service Booking Drop", note: "Replacement coming" },
      { name: "Showroom Visits", note: "Geofencing" },
    ],
  },
  {
    category: "Social",
    color: "emerald",
    signals: [
      { name: "Public Comment Mining", note: "YouTube, Reddit, FB" },
      { name: "Instagram Story Tags", note: "Showroom check-ins" },
      { name: "TikTok Engagement", note: "Car content interaction" },
      { name: "LinkedIn Job Change", note: "Income/status shift" },
      { name: "Wedding Announcement", note: "Joint vehicle plan" },
      { name: "Baby Shower Posts", note: "Family car countdown" },
      { name: "Public Birthday Gifts", note: "Self-gift moments" },
      { name: "Anniversary Posts", note: "Milestone purchases" },
      { name: "Sports Event Posts", note: "Brand alignment" },
      { name: "Influencer Mentions", note: "Aspirational triggers" },
      { name: "Public WhatsApp Status", note: "Where legal" },
      { name: "Twitter / X Mentions", note: "Brand complaints" },
    ],
  },
  {
    category: "Macro",
    color: "emerald",
    signals: [
      { name: "Repo Rate Cut", note: "Finance becomes cheaper" },
      { name: "Fuel Price Drop", note: "Larger vehicles favoured" },
      { name: "Brand Recall Issued", note: "Switching opportunity" },
      { name: "New Model Launch", note: "Trade-up timing" },
      { name: "OEM Promo Period", note: "Price drops" },
      { name: "Tax Year End", note: "Section 24" },
      { name: "Budget Speech Day", note: "Tax change reactions" },
      { name: "Provincial Election", note: "Public sector buying" },
      { name: "Currency Move", note: "Import price shifts" },
      { name: "Insurance Premium Hikes", note: "Switching season" },
    ],
  },
];

const creativeStories = [
  {
    icon: Sparkles,
    title: "The CIPC Plug-In",
    body: "We have a live API integration with the Companies and Intellectual Property Commission. The moment a new SA business is registered, our agents trigger a sequence: company type, sector, founder profile, capital declared. Within 60 seconds, we know if you should be on their first pitch list.",
  },
  {
    icon: Zap,
    title: "Turning 18",
    body: "Most dealers wait for someone to walk in. We watch the calendar. When a parent's profile shows a child reaching license-eligible age, we surface them as a future buyer 6 months ahead. The parent often buys for the kid &mdash; or trades up themselves.",
  },
  {
    icon: Plus,
    title: "We Ship Signals Weekly",
    body: "Most platforms freeze their signal list at launch. We engineer new ones every week. If you tell Jess about a buying pattern you've noticed, we build a signal for it within 7 days &mdash; and every dealer on the platform benefits.",
  },
];

export default function SignalUniverse() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.05 });

  // Count total signals
  const totalSignals = signalUniverse.reduce((sum, c) => sum + c.signals.length, 0);

  return (
    <section id="signal-universe" className="relative py-32 bg-[#030f0a] overflow-hidden">
      {/* Network infographic — top center */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] z-0 opacity-15">
        <Image
          src="/generated/infographic-network.png"
          alt=""
          fill
          className="object-cover mix-blend-screen pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#030f0a]" />
      </div>
      <div className="absolute inset-0 bg-dots opacity-30 z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.05)_0%,transparent_60%)] z-0" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="section-label">The Signal Universe</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400/80 border border-emerald-500/30 bg-emerald-500/[0.06] px-2 py-0.5">
              {totalSignals}+ TRACKED &middot; INFINITE POTENTIAL
            </span>
          </div>
          <h2 className="mt-4 heading-xl max-w-4xl">
            We don&apos;t list signals.
            <br />
            We <span className="text-emerald-400">engineer them</span>.
          </h2>
          <div className="mt-6 flex items-start gap-3 max-w-2xl">
            <div className="mt-1.5 h-px w-8 bg-emerald-500/40 shrink-0" />
            <p className="text-[15px] leading-relaxed text-white/50">
              Most platforms ship a fixed list of signals and call it a day. Visio Auto
              ships <span className="text-emerald-400/80">new signals every week</span>.
              When the world changes, our agents change with it. When a dealer asks for
              something new, we build it. When Jess spots a new pattern, she adds it to
              the universe.
            </p>
          </div>
        </motion.div>

        {/* Creative engineering stories */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
          className="mt-12 grid gap-px md:grid-cols-3 bg-white/[0.04] border border-white/[0.06]"
        >
          {creativeStories.map((s) => (
            <motion.div
              key={s.title}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
              }}
              className="bg-[#030f0a] p-7"
            >
              <s.icon className="h-5 w-5 text-emerald-500/50 mb-4" />
              <h4 className="text-[14px] font-medium text-white/80 mb-2">{s.title}</h4>
              <p className="text-[12px] leading-relaxed text-white/35">{s.body}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* The Universe — full taxonomy */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-16"
        >
          <WindowFrame title="signal-universe.db" variant="terminal">
            <div className="p-8 md:p-10">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">
                {signalUniverse.map((cat, idx) => (
                  <motion.div
                    key={cat.category}
                    initial={{ opacity: 0, y: 12 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                  >
                    {/* Category header */}
                    <div className="border-b border-white/[0.06] pb-2 mb-4 flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-400/70">
                        {cat.category}
                      </span>
                      <span className="font-mono text-[10px] text-white/20">
                        {String(cat.signals.length).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Signal list */}
                    <ul className="space-y-2">
                      {cat.signals.map((sig) => (
                        <li key={sig.name} className="group">
                          <div className="flex items-baseline gap-2">
                            <div className="h-1 w-1 rounded-full bg-emerald-500/40 mt-1.5 shrink-0" />
                            <div className="flex-1">
                              <div className="text-[12px] text-white/55 group-hover:text-white/80 transition-colors">
                                {sig.name}
                              </div>
                              <div className="font-mono text-[10px] text-white/20 leading-snug">
                                {sig.note}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-12 pt-6 border-t border-white/[0.06] flex items-start justify-between flex-wrap gap-4">
                <p className="font-mono text-[11px] text-white/30 max-w-2xl leading-relaxed">
                  Showing {totalSignals} active signals across 7 categories. New signals
                  shipped weekly. All sources public and POPIA-compliant. Custom signal
                  engineering available for all dealership partners &mdash; free.
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/60">
                    Live &middot; updated this week
                  </span>
                </div>
              </div>
            </div>
          </WindowFrame>
        </motion.div>

        {/* Custom signal CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16"
        >
          <div className="border border-white/[0.06] bg-white/[0.02] p-8 md:p-10 grid lg:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-400/50">
                Bring Your Own Signal
              </span>
              <h3 className="mt-3 text-2xl font-extralight tracking-tight text-white max-w-2xl">
                See a pattern we&apos;re not tracking yet? Tell Jess.
              </h3>
              <p className="mt-3 text-[13px] text-white/40 max-w-2xl">
                Dealership partners can request a new signal at any time. If it&apos;s
                publicly sourceable and POPIA-compliant, our team ships it within 7 days
                &mdash; and every other dealer on the platform inherits it. We grow the
                universe together.
              </p>
            </div>
            <a
              href="/get-started"
              className="border border-emerald-500/30 bg-emerald-500/[0.05] px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400/80 hover:bg-emerald-500/[0.1] transition-colors whitespace-nowrap"
            >
              Request a Signal →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
