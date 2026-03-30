"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Car, BarChart3 } from "lucide-react";

const columns = [
  {
    title: "Product",
    links: [
      { label: "How It Works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
      { label: "Signal Types", href: "#signals" },
      { label: "Integrations", href: "#" },
      { label: "API Docs", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About VisioCorp", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Press", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "POPIA Compliance", href: "#" },
      { label: "Cookie Policy", href: "#" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "WhatsApp", href: "#" },
      { label: "LinkedIn", href: "#" },
      { label: "Twitter / X", href: "#" },
      { label: "Instagram", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid gap-12 md:grid-cols-6"
        >
          {/* Brand column */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
                <Car className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">
                Visio Auto
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-zinc-500 max-w-xs">
              South Africa&#39;s first AI-powered dealership intelligence
              platform. Finding car buyers before they find you.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-zinc-600">
              <span>Powered by</span>
              <span className="font-medium text-zinc-400">VisioCorp AI</span>
              <span className="text-zinc-700">+</span>
              <span className="font-medium text-zinc-400">Tony Duardo</span>
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-zinc-300 mb-4">
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
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
        <div className="mt-16 flex flex-col items-center gap-4 border-t border-zinc-800/50 pt-8 md:flex-row md:justify-between">
          <div className="flex items-center gap-1.5 text-xs text-zinc-600">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>South Africa&#39;s #1 AI Auto Lead Platform</span>
          </div>
          <p className="text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} VisioCorp (Pty) Ltd. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
