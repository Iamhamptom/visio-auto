"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Mic, MessageSquare, FileText, Sparkles } from "lucide-react";
import { JessAvatar } from "./JessAvatar";
import WindowFrame from "./WindowFrame";

const strategySteps = [
  {
    step: "01",
    icon: Mic,
    title: "Voice-led discovery",
    description:
      "Jess interviews your dealership team via voice (ElevenLabs powered). She asks about your goals, your stock, your competition, your blockers. 20 minutes, conversational, no forms.",
  },
  {
    step: "02",
    icon: FileText,
    title: "Industry mapping",
    description:
      "Jess pulls everything Visio Intelligence has on your segment, region, brand mix, and competitors. Then asks what additional data points you want her to track for you.",
  },
  {
    step: "03",
    icon: Sparkles,
    title: "Strategy generation",
    description:
      "Powered by the Claude SDK, Jess generates a complete digital strategy: lead targets, channel mix, content plan, signal priorities, conversion roadmap. Editable, exportable, yours.",
  },
  {
    step: "04",
    icon: MessageSquare,
    title: "Execution handoff",
    description:
      "Approved strategies trigger your agent automatically. Lead targets become signal queries. Channel plans become outreach campaigns. WhatsApp, email, calendar &mdash; all live.",
  },
];

export default function StrategyAgent() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section id="strategy" className="relative py-32 bg-[#020c07]">
      <div className="absolute inset-0 bg-grid opacity-25" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.04)_0%,transparent_60%)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="section-label">Strategy Generator</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400/80 border border-emerald-500/30 bg-emerald-500/[0.06] px-2 py-0.5">
              POWERED BY CLAUDE SDK
            </span>
          </div>
          <h2 className="mt-4 heading-xl max-w-4xl">
            Build your dealership&apos;s
            <br />
            <span className="text-emerald-400">digital strategy</span> with Jess.
          </h2>
          <div className="mt-6 flex items-start gap-3 max-w-2xl">
            <div className="mt-1.5 h-px w-8 bg-emerald-500/40 shrink-0" />
            <p className="text-[15px] leading-relaxed text-white/50">
              Most dealers don&apos;t have a data team. So we built one. Jess uses Visio Intelligence and the same agentic architecture we built for Netcare Health OS to design and execute your full digital strategy &mdash; in your voice, on your platform, owned by you.
            </p>
          </div>
        </motion.div>

        {/* Strategy session window */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-16"
        >
          <WindowFrame title="strategy-session.live" variant="terminal">
            <div className="grid lg:grid-cols-[auto_1fr] gap-8 p-8 md:p-10 scanlines relative">
              <div className="flex flex-col items-center lg:items-start gap-3">
                <JessAvatar size={72} />
                <div className="text-center lg:text-left">
                  <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400/60">
                    Jess &middot; Strategy Agent
                  </div>
                  <div className="font-mono text-[10px] text-white/20 mt-1">
                    Voice + Text &middot; Live
                  </div>
                </div>
              </div>

              <div className="font-mono text-[12px] leading-relaxed">
                <div className="text-emerald-500/40 mb-3">
                  &gt; Strategy session started for: Sandton Premium Motors
                </div>

                <div className="space-y-3">
                  <div className="text-white/30">
                    <span className="text-emerald-400/60">[Jess 09:14]</span> Hi Sarah. I&apos;ve already pulled your inventory, your brand mix, and the last 90 days of leads. Before we dive in &mdash; what&apos;s the one number you most want to move this quarter?
                  </div>
                  <div className="text-white/40">
                    <span className="text-white/40">[Sarah 09:14]</span> We need to move 15 used BMWs in inventory aging past 90 days.
                  </div>
                  <div className="text-white/30">
                    <span className="text-emerald-400/60">[Jess 09:14]</span> Got it. I&apos;m looking at lease expiry signals across Gauteng matched to BMW 3-series and 5-series buyers. I see 47 high-intent prospects right now. Want me to draft a 4-week campaign that prioritises this segment?
                  </div>
                  <div className="text-white/40">
                    <span className="text-white/40">[Sarah 09:14]</span> Yes, and add the BMW launch event we&apos;re hosting on the 22nd.
                  </div>
                  <div className="text-white/30">
                    <span className="text-emerald-400/60">[Jess 09:14]</span> Done. Strategy draft will be on your dashboard in 2 minutes. I&apos;ll also brief the sales floor on WhatsApp before each appointment.
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <span className="text-emerald-500/40">&gt;</span>
                  <span className="w-2 h-4 bg-emerald-500/50 animate-pulse" />
                </div>
              </div>
            </div>
          </WindowFrame>
        </motion.div>

        {/* Steps */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
          className="mt-16 grid gap-px md:grid-cols-2 lg:grid-cols-4 bg-white/[0.04] border border-white/[0.06]"
        >
          {strategySteps.map((s) => (
            <motion.div
              key={s.step}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
                },
              }}
              className="bg-[#020c07] p-7 hover:bg-white/[0.02] transition-colors"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-500/30">
                Step {s.step}
              </span>
              <s.icon className="mt-5 h-5 w-5 text-emerald-500/50" />
              <h4 className="mt-4 text-[14px] font-medium text-white/80">
                {s.title}
              </h4>
              <p className="mt-2 text-[12px] leading-relaxed text-white/35">
                {s.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
