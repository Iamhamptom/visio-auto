"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Briefcase,
  Baby,
  Home,
  GraduationCap,
  Building2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Signal } from "@/lib/types";

const signalIconMap: Record<string, typeof Zap> = {
  promotion: Briefcase,
  new_baby: Baby,
  new_business: Building2,
  relocation: Home,
  graduation: GraduationCap,
};

const signalColorMap: Record<string, { icon: string; bg: string; bar: string }> = {
  promotion: {
    icon: "text-amber-400",
    bg: "bg-amber-400/10",
    bar: "bg-amber-400",
  },
  new_baby: {
    icon: "text-pink-400",
    bg: "bg-pink-400/10",
    bar: "bg-pink-400",
  },
  new_business: {
    icon: "text-emerald-400",
    bg: "bg-emerald-400/10",
    bar: "bg-emerald-400",
  },
  relocation: {
    icon: "text-blue-400",
    bg: "bg-blue-400/10",
    bar: "bg-blue-400",
  },
  graduation: {
    icon: "text-purple-400",
    bg: "bg-purple-400/10",
    bar: "bg-purple-400",
  },
};

const defaultColor = {
  icon: "text-emerald-400",
  bg: "bg-emerald-400/10",
  bar: "bg-emerald-400",
};

interface SignalFeedProps {
  signals: Partial<Signal>[];
  loading?: boolean;
}

function SignalSkeleton() {
  return (
    <div className="flex gap-3 rounded-xl border border-zinc-800/30 bg-zinc-900/30 p-4">
      <div className="h-9 w-9 shrink-0 animate-pulse rounded-xl bg-zinc-800" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-800" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-800" />
        <div className="h-2 w-full animate-pulse rounded-full bg-zinc-800" />
      </div>
    </div>
  );
}

export function SignalFeed({ signals, loading }: SignalFeedProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SignalSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {signals.map((signal, index) => {
          const type = signal.signal_type || "";
          const Icon = signalIconMap[type] || Zap;
          const colors = signalColorMap[type] || defaultColor;
          const probability = Math.round((signal.buying_probability || 0) * 100);

          return (
            <motion.div
              key={signal.id}
              layout
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40, scale: 0.95 }}
              transition={{
                duration: 0.4,
                delay: index * 0.08,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="group relative flex gap-3 rounded-xl border border-zinc-800/30 bg-zinc-900/30 p-4 transition-all hover:border-zinc-700/50 hover:bg-zinc-900/50"
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
                  colors.bg
                )}
              >
                <Icon className={cn("h-4 w-4", colors.icon)} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug text-zinc-300 group-hover:text-zinc-200">
                  {signal.title}
                </p>

                {/* Buying probability bar */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${probability}%` }}
                      transition={{
                        duration: 1,
                        delay: index * 0.08 + 0.3,
                        ease: "easeOut",
                      }}
                      className={cn("h-full rounded-full", colors.bar)}
                    />
                  </div>
                  <span className="font-mono text-xs font-semibold text-zinc-400">
                    {probability}%
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-600">
                    {signal.created_at}
                  </span>
                  <button className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium text-emerald-400/70 opacity-0 transition-all hover:bg-emerald-400/10 hover:text-emerald-400 group-hover:opacity-100">
                    <Sparkles className="h-3 w-3" />
                    Convert to Lead
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
