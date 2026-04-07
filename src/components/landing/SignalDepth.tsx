"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MessageSquare, ShieldCheck, Heart, Search } from "lucide-react";
import { JessAvatar } from "./JessAvatar";
import WindowFrame from "./WindowFrame";

const philosophyPoints = [
  {
    icon: Heart,
    title: "People-First",
    description:
      "Behind every signal is a person. We treat their information with the same care we'd want our own treated. No spam. No surprises. No betrayal of trust.",
  },
  {
    icon: ShieldCheck,
    title: "Lawfully Sourced",
    description:
      "Every signal we track comes from public, legally accessible sources. CIPC registrations, public deeds, news articles, public social posts. Nothing scraped illegally. Nothing bought from breaches.",
  },
  {
    icon: Search,
    title: "Intelligently Connected",
    description:
      "Our AI doesn't just find signals — it connects them. A job promotion + a property purchase + a comment about needing a family car = a buyer ready to walk into a showroom.",
  },
];

export default function SignalDepth() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section id="signals" className="relative py-32 bg-[#020c07]">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.04)_0%,transparent_60%)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="section-label">Signal Depth</span>
          <h2 className="mt-4 heading-xl max-w-3xl">
            How deep our agents go
            <br />
            to find <span className="text-emerald-400">your buyer</span>.
          </h2>
          <div className="mt-6 flex items-start gap-3 max-w-2xl">
            <div className="mt-1.5 h-px w-8 bg-emerald-500/40 shrink-0" />
            <p className="text-[15px] leading-relaxed text-white/50">
              Anyone can list life events. What makes Visio Auto different is how
              <span className="text-emerald-400/90"> deep</span> our agents go to
              find the buyer behind the signal &mdash; and how
              <span className="text-emerald-400/90"> safely</span> we do it.
            </p>
          </div>
        </motion.div>

        {/* Hero Story — The Comment Section Find */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-16"
        >
          <WindowFrame title="case-study-001.txt" variant="terminal">
            <div className="grid lg:grid-cols-[auto_1fr] gap-8 p-8 md:p-10 scanlines relative">
              {/* Jess avatar with note */}
              <div className="flex flex-col items-center lg:items-start gap-3">
                <JessAvatar size={80} />
                <div className="text-center lg:text-left">
                  <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400/60">
                    Found by Jess
                  </div>
                  <div className="font-mono text-[10px] text-white/20 mt-1">
                    March 14, 2026 &middot; 02:47 SAST
                  </div>
                </div>
              </div>

              {/* Story */}
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-500/40">
                  Case Study
                </span>
                <h3 className="mt-3 text-2xl md:text-3xl font-extralight tracking-tight text-white leading-tight">
                  The comment that found a Porsche buyer.
                </h3>

                <div className="mt-6 space-y-4 text-[14px] leading-relaxed text-white/55">
                  <p>
                    On a Tuesday morning, our agent Jess was monitoring a public
                    YouTube comment section under a video reviewing a 2019 Porsche
                    911 GT3 RS &mdash; one of fewer than 30 in South Africa.
                  </p>
                  <p>
                    A user left a comment asking technical questions about
                    aftermarket exhaust compatibility, mentioning he&apos;d just
                    sold his Cayman GT4 and was &ldquo;ready to step up if I can
                    find one in white.&rdquo;
                  </p>
                  <p>
                    Jess connected three dots no human had time to chase:
                    <br />
                    <span className="text-white/40 font-mono text-[12px]">
                      &mdash; The commenter&apos;s name + a public property record showing a R28M Sandhurst purchase 6 months prior.
                      <br />
                      &mdash; A LinkedIn profile showing recent C-suite appointment at a JSE-listed company.
                      <br />
                      &mdash; A public Instagram post from his wife celebrating a milestone anniversary &mdash; the kind of moment people buy themselves milestone cars for.
                    </span>
                  </p>
                  <p className="text-emerald-400/80">
                    Within 90 seconds, Jess delivered the lead to a Cape Town Porsche Centre with full context, intent score (94/100), and a suggested approach. The dealer placed a discreet call that afternoon.
                  </p>
                  <p className="font-mono text-[12px] text-white/30 italic">
                    The 911 GT3 RS sold three days later. A R5.2M sale that started in a YouTube comment section.
                  </p>
                </div>

                {/* Disclaimer */}
                <div className="mt-8 border-l-[2px] border-emerald-500/30 pl-4 py-1">
                  <p className="text-[11px] text-white/30 leading-relaxed">
                    <span className="text-emerald-400/60">Note:</span> All identifying details have been anonymized. This case study reflects Visio Auto&apos;s methodology, not a specific person. All data sources used were public and legally accessible. POPIA compliance verified by our Information Officer. Read our methodology in the{" "}
                    <a href="/papers/security" className="text-emerald-400/80 hover:text-emerald-400 underline underline-offset-4">
                      Security &amp; Privacy Whitepaper
                    </a>.
                  </p>
                </div>
              </div>
            </div>
          </WindowFrame>
        </motion.div>

        {/* Philosophy — 3 pillars */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
          className="mt-20"
        >
          <div className="text-center mb-12">
            <span className="section-label">Our Philosophy</span>
            <h3 className="mt-4 heading-md">
              People-first. <span className="text-emerald-400">Always.</span>
            </h3>
          </div>

          <div className="grid gap-px md:grid-cols-3 bg-white/[0.04] border border-white/[0.06]">
            {philosophyPoints.map((point) => (
              <motion.div
                key={point.title}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
                  },
                }}
                className="bg-[#020c07] p-8 hover:bg-white/[0.02] transition-colors"
              >
                <point.icon className="h-5 w-5 text-emerald-500/50 mb-5" />
                <h4 className="text-[15px] font-medium text-white/80 mb-2">
                  {point.title}
                </h4>
                <p className="text-[13px] leading-relaxed text-white/35">
                  {point.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stat strip — depth, not count */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 border border-white/[0.06] divide-x divide-white/[0.06]"
        >
          {[
            { value: "84+", label: "Active Signals", detail: "New signals shipped weekly" },
            { value: "87", label: "Data Points", detail: "Connected per qualified lead" },
            { value: "100%", label: "Public Sources", detail: "Nothing scraped illegally" },
            { value: "POPIA", label: "Compliant", detail: "Information Officer registered" },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.02] px-5 py-6">
              <div className="font-mono text-2xl font-extralight text-emerald-400">
                {s.value}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mt-1">
                {s.label}
              </div>
              <p className="text-[11px] text-white/25 mt-2 leading-relaxed">
                {s.detail}
              </p>
            </div>
          ))}
        </motion.div>

        {/* CTA to security paper */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 text-center"
        >
          <a
            href="/papers/security"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400/60 hover:text-emerald-400 transition-colors border-b border-emerald-500/20 pb-1"
          >
            Read the full Security &amp; Privacy Whitepaper →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
