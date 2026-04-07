"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/**
 * Real SVG charts powered by verified Q1 2026 data from VRL-AUTO-001.
 * No chart libraries — pure SVG, animated with Framer Motion.
 *
 * Each chart pairs with a Nano Banana infographic background where appropriate.
 */

// ─────────────────────────────────────────
// Q1 2026 Monthly Sales Bar Chart
// Source: NAAMSA Jan/Feb/Mar 2026 releases
// ─────────────────────────────────────────
export function Q1SalesBarChart() {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const data = [
    { month: "Jan 2026", units: 50073, yoy: "+7.5%" },
    { month: "Feb 2026", units: 53455, yoy: "+11.4%" },
    { month: "Mar 2026", units: 58060, yoy: "+17.3%" },
  ];

  const maxUnits = 60000;
  const chartHeight = 240;
  const barWidth = 70;
  const gap = 60;
  const totalWidth = data.length * (barWidth + gap) - gap + 80;

  return (
    <div className="border border-white/[0.06] bg-white/[0.02] p-8 relative overflow-hidden">
      <div className="mb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-400/60">
          Q1 2026 New Vehicle Sales
        </span>
        <h4 className="mt-2 text-xl font-extralight text-white">
          The market is <span className="text-emerald-400">accelerating</span>
        </h4>
      </div>

      <svg
        ref={ref}
        viewBox={`0 0 ${totalWidth} ${chartHeight + 60}`}
        className="w-full"
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = chartHeight - t * chartHeight + 20;
          return (
            <g key={t}>
              <line
                x1="40"
                x2={totalWidth - 20}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="1"
              />
              <text
                x="0"
                y={y + 4}
                fill="rgba(255,255,255,0.2)"
                fontSize="9"
                fontFamily="monospace"
              >
                {Math.round(t * maxUnits / 1000)}K
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const barHeight = (d.units / maxUnits) * chartHeight;
          const x = 60 + i * (barWidth + gap);
          const y = chartHeight - barHeight + 20;

          return (
            <g key={d.month}>
              {/* Bar */}
              <motion.rect
                x={x}
                width={barWidth}
                fill="url(#emeraldGradient)"
                initial={{ height: 0, y: chartHeight + 20 }}
                animate={
                  isInView
                    ? { height: barHeight, y: y }
                    : { height: 0, y: chartHeight + 20 }
                }
                transition={{
                  duration: 1,
                  delay: 0.2 + i * 0.15,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />
              {/* Top accent line */}
              <motion.line
                x1={x}
                x2={x + barWidth}
                stroke="rgb(16, 185, 129)"
                strokeWidth="2"
                initial={{ y1: chartHeight + 20, y2: chartHeight + 20, opacity: 0 }}
                animate={
                  isInView
                    ? { y1: y, y2: y, opacity: 1 }
                    : { y1: chartHeight + 20, y2: chartHeight + 20, opacity: 0 }
                }
                transition={{
                  duration: 1,
                  delay: 0.2 + i * 0.15,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />
              {/* Value label */}
              <motion.text
                x={x + barWidth / 2}
                textAnchor="middle"
                fill="rgba(16, 185, 129, 0.9)"
                fontSize="13"
                fontFamily="monospace"
                fontWeight="300"
                initial={{ opacity: 0, y: chartHeight + 20 }}
                animate={
                  isInView
                    ? { opacity: 1, y: y - 8 }
                    : { opacity: 0, y: chartHeight + 20 }
                }
                transition={{
                  duration: 0.6,
                  delay: 0.5 + i * 0.15,
                }}
              >
                {(d.units / 1000).toFixed(1)}K
              </motion.text>
              {/* Month label */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 38}
                textAnchor="middle"
                fill="rgba(255,255,255,0.5)"
                fontSize="11"
                fontFamily="monospace"
              >
                {d.month}
              </text>
              {/* YoY label */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 52}
                textAnchor="middle"
                fill="rgba(16, 185, 129, 0.6)"
                fontSize="9"
                fontFamily="monospace"
              >
                {d.yoy} YoY
              </text>
            </g>
          );
        })}

        {/* Gradient def */}
        <defs>
          <linearGradient id="emeraldGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(16, 185, 129, 0.6)" />
            <stop offset="100%" stopColor="rgba(16, 185, 129, 0.05)" />
          </linearGradient>
        </defs>
      </svg>

      <p className="mt-4 font-mono text-[10px] text-white/25">
        Source: NAAMSA monthly releases, January–March 2026 · Best March since 2007
      </p>
    </div>
  );
}

// ─────────────────────────────────────────
// March 2026 Top 10 Brand Ranking — horizontal bar chart
// Source: NAAMSA March 2026
// ─────────────────────────────────────────
export function BrandRankingChart() {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const data = [
    { brand: "Toyota", units: 13323, asian: false },
    { brand: "VW Group", units: 5574, asian: false },
    { brand: "Suzuki", units: 5047, asian: true },
    { brand: "Isuzu", units: 3513, asian: false },
    { brand: "Hyundai", units: 3258, asian: true },
    { brand: "Ford", units: 2828, asian: false },
    { brand: "GWM", units: 2777, asian: true },
    { brand: "Chery", units: 2390, asian: true },
    { brand: "Mahindra", units: 2280, asian: true },
    { brand: "Jetour", units: 1768, asian: true },
  ];

  const maxUnits = 14000;
  const rowHeight = 30;
  const labelWidth = 90;
  const valueWidth = 60;

  return (
    <div className="border border-white/[0.06] bg-white/[0.02] p-8 relative overflow-hidden">
      <div className="mb-6 flex items-baseline justify-between flex-wrap gap-2">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-400/60">
            March 2026 Top 10 OEMs
          </span>
          <h4 className="mt-2 text-xl font-extralight text-white">
            Asian brands hold <span className="text-emerald-400">5 of top 10</span>
          </h4>
        </div>
        <div className="font-mono text-[10px] text-white/30">
          Asian-owned highlighted ▰
        </div>
      </div>

      <svg
        ref={ref}
        viewBox={`0 0 600 ${data.length * rowHeight + 20}`}
        className="w-full"
      >
        {data.map((d, i) => {
          const barWidth = (d.units / maxUnits) * (600 - labelWidth - valueWidth - 20);
          const y = i * rowHeight + 10;

          return (
            <g key={d.brand}>
              {/* Brand label */}
              <text
                x="0"
                y={y + rowHeight / 2 + 4}
                fill={d.asian ? "rgba(16,185,129,0.9)" : "rgba(255,255,255,0.6)"}
                fontSize="12"
                fontFamily="monospace"
                fontWeight="400"
              >
                {String(i + 1).padStart(2, "0")}. {d.brand}
              </text>

              {/* Bar background track */}
              <rect
                x={labelWidth}
                y={y + 8}
                width={600 - labelWidth - valueWidth - 20}
                height="14"
                fill="rgba(255,255,255,0.02)"
              />

              {/* Bar fill */}
              <motion.rect
                x={labelWidth}
                y={y + 8}
                height="14"
                fill={
                  d.asian
                    ? "url(#emeraldBarGradient)"
                    : "rgba(255,255,255,0.15)"
                }
                initial={{ width: 0 }}
                animate={isInView ? { width: barWidth } : { width: 0 }}
                transition={{
                  duration: 1,
                  delay: 0.2 + i * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />

              {/* Value */}
              <motion.text
                x={labelWidth + barWidth + 8}
                y={y + rowHeight / 2 + 4}
                fill={d.asian ? "rgba(16,185,129,0.9)" : "rgba(255,255,255,0.6)"}
                fontSize="11"
                fontFamily="monospace"
                fontWeight="300"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.6 + i * 0.06 }}
              >
                {d.units.toLocaleString()}
              </motion.text>
            </g>
          );
        })}

        <defs>
          <linearGradient id="emeraldBarGradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="rgba(16, 185, 129, 0.7)" />
            <stop offset="100%" stopColor="rgba(16, 185, 129, 0.3)" />
          </linearGradient>
        </defs>
      </svg>

      <p className="mt-4 font-mono text-[10px] text-white/25">
        Source: NAAMSA March 2026 industry report · 4 of top 10 are Chinese/Indian OEMs
      </p>
    </div>
  );
}

// ─────────────────────────────────────────
// Export Crisis: Vehicle export trend (Feb 2026 -28.1% YoY)
// Source: NAAMSA export sales data
// ─────────────────────────────────────────
export function ExportCrisisChart() {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const data = [
    { period: "Feb 2025", units: 33689 },
    { period: "Mar 2025", units: 39483 },
    { period: "Feb 2026", units: 24221, alert: true },
    { period: "Mar 2026", units: 37388 },
  ];

  const maxUnits = 45000;
  const chartW = 480;
  const chartH = 200;
  const gap = (chartW - 80) / (data.length - 1);

  // Build line path
  const points = data.map((d, i) => ({
    x: 40 + i * gap,
    y: chartH - (d.units / maxUnits) * chartH + 20,
  }));
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="border border-white/[0.06] bg-white/[0.02] p-8 relative overflow-hidden">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-red-400/70 border border-red-500/30 bg-red-500/[0.06] px-2 py-0.5">
            CRISIS
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-400/60">
            Vehicle Exports
          </span>
        </div>
        <h4 className="mt-2 text-xl font-extralight text-white">
          February 2026 exports <span className="text-red-400/80">−28.1% YoY</span>
        </h4>
      </div>

      <svg
        ref={ref}
        viewBox={`0 0 ${chartW + 20} ${chartH + 60}`}
        className="w-full"
      >
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = chartH - t * chartH + 20;
          return (
            <line
              key={t}
              x1="30"
              x2={chartW - 10}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.04)"
            />
          );
        })}

        {/* Line path */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="rgba(239, 68, 68, 0.7)"
          strokeWidth="2"
          strokeLinecap="square"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <motion.circle
              cx={p.x}
              cy={p.y}
              r={data[i].alert ? 6 : 4}
              fill={data[i].alert ? "rgba(239, 68, 68, 1)" : "rgba(16, 185, 129, 0.6)"}
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : { scale: 0 }}
              transition={{ delay: 1 + i * 0.15, type: "spring", stiffness: 300 }}
            />
            {/* Period label */}
            <text
              x={p.x}
              y={chartH + 40}
              textAnchor="middle"
              fill="rgba(255,255,255,0.4)"
              fontSize="10"
              fontFamily="monospace"
            >
              {data[i].period}
            </text>
            {/* Value */}
            <motion.text
              x={p.x}
              y={p.y - 12}
              textAnchor="middle"
              fill={data[i].alert ? "rgba(239, 68, 68, 1)" : "rgba(255,255,255,0.6)"}
              fontSize="10"
              fontFamily="monospace"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 1.2 + i * 0.15 }}
            >
              {(data[i].units / 1000).toFixed(1)}K
            </motion.text>
          </g>
        ))}
      </svg>

      <p className="mt-4 font-mono text-[10px] text-white/25">
        Source: NAAMSA export sales February & March 2026 · Morocco overtook SA as #1 African producer
      </p>
    </div>
  );
}

// ─────────────────────────────────────────
// Brand Share Donut — 2025 Annual
// Source: NAAMSA Full Year 2025
// ─────────────────────────────────────────
export function BrandShareDonut() {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const data = [
    { brand: "Toyota", share: 24.8, color: "rgba(16, 185, 129, 0.9)" },
    { brand: "Suzuki", share: 12.0, color: "rgba(16, 185, 129, 0.7)" },
    { brand: "VW Group", share: 11.5, color: "rgba(16, 185, 129, 0.55)" },
    { brand: "Chinese OEMs", share: 17.2, color: "rgba(245, 158, 11, 0.7)" },
    { brand: "Other", share: 34.5, color: "rgba(255, 255, 255, 0.15)" },
  ];

  const radius = 70;
  const innerRadius = 50;
  const cx = 100;
  const cy = 100;

  // Calculate arcs
  let cumulative = 0;
  const arcs = data.map((d) => {
    const startAngle = (cumulative / 100) * Math.PI * 2 - Math.PI / 2;
    cumulative += d.share;
    const endAngle = (cumulative / 100) * Math.PI * 2 - Math.PI / 2;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);

    const x3 = cx + innerRadius * Math.cos(endAngle);
    const y3 = cy + innerRadius * Math.sin(endAngle);
    const x4 = cx + innerRadius * Math.cos(startAngle);
    const y4 = cy + innerRadius * Math.sin(startAngle);

    const largeArc = d.share > 50 ? 1 : 0;

    const path = `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `;

    return { ...d, path };
  });

  return (
    <div className="border border-white/[0.06] bg-white/[0.02] p-8 relative overflow-hidden">
      <div className="mb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-400/60">
          2025 Brand Share
        </span>
        <h4 className="mt-2 text-xl font-extralight text-white">
          Toyota leads. <span className="text-amber-400/80">Chinese OEMs surge</span>.
        </h4>
      </div>

      <div className="grid sm:grid-cols-[200px_1fr] gap-6 items-center">
        <svg
          ref={ref}
          viewBox="0 0 200 200"
          className="w-full max-w-[200px]"
        >
          {arcs.map((arc, i) => (
            <motion.path
              key={arc.brand}
              d={arc.path}
              fill={arc.color}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={
                isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }
              }
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ transformOrigin: "100px 100px" }}
            />
          ))}
          {/* Center label */}
          <text
            x="100"
            y="95"
            textAnchor="middle"
            fill="rgba(255,255,255,0.7)"
            fontSize="11"
            fontFamily="monospace"
          >
            596,818
          </text>
          <text
            x="100"
            y="110"
            textAnchor="middle"
            fill="rgba(16,185,129,0.6)"
            fontSize="8"
            fontFamily="monospace"
          >
            UNITS 2025
          </text>
        </svg>

        <div className="space-y-3">
          {data.map((d) => (
            <div key={d.brand} className="flex items-center gap-3">
              <div
                className="w-3 h-3 shrink-0"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-[12px] text-white/60 flex-1">{d.brand}</span>
              <span className="font-mono text-[12px] text-white/80">
                {d.share}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-6 font-mono text-[10px] text-white/25">
        Source: NAAMSA Full Year 2025 · Chinese OEM share of new passenger sales
      </p>
    </div>
  );
}
