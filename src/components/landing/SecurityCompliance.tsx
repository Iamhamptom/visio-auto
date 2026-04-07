"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Lock, Shield, FileText, UserCheck, Database, Eye } from "lucide-react";

const safeguards = [
  {
    icon: Shield,
    title: "POPIA Compliant",
    description:
      "Registered Information Officer. Lawful basis documented for every signal source. Section 69 direct marketing rules followed.",
  },
  {
    icon: Lock,
    title: "Encrypted End-to-End",
    description:
      "All data encrypted at rest (AES-256) and in transit (TLS 1.3). Bank-grade infrastructure on Vercel + Supabase EU-West.",
  },
  {
    icon: Database,
    title: "Public Sources Only",
    description:
      "Every signal originates from public, legally accessible data. No purchased breach data. No illegal scraping. Verifiable lineage.",
  },
  {
    icon: UserCheck,
    title: "Data Subject Rights",
    description:
      "Right to access, object, and request deletion honoured within 7 days. Public unsubscribe portal. Information Officer contactable.",
  },
  {
    icon: Eye,
    title: "Auditable & Transparent",
    description:
      "Every signal trace logged. Every outreach recorded. Every data point cited. Full audit trail available to dealership partners.",
  },
  {
    icon: FileText,
    title: "Published Methodology",
    description:
      "Our methods are public. Read the Security & Privacy Whitepaper to see exactly how we operate &mdash; no black boxes, no hidden practices.",
  },
];

export default function SecurityCompliance() {
  return (
    <section id="security" className="relative py-32 bg-[#020c07] overflow-hidden">
      {/* Key fob accent — top right */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] z-0 opacity-20">
        <Image
          src="/generated/key-fob.png"
          alt=""
          fill
          className="object-cover mix-blend-screen pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-bl from-transparent to-[#020c07]" />
      </div>
      <div className="absolute inset-0 bg-grid opacity-20 z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.04)_0%,transparent_60%)] z-0" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="section-label">Security &amp; Privacy</span>
          <h2 className="mt-4 heading-xl max-w-4xl">
            How we earn the
            <br />
            <span className="text-emerald-400">trust</span> behind every lead.
          </h2>
          <div className="mt-6 flex items-start gap-3 max-w-2xl">
            <div className="mt-1.5 h-px w-8 bg-emerald-500/40 shrink-0" />
            <p className="text-[15px] leading-relaxed text-white/50">
              You can&apos;t build trust on lead lists alone. You build it on transparency,
              published methodology, legal compliance, and people-first principles.
              Here&apos;s how we operate &mdash; every detail public, every claim verifiable.
            </p>
          </div>
        </motion.div>

        {/* Safeguard grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          className="mt-16 grid gap-px md:grid-cols-2 lg:grid-cols-3 bg-white/[0.04] border border-white/[0.06]"
        >
          {safeguards.map((s) => (
            <motion.div
              key={s.title}
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
              <s.icon className="h-5 w-5 text-emerald-500/50 mb-4" />
              <h4 className="text-[14px] font-medium text-white/80 mb-2">
                {s.title}
              </h4>
              <p className="text-[12px] leading-relaxed text-white/35">
                {s.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Whitepaper CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16"
        >
          <div className="border border-white/[0.06] bg-white/[0.02] p-8 md:p-12 flex items-start gap-6 flex-wrap">
            <FileText className="h-8 w-8 text-emerald-500/50 shrink-0" />
            <div className="flex-1 min-w-[280px]">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-400/50">
                VRL-AUTO-002 &middot; Visio Research Labs
              </span>
              <h3 className="mt-2 text-2xl font-extralight tracking-tight text-white">
                Security &amp; Privacy Whitepaper
              </h3>
              <p className="mt-2 text-[13px] text-white/40 max-w-xl">
                Our complete methodology for ethical signal mining. POPIA compliance
                framework. Technical safeguards. Data subject rights process. Published
                by Visio Research Labs &mdash; reviewed annually.
              </p>
            </div>
            <a
              href="/papers/security"
              className="border border-emerald-500/30 bg-emerald-500/[0.05] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400/80 hover:bg-emerald-500/[0.1] transition-colors"
            >
              Read Whitepaper →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
