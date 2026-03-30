"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useSpring, useMotionValue } from "framer-motion";
import { type LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: number | string;
  change?: number;
  changeDirection?: "up" | "down" | "neutral";
  icon: LucideIcon;
  format?: "number" | "currency" | "percent" | "time";
  delay?: number;
  subtitle?: string;
  color?: string;
  bg?: string;
}

function AnimatedNumber({
  value,
  format,
}: {
  value: number | string;
  format?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const numericValue =
    typeof value === "string" ? parseFloat(value.replace(/[^0-9.]/g, "")) : value;
  const isNumeric = !isNaN(numericValue) && typeof value !== "string";
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 60, damping: 20, mass: 1 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!isNumeric) return;
    if (isInView) {
      motionValue.set(numericValue);
    }
  }, [isInView, numericValue, isNumeric, motionValue]);

  useEffect(() => {
    if (!isNumeric) return;
    const unsubscribe = spring.on("change", (v) => {
      if (format === "currency") {
        setDisplay(`R${Math.round(v).toLocaleString()}`);
      } else if (format === "percent") {
        setDisplay(`${v.toFixed(1)}%`);
      } else {
        setDisplay(Math.round(v).toLocaleString());
      }
    });
    return unsubscribe;
  }, [spring, format, isNumeric]);

  if (!isNumeric) {
    return <span ref={ref}>{value}</span>;
  }

  return <span ref={ref}>{display}</span>;
}

export function KPICard({
  title,
  value,
  change,
  changeDirection = "neutral",
  icon: Icon,
  format = "number",
  delay = 0,
  subtitle,
  color = "text-emerald-400",
  bg = "bg-emerald-400/10",
}: KPICardProps) {
  const changeColor =
    changeDirection === "up"
      ? "text-emerald-400"
      : changeDirection === "down"
        ? "text-red-400"
        : "text-zinc-500";

  const ChangeIcon =
    changeDirection === "up"
      ? ArrowUpRight
      : changeDirection === "down"
        ? ArrowDownRight
        : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
      }}
      className="group relative overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-5 transition-colors hover:border-zinc-700/50"
    >
      {/* Subtle glow on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className={cn("absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl", bg, "opacity-20")} />
      </div>

      <div className="relative flex items-center justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", bg)}>
          <Icon className={cn("h-5 w-5", color)} />
        </div>
        {change !== undefined && (
          <div className={cn("flex items-center gap-0.5 text-xs font-semibold", changeColor)}>
            <ChangeIcon className="h-3.5 w-3.5" />
            {changeDirection === "up" ? "+" : changeDirection === "down" ? "-" : ""}
            {Math.abs(change)}%
          </div>
        )}
      </div>

      <div className="relative mt-4">
        <p className="font-mono text-2xl font-bold tracking-tight text-white">
          <AnimatedNumber value={value} format={format} />
        </p>
        <p className="mt-1 text-xs font-medium text-zinc-500">{title}</p>
        {subtitle && (
          <p className="mt-0.5 text-[11px] text-zinc-600">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}
