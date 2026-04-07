"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { VisioLogoMark } from "@/components/landing/VisioLogo";

/**
 * World-class top navigation.
 *
 * 5 links + Sign in + primary CTA.
 * Clean, minimal, always accessible. Sticky on scroll with a subtle
 * backdrop-blur. Mobile menu slides in from the right.
 */

const NAV_LINKS = [
  { label: "Product", href: "/#product" },
  { label: "Pricing", href: "/pricing" },
  { label: "Intelligence", href: "/intelligence" },
  { label: "Research", href: "/research" },
  { label: "Customers", href: "/customers" },
];

export default function HomeNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "border-b border-white/[0.06] bg-[#030f0a]/90 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <VisioLogoMark size={28} />
            <span className="text-sm font-light tracking-wide text-white/90">
              Visio Auto
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/50 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/dashboard"
              className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/50 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/get-started"
              className="border border-emerald-500/40 bg-emerald-500/10 px-5 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white/60 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[#030f0a]/98 backdrop-blur-xl pt-20 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block font-mono text-xs uppercase tracking-[0.2em] text-white/70 hover:text-white py-2"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-6 flex flex-col gap-3 border-t border-white/[0.06] pt-6">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block font-mono text-xs uppercase tracking-[0.2em] text-white/60 py-3 text-center border border-white/[0.08]"
                >
                  Sign in
                </Link>
                <Link
                  href="/get-started"
                  onClick={() => setMobileOpen(false)}
                  className="block font-mono text-xs uppercase tracking-[0.2em] text-emerald-400 bg-emerald-500/10 border border-emerald-500/40 py-3 text-center"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
