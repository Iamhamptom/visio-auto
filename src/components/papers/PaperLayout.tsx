"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { VisioLogoMark } from "@/components/landing/VisioLogo";

interface PaperLayoutProps {
  paperNumber: string;
  title: string;
  subtitle?: string;
  publishDate: string;
  authors: string;
  category: string;
  children: ReactNode;
}

/**
 * VRL-style research paper layout.
 * Inspired by the Netcare HealthOS VRL-001 page.
 * Reading-focused, dense, cited, sharable.
 */
export default function PaperLayout({
  paperNumber,
  title,
  subtitle,
  publishDate,
  authors,
  category,
  children,
}: PaperLayoutProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <div className="min-h-screen bg-[#020c07] text-white/80">
      {/* Reading progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-emerald-500/60 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Header */}
      <header className="border-b border-white/[0.06] bg-[#020c07]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto max-w-4xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <VisioLogoMark size={24} />
            <span className="text-[13px] font-light tracking-wide text-white/70">
              Visio Auto
            </span>
            <span className="text-white/20 mx-1">/</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/60">
              VRL Papers
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Visio Auto
          </Link>
        </div>
      </header>

      {/* Hero / metadata */}
      <section className="relative bg-[#020c07] border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.04)_0%,transparent_60%)]" />

        <div className="relative mx-auto max-w-4xl px-6 py-24">
          {/* Paper label */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-3"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400/70 border border-emerald-500/30 bg-emerald-500/[0.05] px-3 py-1.5">
              {paperNumber}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/30">
              {category}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 text-4xl md:text-5xl lg:text-6xl font-extralight leading-[1.1] tracking-tight text-white"
          >
            {title}
          </motion.h1>

          {/* Subtitle */}
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 text-xl font-extralight text-white/50 max-w-2xl leading-relaxed"
            >
              {subtitle}
            </motion.p>
          )}

          {/* Metadata bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 border border-white/[0.06] divide-x divide-white/[0.06]"
          >
            <div className="px-5 py-4 bg-white/[0.02]">
              <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/30">
                Published
              </div>
              <div className="font-mono text-[12px] text-white/70 mt-1.5">
                {publishDate}
              </div>
            </div>
            <div className="px-5 py-4 bg-white/[0.02]">
              <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/30">
                Authors
              </div>
              <div className="font-mono text-[12px] text-white/70 mt-1.5">
                {authors}
              </div>
            </div>
            <div className="px-5 py-4 bg-white/[0.02]">
              <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/30">
                Publisher
              </div>
              <div className="font-mono text-[12px] text-white/70 mt-1.5">
                Visio Research Labs
              </div>
            </div>
            <div className="px-5 py-4 bg-white/[0.02]">
              <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/30">
                License
              </div>
              <div className="font-mono text-[12px] text-emerald-400/70 mt-1.5">
                CC BY 4.0
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <article className="relative mx-auto max-w-3xl px-6 py-20">
        <div className="paper-content">
          {children}
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#020c07] mt-20">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <VisioLogoMark size={24} />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
                Visio Research Labs
              </span>
            </div>
            <p className="font-mono text-[10px] tracking-[0.15em] text-white/15">
              &copy; {new Date().getFullYear()} VisioCorp (Pty) Ltd. CC BY 4.0
            </p>
          </div>
        </div>
      </footer>

      {/* Paper content styling */}
      <style jsx global>{`
        .paper-content h2 {
          @apply text-3xl font-extralight tracking-tight text-white mt-16 mb-6;
        }
        .paper-content h3 {
          @apply text-xl font-extralight tracking-tight text-white/90 mt-12 mb-4;
        }
        .paper-content h4 {
          @apply text-base font-medium text-emerald-400/80 mt-8 mb-3 uppercase tracking-wider;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.2em;
        }
        .paper-content p {
          @apply text-[15px] leading-[1.8] text-white/60 mb-5;
        }
        .paper-content ul, .paper-content ol {
          @apply text-[15px] leading-[1.8] text-white/60 mb-5 ml-6 space-y-2;
        }
        .paper-content ul {
          list-style: none;
        }
        .paper-content ul li::before {
          content: "—";
          @apply text-emerald-500/40 mr-3;
        }
        .paper-content ol {
          list-style: decimal;
        }
        .paper-content blockquote {
          @apply border-l-[3px] border-l-emerald-500/60 bg-white/[0.02] px-6 py-4 my-6 text-[15px] leading-relaxed text-white/55 italic;
        }
        .paper-content code {
          @apply font-mono text-[12px] text-emerald-400/80 bg-white/[0.04] px-1.5 py-0.5 rounded-sm;
        }
        .paper-content a {
          @apply text-emerald-400/80 hover:text-emerald-400 underline underline-offset-4;
        }
        .paper-content strong {
          @apply text-white/80 font-medium;
        }
        .paper-content em {
          @apply text-white/70 italic;
        }
        .paper-content hr {
          @apply border-t border-white/[0.06] my-12;
        }
        .paper-content table {
          @apply w-full text-[13px] border border-white/[0.06] my-8;
        }
        .paper-content th {
          @apply font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 text-left px-4 py-3 bg-white/[0.04] border-b border-white/[0.06];
        }
        .paper-content td {
          @apply px-4 py-3 text-white/60 border-b border-white/[0.04];
        }
        .paper-content .callout {
          @apply border-l-[3px] border-l-emerald-500/60 bg-white/[0.02] px-6 py-5 my-8;
        }
        .paper-content .callout-label {
          @apply font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400/70 mb-2 block;
        }
        .paper-content .footnote {
          @apply text-[12px] text-white/30 leading-relaxed;
        }
      `}</style>
    </div>
  );
}
