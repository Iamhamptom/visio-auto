"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VisioLogoMark } from "./VisioLogo";

const navLinks = [
  { label: "Suite", href: "#suite" },
  { label: "Platform", href: "#platform" },
  { label: "Signals", href: "#signal-universe" },
  { label: "Intelligence", href: "#intelligence" },
  { label: "Concierge", href: "#concierge" },
  { label: "Papers", href: "/papers/suite-overview" },
];

export default function Navbar() {
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
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className={`fixed top-0 z-50 w-full transition-all duration-500 ${
          scrolled
            ? "border-b border-white/[0.06] bg-[#030f0a]/90 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <VisioLogoMark size={28} />
            <span className="text-sm font-light tracking-wide text-white/80">
              Visio Auto
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/40 transition-colors hover:text-white/80"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden items-center gap-3 md:flex">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-[12px] font-mono uppercase tracking-wider text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
              >
                Dashboard
              </Button>
            </Link>
            <Link href="/get-started">
              <Button
                size="sm"
                className="bg-emerald-600/90 text-white text-[12px] font-mono uppercase tracking-wider hover:bg-emerald-500 h-8 px-4"
              >
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-white/40 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[#030f0a]/98 backdrop-blur-xl pt-20 px-6 md:hidden"
          >
            <div className="flex flex-col gap-8">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="font-mono text-sm uppercase tracking-[0.2em] text-white/60 hover:text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </motion.a>
              ))}
              <div className="mt-4 flex flex-col gap-3 border-t border-white/[0.06] pt-6">
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full border-white/[0.08] text-white/60 bg-transparent"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Link href="/get-started" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-500">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
