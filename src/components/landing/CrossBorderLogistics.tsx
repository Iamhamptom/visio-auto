"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Anchor, Truck, ShieldCheck, FileCheck } from "lucide-react";

const stages = [
  {
    icon: FileCheck,
    code: "01",
    title: "Discovery & Match",
    duration: "Day 0",
    description:
      "Buyer briefs Jess in their language. She queries SA premium dealer inventory across Daytona, Pharoah, Crown, Sandown, and the rest. Vehicle matched to spec, condition graded, video walkthrough delivered.",
  },
  {
    icon: ShieldCheck,
    code: "02",
    title: "Inspection & Escrow",
    duration: "Day 1-3",
    description:
      "Independent third-party inspection (Dekra). Letter of credit or escrow account opened with a bonded SA bank. Buyer wires deposit to escrow — never to the dealer directly. Trust verified before any movement.",
  },
  {
    icon: Anchor,
    code: "03",
    title: "Export & Sail",
    duration: "Day 4-21",
    description:
      "SARS Customs SAD500 export declaration. NaTIS deregistration. DA 187 bonded ex-warehouse. SC-CF-55 acquittal pack. Loaded at Durban TPT (520k unit/year capacity) onto Höegh / Wallenius / Grimaldi / NYK RoRo carrier. Marine cargo insured at full value via ICC(A).",
  },
  {
    icon: Truck,
    code: "04",
    title: "Port to Driveway",
    duration: "Day 22-30",
    description:
      "Discharge at destination port (Apapa for Lagos, Mombasa for Kenya, Luanda for Angola, Walvis Bay → overland for DRC Katanga). Local broker handles customs duty payment, registration, and white-glove handover at the buyer's preferred location.",
  },
];

export default function CrossBorderLogistics() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <div ref={ref} className="border border-white/[0.06] bg-white/[0.02]">
      {/* Header */}
      <div className="border-b border-white/[0.06] px-8 py-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-400/60">
            Cross-Border Flow
          </span>
          <h4 className="mt-1 text-xl font-extralight text-white">
            Sandton showroom → your driveway in <span className="text-emerald-400">~30 days</span>
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/60">
            Concierge managed end-to-end
          </span>
        </div>
      </div>

      {/* Stages */}
      <div className="grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">
        {stages.map((stage, i) => (
          <motion.div
            key={stage.code}
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.6,
              delay: i * 0.15,
              ease: [0.16, 1, 0.3, 1] as const,
            }}
            className="p-7 hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-baseline justify-between mb-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-500/40">
                Stage {stage.code}
              </span>
              <span className="font-mono text-[10px] text-white/25">
                {stage.duration}
              </span>
            </div>
            <stage.icon className="h-5 w-5 text-emerald-500/50 mb-4" />
            <h5 className="text-[14px] font-medium text-white/80 mb-2">
              {stage.title}
            </h5>
            <p className="text-[12px] leading-relaxed text-white/35">
              {stage.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Footer disclaimer */}
      <div className="border-t border-white/[0.06] px-8 py-4">
        <p className="font-mono text-[10px] text-white/25 leading-relaxed">
          Every stage logged. Every payment via bonded escrow. Marine cargo insured to full
          declared value via Bryte / Hollard / Lloyds. Concierge available 24/7 throughout
          transit on WhatsApp in your preferred language.
        </p>
      </div>
    </div>
  );
}
