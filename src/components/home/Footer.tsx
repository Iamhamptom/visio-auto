"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { VisioLogoMark } from "@/components/landing/VisioLogo";
import { SUITE } from "@/lib/suite";

/**
 * Clean world-class footer.
 *
 * 4 columns: Product · Solutions · Company · Resources
 * Proper link hierarchy. No marketing noise. Legal at the bottom.
 */

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "How It Works", href: "/#how-it-works" },
      { label: "The Suite", href: "/#suite" },
      { label: "Pricing", href: "/pricing" },
      { label: "Visio Intelligence", href: "/intelligence" },
      { label: "Visio Concierge", href: "/concierge" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "For Volume Dealers", href: "/get-started?segment=volume" },
      { label: "For Premium Dealers", href: "/get-started?segment=premium" },
      { label: "For Luxury Dealers", href: "/get-started?segment=luxury" },
      { label: "For OEMs", href: "/intelligence" },
      { label: "For Banks", href: "/intelligence" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Meet Jess", href: "/about/jess" },
      { label: "Customers", href: "/customers" },
      { label: "Research", href: "/research" },
      { label: "Contact", href: "mailto:hello@visiocorp.co" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Intelligence Report", href: "/papers/intelligence-vol-1" },
      { label: "Security Whitepaper", href: "/papers/security" },
      { label: "Suite Overview", href: "/papers/suite-overview" },
      { label: "API Documentation", href: "/api/commerce/catalog" },
      { label: "Dashboard Login", href: "/dashboard" },
    ],
  },
];

export default function HomeFooter() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-[#020c07]">
      <div className="mx-auto max-w-6xl px-6 py-20">
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
              <VisioLogoMark size={32} />
              <span className="text-base font-light tracking-wide text-white/80">
                Visio Auto
              </span>
            </Link>
            <p className="mt-5 text-[13px] leading-relaxed text-white/40 max-w-xs">
              The AI platform South African car dealerships use to find qualified buyers,
              close more sales, and stay ahead of the market.
            </p>
            <div className="mt-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/25">
                Built in South Africa
              </span>
            </div>

            {/* Sibling deploys */}
            <div className="mt-8">
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30 mb-3">
                The Suite
              </div>
              <ul className="space-y-2">
                {SUITE.map((p) => (
                  <li key={p.key}>
                    <a
                      href={p.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12px] text-white/35 hover:text-emerald-400/80 transition-colors"
                    >
                      {p.shortName} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mb-5">
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-white/45 hover:text-white/80 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center gap-4 border-t border-white/[0.04] pt-8 md:flex-row md:justify-between">
          <div className="flex items-center gap-6">
            <a
              href="https://instagram.com/visiocorp"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-emerald-400 transition-colors"
            >
              @visiocorp
            </a>
            <Link
              href="/legal/privacy"
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-white/60 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/legal/terms"
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-white/60 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/legal/popia"
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-white/60 transition-colors"
            >
              POPIA
            </Link>
          </div>
          <p className="font-mono text-[10px] tracking-[0.15em] text-white/20">
            &copy; {new Date().getFullYear()} VisioCorp (Pty) Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
