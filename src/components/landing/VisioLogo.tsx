"use client";

import { motion } from "framer-motion";

/**
 * Visio Auto SVG logo — clean monogram with retro-modern pixel grid accent.
 * The "V" is formed from two angular strokes, and the "A" nests inside
 * with a subtle emerald fill. A 4x4 pixel grid sits in the corner as
 * a nod to the Windows 2001 pixel aesthetic.
 */
export function VisioLogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Border frame */}
      <rect
        x="0.5"
        y="0.5"
        width="31"
        height="31"
        stroke="rgba(16,185,129,0.3)"
        strokeWidth="1"
        fill="rgba(16,185,129,0.06)"
      />

      {/* V letterform */}
      <path
        d="M8 8L16 24L24 8"
        stroke="rgba(16,185,129,0.9)"
        strokeWidth="2"
        strokeLinecap="square"
        fill="none"
      />

      {/* A crossbar inside the V */}
      <line
        x1="11"
        y1="16"
        x2="21"
        y2="16"
        stroke="rgba(16,185,129,0.4)"
        strokeWidth="1"
      />

      {/* Pixel grid accent — bottom right corner (XP feel) */}
      <rect x="25" y="25" width="2" height="2" fill="rgba(16,185,129,0.25)" />
      <rect x="28" y="25" width="2" height="2" fill="rgba(16,185,129,0.15)" />
      <rect x="25" y="28" width="2" height="2" fill="rgba(16,185,129,0.15)" />
      <rect x="28" y="28" width="2" height="2" fill="rgba(16,185,129,0.08)" />

      {/* Pixel dot — top left */}
      <rect x="2" y="2" width="2" height="2" fill="rgba(16,185,129,0.15)" />
    </svg>
  );
}

/**
 * Full logo with wordmark
 */
export function VisioLogoFull() {
  return (
    <div className="flex items-center gap-3">
      <VisioLogoMark />
      <span className="text-sm font-light tracking-wide text-white/80">
        Visio Auto
      </span>
    </div>
  );
}

/**
 * Animated hero logo — large version with spring-pop entry
 */
export function VisioLogoHero() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
    >
      <VisioLogoMark size={48} />
    </motion.div>
  );
}
