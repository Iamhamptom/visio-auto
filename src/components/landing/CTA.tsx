"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CTA() {
  return (
    <section className="relative border-t border-zinc-800/50 py-28 overflow-hidden">
      {/* Emerald gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-zinc-950 to-emerald-950/20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-emerald-500/30"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-zinc-900/80 to-zinc-950/90 p-12 md:p-16 backdrop-blur-sm shadow-2xl shadow-emerald-500/5"
        >
          <div className="flex justify-center mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
              <Sparkles className="h-7 w-7 text-emerald-400" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white md:text-4xl tracking-tight">
            Start your free trial — see signals
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              in your area within 24 hours
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-lg text-zinc-400 text-lg">
            Join 329+ South African dealerships using AI to find their next
            buyer. No credit card required. Free tier forever.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/get-started">
              <Button
                size="lg"
                className="h-14 gap-2.5 bg-emerald-600 px-10 text-base font-semibold text-white hover:bg-emerald-500 shadow-xl shadow-emerald-500/25 transition-all hover:shadow-emerald-500/35 hover:scale-[1.02]"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-zinc-500">
            No credit card required. Cancel anytime. 4x ROI guarantee.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
