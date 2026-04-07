"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CTA() {
  return (
    <section className="relative py-32 overflow-hidden bg-[#030f0a]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06)_0%,transparent_60%)]" />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="border border-white/[0.06] bg-white/[0.02] p-12 md:p-16"
        >
          <span className="section-label">Get Started</span>

          <h2 className="mt-6 heading-lg">
            See signals in your area
            <br />
            <span className="text-emerald-400">within 24 hours</span>.
          </h2>

          <p className="mx-auto mt-5 max-w-md text-[15px] text-white/40">
            Deploy your AI sales agent in minutes. 23 predictive signals,
            personalised outreach, and WhatsApp delivery. No credit card required.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/get-started">
              <Button
                size="lg"
                className="h-12 gap-2.5 bg-emerald-600 px-8 text-sm font-medium text-white hover:bg-emerald-500 transition-all"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/get-quote">
              <Button
                variant="outline"
                size="lg"
                className="h-12 border-white/[0.08] bg-white/[0.02] px-8 text-sm text-white/60 hover:bg-white/[0.06] hover:text-white transition-all"
              >
                Request a Quote
              </Button>
            </Link>
          </div>

          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-white/20">
            No credit card required &middot; Cancel anytime &middot; 4x ROI guarantee
          </p>
        </motion.div>
      </div>
    </section>
  );
}
