"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Why Visio Auto", href: "#why-visio-auto" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
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
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl shadow-lg shadow-black/20"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 transition-transform group-hover:scale-110">
              <Car className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">
              Visio Auto
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-zinc-400 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                Dashboard
              </Button>
            </Link>
            <Link href="/get-started">
              <Button
                size="sm"
                className="bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20"
              >
                Start Free Trial
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-zinc-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-40 bg-zinc-950/98 backdrop-blur-xl pt-20 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-2xl font-medium text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </motion.a>
              ))}
              <div className="mt-4 flex flex-col gap-3">
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full border-zinc-700 text-zinc-300"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Link href="/get-started" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-500">
                    Start Free Trial
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
