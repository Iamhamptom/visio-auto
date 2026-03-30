"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  periods?: string[];
  activePeriod?: string;
  onPeriodChange?: (period: string) => void;
  className?: string;
  delay?: number;
}

export function ChartCard({
  title,
  subtitle,
  children,
  periods = ["7d", "30d", "90d"],
  activePeriod: controlledPeriod,
  onPeriodChange,
  className,
  delay = 0,
}: ChartCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [internalPeriod, setInternalPeriod] = useState(periods[1] || "30d");
  const activePeriod = controlledPeriod || internalPeriod;

  const handlePeriodChange = (period: string) => {
    if (onPeriodChange) {
      onPeriodChange(period);
    } else {
      setInternalPeriod(period);
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={cn(
        "overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-900/50",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/30 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>
          )}
        </div>

        {/* Period selector */}
        <div className="relative flex items-center gap-0.5 rounded-lg bg-zinc-800/50 p-0.5">
          {periods.map((period) => (
            <button
              key={period}
              onClick={() => handlePeriodChange(period)}
              className={cn(
                "relative z-10 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                activePeriod === period
                  ? "text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {activePeriod === period && (
                <motion.div
                  layoutId={`chart-period-${title}`}
                  className="absolute inset-0 rounded-md bg-zinc-700"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
              <span className="relative z-10">{period}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart content */}
      <div className="p-5">
        {isInView ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: delay + 0.2 }}
          >
            {children}
          </motion.div>
        ) : (
          <div className="flex aspect-[2/1] items-center justify-center">
            <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-800" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
