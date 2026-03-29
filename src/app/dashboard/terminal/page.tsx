"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  TICKER_DATA,
  MONTHLY_BRAND_SALES,
  MARKET_SHARE_DATA,
  PRICE_TREND_DATA,
  DAYS_TO_SELL_DATA,
  FINANCE_INDICATORS,
  SEGMENT_TREND_DATA,
  CHINESE_BRAND_DATA,
  REGIONAL_DATA,
  BRAND_SALES_CHART_CONFIG,
  MARKET_SHARE_CHART_CONFIG,
  PRICE_TREND_CHART_CONFIG,
  SEGMENT_TREND_CHART_CONFIG,
  formatZAR,
} from "@/lib/market/data"

// =============================================================================
// Terminal Panel wrapper — consistent dense styling
// =============================================================================

function Panel({
  title,
  children,
  className = "",
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`overflow-hidden rounded border border-emerald-900/30 bg-[#0d1117] ${className}`}
    >
      <div className="flex items-center justify-between border-b border-emerald-900/20 px-3 py-1.5">
        <span className="font-mono text-[11px] font-semibold tracking-wider text-emerald-500 uppercase">
          {title}
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
      </div>
      <div className="p-3">{children}</div>
    </div>
  )
}

// =============================================================================
// Ticker Bar
// =============================================================================

function TickerBar() {
  // Double the data for seamless scrolling loop
  const doubled = [...TICKER_DATA, ...TICKER_DATA]

  return (
    <div className="overflow-hidden rounded border border-emerald-900/30 bg-[#0d1117]">
      <div className="relative flex overflow-hidden">
        <div className="flex animate-[ticker_40s_linear_infinite] gap-6 whitespace-nowrap px-4 py-2">
          {doubled.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 font-mono text-xs">
              <span className="font-semibold text-zinc-300">{item.model}</span>
              <span className="tabular-nums text-zinc-400">
                {item.units.toLocaleString()}
              </span>
              <span
                className={`tabular-nums font-medium ${
                  item.direction === "up" ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {item.direction === "up" ? "\u2191" : "\u2193"}
                {item.changePercent}%
              </span>
              <span className="text-emerald-900/60">|</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Panel 1 — Monthly Brand Sales (Bar Chart)
// =============================================================================

function MonthlySalesPanel() {
  return (
    <Panel title="Monthly Sales — Top 10 Brands">
      <ChartContainer
        config={BRAND_SALES_CHART_CONFIG as unknown as ChartConfig}
        className="aspect-auto h-[280px] w-full"
      >
        <BarChart
          data={MONTHLY_BRAND_SALES}
          layout="vertical"
          margin={{ top: 0, right: 40, bottom: 0, left: 0 }}
        >
          <CartesianGrid horizontal={false} stroke="#1e3a2f" strokeDasharray="3 3" />
          <XAxis
            type="number"
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
            tick={{ fill: "#6b7280", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="brand"
            tick={{ fill: "#d1d5db", fontSize: 11, fontFamily: "var(--font-mono)" }}
            width={70}
            axisLine={false}
            tickLine={false}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => (
                  <span className="font-mono tabular-nums">
                    {Number(value).toLocaleString()} units
                  </span>
                )}
              />
            }
          />
          <Bar dataKey="units" radius={[0, 4, 4, 0]} maxBarSize={24}>
            {MONTHLY_BRAND_SALES.map((_, index) => (
              <Cell
                key={index}
                fill={index === 0 ? "#10b981" : index < 3 ? "#059669" : "#065f46"}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </Panel>
  )
}

// =============================================================================
// Panel 2 — Market Share (Donut)
// =============================================================================

function MarketSharePanel() {
  return (
    <Panel title="Brand Market Share">
      <ChartContainer
        config={MARKET_SHARE_CHART_CONFIG as unknown as ChartConfig}
        className="aspect-auto h-[280px] w-full"
      >
        <PieChart>
          <Pie
            data={MARKET_SHARE_DATA}
            dataKey="share"
            nameKey="brand"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            strokeWidth={2}
            stroke="#0d1117"
          >
            {MARKET_SHARE_DATA.map((entry, i) => (
              <Cell
                key={i}
                fill={
                  ["#10b981", "#059669", "#047857", "#065f46", "#064e3b", "#6ee7b7", "#1e293b"][i]
                }
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const data = payload[0]
              return (
                <div className="rounded border border-emerald-900/40 bg-[#0d1117] px-3 py-2 font-mono text-xs shadow-xl">
                  <p className="font-semibold text-zinc-200">{data.name}</p>
                  <p className="tabular-nums text-emerald-400">{data.value}%</p>
                </div>
              )
            }}
          />
        </PieChart>
      </ChartContainer>
      {/* Legend */}
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
        {MARKET_SHARE_DATA.map((item, i) => (
          <div key={item.brand} className="flex items-center gap-2 text-[11px]">
            <span
              className="h-2 w-2 rounded-sm"
              style={{
                backgroundColor: [
                  "#10b981",
                  "#059669",
                  "#047857",
                  "#065f46",
                  "#064e3b",
                  "#6ee7b7",
                  "#1e293b",
                ][i],
              }}
            />
            <span className="text-zinc-400">{item.brand}</span>
            <span className="ml-auto font-mono tabular-nums text-zinc-300">
              {item.share}%
            </span>
          </div>
        ))}
      </div>
    </Panel>
  )
}

// =============================================================================
// Panel 3 — Price Trends (Line Chart)
// =============================================================================

function PriceTrendsPanel() {
  return (
    <Panel title="Used Car Price Trends (6M)">
      <ChartContainer
        config={PRICE_TREND_CHART_CONFIG as unknown as ChartConfig}
        className="aspect-auto h-[240px] w-full"
      >
        <LineChart data={PRICE_TREND_DATA} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
          <CartesianGrid stroke="#1e3a2f" strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tick={{ fill: "#6b7280", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => `R${(v / 1000).toFixed(0)}K`}
            tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "var(--font-mono)" }}
            axisLine={false}
            tickLine={false}
            width={55}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => (
                  <span className="font-mono tabular-nums">{formatZAR(Number(value))}</span>
                )}
              />
            }
          />
          <Line
            type="monotone"
            dataKey="hilux"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="poloVivo"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="corollaCross"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="creta"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
      {/* Legend */}
      <div className="mt-2 flex flex-wrap gap-4">
        {[
          { key: "Hilux", color: "#10b981" },
          { key: "Polo Vivo", color: "#f59e0b" },
          { key: "Corolla Cross", color: "#3b82f6" },
          { key: "Creta", color: "#8b5cf6" },
        ].map((item) => (
          <div key={item.key} className="flex items-center gap-1.5 text-[11px]">
            <span className="h-0.5 w-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-zinc-400">{item.key}</span>
          </div>
        ))}
      </div>
    </Panel>
  )
}

// =============================================================================
// Panel 4 — Days to Sell (Horizontal Bar)
// =============================================================================

function DaysToSellPanel() {
  const getColor = (category: string) => {
    if (category === "fast") return "#10b981"
    if (category === "average") return "#f59e0b"
    return "#ef4444"
  }

  return (
    <Panel title="Avg Days to Sell">
      <div className="space-y-2">
        {DAYS_TO_SELL_DATA.map((item) => (
          <div key={item.model} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-right font-mono text-[11px] text-zinc-400">
              {item.model}
            </span>
            <div className="relative h-5 flex-1 overflow-hidden rounded bg-zinc-900">
              <div
                className="flex h-full items-center rounded px-2 transition-all"
                style={{
                  width: `${(item.days / 32) * 100}%`,
                  backgroundColor: getColor(item.category),
                  opacity: 0.85,
                }}
              >
                <span className="font-mono text-[10px] font-bold text-black tabular-nums">
                  {item.days}d
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="mt-3 flex gap-4">
        {[
          { label: "Fast (<16d)", color: "#10b981" },
          { label: "Average", color: "#f59e0b" },
          { label: "Slow (>26d)", color: "#ef4444" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-[10px]">
            <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: item.color }} />
            <span className="text-zinc-500">{item.label}</span>
          </div>
        ))}
      </div>
    </Panel>
  )
}

// =============================================================================
// Panel 5 — Finance & Economic Indicators
// =============================================================================

function FinancePanel() {
  return (
    <Panel title="Finance & Economic Indicators">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {FINANCE_INDICATORS.map((item) => (
          <div
            key={item.label}
            className="rounded border border-zinc-800 bg-zinc-900/50 px-3 py-2.5"
          >
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">
              {item.label}
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              {item.unit === "R" && (
                <span className="font-mono text-[11px] text-zinc-500">R</span>
              )}
              <span className="font-mono text-lg font-bold tabular-nums text-zinc-100">
                {item.value}
              </span>
              {item.unit && item.unit !== "R" && (
                <span className="font-mono text-[11px] text-zinc-500">{item.unit}</span>
              )}
            </div>
            {item.change && (
              <div
                className={`mt-0.5 font-mono text-[10px] tabular-nums ${
                  item.direction === "up" ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {item.change}
              </div>
            )}
          </div>
        ))}
      </div>
    </Panel>
  )
}

// =============================================================================
// Panel 6 — Segment Trends (Stacked Area)
// =============================================================================

function SegmentTrendsPanel() {
  return (
    <Panel title="Segment Trends (6M)">
      <ChartContainer
        config={SEGMENT_TREND_CHART_CONFIG as unknown as ChartConfig}
        className="aspect-auto h-[240px] w-full"
      >
        <AreaChart data={SEGMENT_TREND_DATA} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
          <CartesianGrid stroke="#1e3a2f" strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tick={{ fill: "#6b7280", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
            tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "var(--font-mono)" }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => (
                  <span className="font-mono tabular-nums">
                    {Number(value).toLocaleString()} units
                  </span>
                )}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="suvCrossover"
            stackId="1"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.4}
          />
          <Area
            type="monotone"
            dataKey="bakkieLcv"
            stackId="1"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={0.3}
          />
          <Area
            type="monotone"
            dataKey="hatchback"
            stackId="1"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.3}
          />
          <Area
            type="monotone"
            dataKey="sedan"
            stackId="1"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.3}
          />
          <Area
            type="monotone"
            dataKey="other"
            stackId="1"
            stroke="#6b7280"
            fill="#6b7280"
            fillOpacity={0.2}
          />
        </AreaChart>
      </ChartContainer>
      {/* Legend */}
      <div className="mt-2 flex flex-wrap gap-3">
        {[
          { label: "SUV/Crossover", color: "#10b981" },
          { label: "Bakkie/LCV", color: "#f59e0b" },
          { label: "Hatchback", color: "#3b82f6" },
          { label: "Sedan", color: "#8b5cf6" },
          { label: "Other", color: "#6b7280" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-[10px]">
            <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: item.color }} />
            <span className="text-zinc-400">{item.label}</span>
          </div>
        ))}
      </div>
    </Panel>
  )
}

// =============================================================================
// Panel 7 — Chinese Brand Tracker (Table)
// =============================================================================

function ChineseBrandPanel() {
  return (
    <Panel title="Chinese Brand Tracker">
      <Table>
        <TableHeader>
          <TableRow className="border-emerald-900/20 hover:bg-transparent">
            <TableHead className="h-7 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
              Brand
            </TableHead>
            <TableHead className="h-7 text-right text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
              Units
            </TableHead>
            <TableHead className="h-7 text-right text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
              YoY
            </TableHead>
            <TableHead className="h-7 text-right text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
              Share
            </TableHead>
            <TableHead className="h-7 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
              Top Model
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {CHINESE_BRAND_DATA.map((item) => (
            <TableRow
              key={item.brand}
              className="border-zinc-800/50 hover:bg-emerald-950/20"
            >
              <TableCell className="py-1.5 font-mono text-xs font-medium text-zinc-200">
                {item.brand}
                {item.note && (
                  <span className="ml-1.5 rounded bg-emerald-900/40 px-1 py-0.5 text-[9px] text-emerald-400">
                    NEW
                  </span>
                )}
              </TableCell>
              <TableCell className="py-1.5 text-right font-mono text-xs tabular-nums text-zinc-300">
                {item.units.toLocaleString()}
              </TableCell>
              <TableCell className="py-1.5 text-right font-mono text-xs tabular-nums text-emerald-400">
                +{item.yoyGrowth}%
              </TableCell>
              <TableCell className="py-1.5 text-right font-mono text-xs tabular-nums text-zinc-400">
                {item.marketShare}%
              </TableCell>
              <TableCell className="py-1.5 text-xs text-zinc-400">
                {item.topModel}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* BYD callout */}
      <div className="mt-2 rounded border border-emerald-900/30 bg-emerald-950/20 px-3 py-2">
        <p className="font-mono text-[10px] text-emerald-500">
          <span className="font-bold">BYD ALERT:</span> 60-70 new dealerships planned across SA.
          YoY growth +340%. Watch this space.
        </p>
      </div>
    </Panel>
  )
}

// =============================================================================
// Panel 8 — Regional Distribution (Table)
// =============================================================================

function RegionalPanel() {
  return (
    <Panel title="Regional Distribution">
      <div className="space-y-1.5">
        {REGIONAL_DATA.map((item) => (
          <div key={item.province} className="flex items-center gap-2">
            <span className="w-6 shrink-0 font-mono text-[10px] font-bold text-emerald-600">
              {item.abbrev}
            </span>
            <span className="w-24 shrink-0 text-[11px] text-zinc-400">{item.province}</span>
            <div className="relative h-4 flex-1 overflow-hidden rounded-sm bg-zinc-900">
              <div
                className="h-full rounded-sm bg-emerald-700/60 transition-all"
                style={{ width: `${(item.share / 50) * 100}%` }}
              />
            </div>
            <span className="w-10 text-right font-mono text-[11px] tabular-nums text-zinc-300">
              {item.share}%
            </span>
            <span className="w-14 text-right font-mono text-[10px] tabular-nums text-zinc-500">
              {item.units.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
      {/* Total */}
      <div className="mt-3 flex items-center justify-between border-t border-zinc-800 pt-2">
        <span className="text-[11px] font-semibold text-zinc-400">TOTAL</span>
        <span className="font-mono text-sm font-bold tabular-nums text-emerald-400">
          {REGIONAL_DATA.reduce((sum, r) => sum + r.units, 0).toLocaleString()} units
        </span>
      </div>
    </Panel>
  )
}

// =============================================================================
// Main Terminal Page
// =============================================================================

export default function MarketTerminalPage() {
  return (
    <div className="space-y-2">
      {/* Ticker Bar */}
      <TickerBar />

      {/* Row 1: Monthly Sales + Market Share */}
      <div className="grid gap-2 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <MonthlySalesPanel />
        </div>
        <div className="lg:col-span-2">
          <MarketSharePanel />
        </div>
      </div>

      {/* Row 2: Price Trends + Days to Sell + Finance */}
      <div className="grid gap-2 lg:grid-cols-3">
        <PriceTrendsPanel />
        <DaysToSellPanel />
        <FinancePanel />
      </div>

      {/* Row 3: Segment Trends + Chinese Brands + Regional */}
      <div className="grid gap-2 lg:grid-cols-3">
        <SegmentTrendsPanel />
        <ChineseBrandPanel />
        <RegionalPanel />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-emerald-900/20 px-2 py-2">
        <span className="font-mono text-[10px] text-zinc-600">
          Source: NAAMSA / TransUnion Auto / Visio Auto Intelligence
        </span>
        <span className="font-mono text-[10px] text-zinc-600">
          Data period: March 2026 | Updated daily
        </span>
      </div>
    </div>
  )
}
