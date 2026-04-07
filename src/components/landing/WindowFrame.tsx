"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface WindowFrameProps {
  title: string;
  children: ReactNode;
  variant?: "default" | "terminal" | "browser";
  className?: string;
}

/**
 * Windows XP-inspired window frame.
 * Title bar with traffic-light buttons + optional status dots.
 * The "pop" comes from the spring animation on mount.
 */
export default function WindowFrame({
  title,
  children,
  variant = "default",
  className = "",
}: WindowFrameProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 12 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        mass: 0.8,
      }}
      className={`window-frame group ${className}`}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.03]">
        {/* Traffic lights */}
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/60 group-hover:bg-red-500 transition-colors" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60 group-hover:bg-yellow-500 transition-colors" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60 group-hover:bg-emerald-500 transition-colors" />
        </div>

        {/* Title */}
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/25">
          {title}
        </span>

        {/* Status indicator */}
        <div className="flex items-center gap-1.5">
          {variant === "terminal" && (
            <span className="font-mono text-[9px] text-emerald-500/40">LIVE</span>
          )}
          {variant === "browser" && (
            <div className="flex items-center gap-1 bg-white/[0.04] px-2 py-0.5 rounded-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/40" />
              <span className="font-mono text-[8px] text-white/20">SECURE</span>
            </div>
          )}
          {variant === "default" && (
            <div className="h-1.5 w-4 bg-white/[0.06] rounded-sm" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </motion.div>
  );
}

/**
 * Mini window — smaller variant for inline showcases
 */
export function MiniWindow({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={`border border-white/[0.06] bg-white/[0.02] overflow-hidden cursor-pointer ${className}`}
    >
      {/* Mini title bar */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-white/[0.04] bg-white/[0.02]">
        <div className="h-1.5 w-1.5 rounded-full bg-red-500/40" />
        <div className="h-1.5 w-1.5 rounded-full bg-yellow-500/40" />
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/40" />
        <span className="ml-2 font-mono text-[8px] uppercase tracking-[0.2em] text-white/15">
          {title}
        </span>
      </div>
      <div>{children}</div>
    </motion.div>
  );
}
