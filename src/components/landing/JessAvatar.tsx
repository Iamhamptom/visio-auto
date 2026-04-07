"use client";

import { motion } from "framer-motion";

/**
 * Jess — Visio Auto's AI Sales Agent.
 * Same character as the Jess from HealthOps (cross-vertical brand persona).
 * Confident, smart, fashionable. Illustrated SVG portrait.
 *
 * Style: Stylized vector portrait — abstract, clean, retro-modern.
 * Emerald accents, geometric features, pixel-grid badge in corner.
 */

interface JessProps {
  size?: number;
  variant?: "circle" | "square";
  showBadge?: boolean;
}

export function JessAvatar({ size = 64, variant = "circle", showBadge = true }: JessProps) {
  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background frame */}
        {variant === "circle" ? (
          <circle cx="40" cy="40" r="39" fill="rgba(16,185,129,0.04)" stroke="rgba(16,185,129,0.25)" strokeWidth="1" />
        ) : (
          <rect x="0.5" y="0.5" width="79" height="79" fill="rgba(16,185,129,0.04)" stroke="rgba(16,185,129,0.25)" strokeWidth="1" />
        )}

        {/* Hair — flowing dark shape */}
        <path
          d="M20 32C20 22 28 14 40 14C52 14 60 22 60 32C60 36 58 40 56 42L58 50C58 52 56 54 54 54C54 50 52 47 50 45L48 50L46 40C44 38 42 37 40 37C38 37 36 38 34 40L32 50L30 45C28 47 26 50 26 54C24 54 22 52 22 50L24 42C22 40 20 36 20 32Z"
          fill="rgba(16,185,129,0.5)"
        />

        {/* Face — clean oval */}
        <ellipse cx="40" cy="40" rx="14" ry="17" fill="rgba(16,185,129,0.15)" stroke="rgba(16,185,129,0.4)" strokeWidth="1" />

        {/* Eyes — confident, geometric */}
        <rect x="33" y="38" width="3" height="2" fill="rgba(16,185,129,0.9)" />
        <rect x="44" y="38" width="3" height="2" fill="rgba(16,185,129,0.9)" />

        {/* Eyebrows — sharp */}
        <line x1="32" y1="35" x2="36" y2="35" stroke="rgba(16,185,129,0.7)" strokeWidth="1" strokeLinecap="square" />
        <line x1="44" y1="35" x2="48" y2="35" stroke="rgba(16,185,129,0.7)" strokeWidth="1" strokeLinecap="square" />

        {/* Nose — minimal line */}
        <line x1="40" y1="41" x2="40" y2="44" stroke="rgba(16,185,129,0.4)" strokeWidth="1" />

        {/* Smile — confident curve */}
        <path d="M36 47Q40 50 44 47" stroke="rgba(16,185,129,0.7)" strokeWidth="1.2" fill="none" strokeLinecap="round" />

        {/* Earrings — dots */}
        <circle cx="26" cy="42" r="1" fill="rgba(16,185,129,0.6)" />
        <circle cx="54" cy="42" r="1" fill="rgba(16,185,129,0.6)" />

        {/* Neck */}
        <rect x="36" y="56" width="8" height="6" fill="rgba(16,185,129,0.2)" />

        {/* Collar — sharp lines */}
        <path d="M30 62L36 60L40 65L44 60L50 62" stroke="rgba(16,185,129,0.5)" strokeWidth="1" fill="none" />

        {/* Shoulders */}
        <path d="M24 70L30 62L50 62L56 70" stroke="rgba(16,185,129,0.4)" strokeWidth="1" fill="rgba(16,185,129,0.08)" />

        {/* Pixel grid badge — bottom right */}
        {showBadge && (
          <>
            <rect x="62" y="62" width="3" height="3" fill="rgba(16,185,129,0.6)" />
            <rect x="66" y="62" width="3" height="3" fill="rgba(16,185,129,0.4)" />
            <rect x="62" y="66" width="3" height="3" fill="rgba(16,185,129,0.4)" />
            <rect x="66" y="66" width="3" height="3" fill="rgba(16,185,129,0.2)" />
          </>
        )}
      </svg>

      {/* Live indicator dot */}
      {showBadge && (
        <div className="absolute -bottom-0.5 -right-0.5">
          <div className="relative h-2.5 w-2.5">
            <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-40" />
            <div className="relative h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Animated Jess intro card with name + role
 */
export function JessCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="inline-flex items-center gap-3 border border-white/[0.08] bg-white/[0.02] px-4 py-3"
    >
      <JessAvatar size={48} />
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400/60">
          Jess &middot; AI Sales Agent
        </div>
        <div className="text-[13px] text-white/60 mt-0.5">
          Online &middot; ready to find your buyer
        </div>
      </div>
    </motion.div>
  );
}
