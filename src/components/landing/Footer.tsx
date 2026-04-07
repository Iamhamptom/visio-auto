"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { VisioLogoMark } from "./VisioLogo";
import { SUITE } from "@/lib/suite";

const columns = [
  {
    title: "The Suite",
    links: SUITE.map((p) => ({
      label: p.shortName,
      href: p.liveUrl,
      external: true,
    })),
  },
  {
    title: "Platform",
    links: [
      { label: "Signal Universe", href: "#signal-universe" },
      { label: "Visio Intelligence", href: "#intelligence" },
      { label: "Concierge", href: "#concierge" },
      { label: "Papers", href: "/papers/suite-overview" },
      { label: "API", href: "/api/intelligence/q1-2026" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About VisioCorp", href: "/why-visio-auto" },
      { label: "Careers", href: "/why-visio-auto" },
      { label: "Blog", href: "/why-visio-auto" },
      { label: "Contact", href: "/get-quote" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Terms of Service", href: "/legal/terms" },
      { label: "POPIA Compliance", href: "/legal/popia" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Instagram", href: "https://instagram.com/visiocorp" },
      { label: "LinkedIn", href: "https://linkedin.com/company/visiocorp" },
      { label: "X / Twitter", href: "https://x.com/visiocorp" },
      { label: "WhatsApp", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#020c07]">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid gap-12 md:grid-cols-6"
        >
          {/* Brand column */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <VisioLogoMark size={28} />
              <span className="text-sm font-light tracking-wide text-white/80">
                Visio Auto
              </span>
            </Link>
            <p className="mt-5 text-[13px] leading-relaxed text-white/30 max-w-xs">
              South Africa&apos;s first AI-powered automotive intelligence platform.
              An autonomous agent that finds, qualifies, and delivers car buyers
              to your sales team.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/15">
                A VisioCorp product
              </span>
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30 mb-5">
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => {
                  const isExternal = "external" in link && link.external;
                  return (
                    <li key={link.label}>
                      {isExternal ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[13px] text-white/25 hover:text-emerald-400/70 transition-colors"
                        >
                          {link.label} ↗
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-[13px] text-white/25 hover:text-white/60 transition-colors"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </motion.div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center gap-4 border-t border-white/[0.04] pt-8 md:flex-row md:justify-between">
          <span className="font-mono text-[10px] tracking-[0.15em] text-white/15">
            @visiocorp
          </span>
          <p className="font-mono text-[10px] tracking-[0.15em] text-white/15">
            &copy; {new Date().getFullYear()} VisioCorp (Pty) Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
