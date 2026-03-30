"use client"

import { useState, useMemo } from "react"
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Fuel,
  Car,
  Percent,
  Shield,
  Zap,
  Filter,
  ChevronRight,
} from "lucide-react"
import { FINANCE_INDICATORS, CHINESE_BRAND_DATA } from "@/lib/market/data"

// =============================================================================
// Types
// =============================================================================

type Severity = "critical" | "warning" | "info"
type AlertCategory = "interest_rate" | "fuel_price" | "model_launch" | "competitor"

interface MarketAlert {
  id: string
  category: AlertCategory
  severity: Severity
  title: string
  description: string
  impact_analysis: string
  recommended_action: string
  timestamp: string
  brands_affected: string[]
}

// =============================================================================
// Alert Data (would come from API in production)
// =============================================================================

const MARKET_ALERTS: MarketAlert[] = [
  {
    id: "a1",
    category: "fuel_price",
    severity: "warning",
    title: "Fuel Price Increase: Petrol up R0.38/L from April 2",
    description:
      "Department of Energy announces 95 ULP rises to R24.62/L. Diesel up R0.22/L to R23.11/L.",
    impact_analysis:
      "Petrol up R2 in 6 months. Small car demand increases as buyers seek fuel efficiency. Suzuki Swift, Toyota Starlet, and VW Polo Vivo benefit. SUV and bakkie buyers may delay or shift to diesel variants. Finance calculators should factor higher running costs.",
    recommended_action:
      "Highlight fuel economy in all listings. Push Swift, Starlet, and Baleno inventory. Add 'running cost comparison' to test drive pitches. Diesel bakkies become more attractive — adjust messaging.",
    timestamp: "2026-03-28T06:00:00Z",
    brands_affected: ["Toyota", "Suzuki", "VW", "Hyundai"],
  },
  {
    id: "a2",
    category: "interest_rate",
    severity: "info",
    title: "SARB Holds Repo Rate at 7.75% — Prime Stays 11.50%",
    description:
      "Reserve Bank holds steady for the third consecutive MPC meeting. Next review in May 2026.",
    impact_analysis:
      "Rate stability is positive for vehicle finance. Approval rate at 67% (+2% MoM). No urgency to 'buy before rates rise' — but steady conditions mean consistent buyer activity. Pre-approved buyers remain confident.",
    recommended_action:
      "Finance approval rate is strong — push pre-qualification messaging. 'Rates are stable — lock in your deal now before year-end rush.' Contact pipeline leads who were waiting on rate movements.",
    timestamp: "2026-03-27T14:00:00Z",
    brands_affected: [],
  },
  {
    id: "a3",
    category: "model_launch",
    severity: "critical",
    title: "2026 Toyota Hilux GR-S — Pre-orders Open April 1",
    description:
      "Toyota SA confirms R895,900 pricing. New 2.8 GD-6 with 165kW. Expected to be fastest-selling variant.",
    impact_analysis:
      "The Hilux is SA's best-selling vehicle (4,847 units/month, +12%). The GR-S variant commands premium pricing and loyal buyers. Pre-order demand will spike. Used Hilux prices may soften as trade-ins increase. Competitive response expected from Ford Ranger Raptor.",
    recommended_action:
      "Toyota dealers: set up pre-order lists NOW. Non-Toyota dealers: prepare for Hilux trade-in influx — price used Hilux stock competitively. Ford dealers: position Ranger Wildtrak as the value alternative.",
    timestamp: "2026-03-26T09:00:00Z",
    brands_affected: ["Toyota", "Ford"],
  },
  {
    id: "a4",
    category: "competitor",
    severity: "warning",
    title: "BYD Opens 12 New Dealerships in Gauteng & Western Cape",
    description:
      "BYD accelerates SA expansion. Atto 3 and Dolphin Mini driving 340% YoY growth. 60-70 total dealerships planned.",
    impact_analysis:
      "BYD's aggressive expansion pressures the R300K-R600K SUV/crossover segment. The Atto 3 directly competes with Creta, Tiggo 4, and Corolla Cross. EV charging infrastructure growing. Buyers in upmarket areas (Sandton, Stellenbosch) increasingly consider EVs.",
    recommended_action:
      "Know the BYD lineup and pricing — buyers will compare. Highlight advantages of your brands (warranty, resale value, parts availability). Track BYD promotions in your area. Consider EV education for your sales team.",
    timestamp: "2026-03-25T11:00:00Z",
    brands_affected: ["BYD", "Hyundai", "Chery", "Toyota"],
  },
  {
    id: "a5",
    category: "competitor",
    severity: "info",
    title: "Suzuki Overtakes VW as #2 SA Brand for Q1 2026",
    description:
      "Q1 2026: 17,200 units. Swift and Fronx combine for 9,800 units. Market share hits 13%.",
    impact_analysis:
      "Suzuki's budget-friendly range captures price-sensitive buyers. The Swift (+15%), Fronx (+22%), and Baleno (+18%) all growing. VW's Polo Vivo declining 3%. Suzuki dealers seeing strong foot traffic. Non-Suzuki dealers losing budget segment share.",
    recommended_action:
      "Suzuki dealers: maximise this momentum — increase stock of Swift and Fronx. VW dealers: push Polo Vivo promotions and trade-in offers. All dealers: monitor the sub-R300K segment closely.",
    timestamp: "2026-03-24T08:30:00Z",
    brands_affected: ["Suzuki", "VW"],
  },
  {
    id: "a6",
    category: "fuel_price",
    severity: "info",
    title: "Used Car Prices Up 3.2% MoM — Average Now R391,000",
    description:
      "TransUnion reports continued price appreciation. Budget segment (<R250K) fastest growing.",
    impact_analysis:
      "Rising used prices benefit dealers holding inventory but squeeze buyer affordability. Finance amounts increasing, potentially pushing some buyers below approval thresholds. Trade-in values are strong — good time to acquire stock through trade-ins.",
    recommended_action:
      "Price stock at market rate — don't leave money on the table. Push trade-in campaigns while values are high. Offer finance pre-qualification to overcome affordability concerns. Target cash buyers who benefit from avoiding finance.",
    timestamp: "2026-03-23T07:00:00Z",
    brands_affected: ["VW", "Suzuki", "Hyundai", "Toyota"],
  },
]

// =============================================================================
// Panel Wrapper
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
// Severity Badge
// =============================================================================

function SeverityBadge({ severity }: { severity: Severity }) {
  const config = {
    critical: {
      bg: "bg-red-900/40",
      text: "text-red-400",
      border: "border-red-800/50",
      dot: "bg-red-500",
      label: "CRITICAL",
    },
    warning: {
      bg: "bg-amber-900/40",
      text: "text-amber-400",
      border: "border-amber-800/50",
      dot: "bg-amber-500",
      label: "WARNING",
    },
    info: {
      bg: "bg-blue-900/40",
      text: "text-blue-400",
      border: "border-blue-800/50",
      dot: "bg-blue-500",
      label: "INFO",
    },
  }

  const c = config[severity]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${c.bg} ${c.text} ${c.border}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}

// =============================================================================
// Category Icon
// =============================================================================

function CategoryIcon({ category }: { category: AlertCategory }) {
  const iconMap: Record<AlertCategory, React.ReactNode> = {
    interest_rate: <Percent className="h-4 w-4 text-blue-400" />,
    fuel_price: <Fuel className="h-4 w-4 text-amber-400" />,
    model_launch: <Car className="h-4 w-4 text-emerald-400" />,
    competitor: <Shield className="h-4 w-4 text-violet-400" />,
  }
  return <>{iconMap[category]}</>
}

// =============================================================================
// Alert Card
// =============================================================================

function AlertCard({ alert }: { alert: MarketAlert }) {
  const [expanded, setExpanded] = useState(false)

  const severityBorder = {
    critical: "border-l-red-500",
    warning: "border-l-amber-500",
    info: "border-l-blue-500",
  }

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime()
    const hours = Math.floor(diff / 3600000)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div
      className={`overflow-hidden rounded border border-zinc-800/50 border-l-2 bg-[#0d1117] transition-colors hover:border-zinc-700/50 ${severityBorder[alert.severity]}`}
    >
      {/* Main row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <div className="mt-0.5 shrink-0">
          <CategoryIcon category={alert.category} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <SeverityBadge severity={alert.severity} />
            {alert.brands_affected.map((b) => (
              <span
                key={b}
                className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400"
              >
                {b}
              </span>
            ))}
            <span className="ml-auto font-mono text-[10px] text-zinc-600">
              {timeAgo(alert.timestamp)}
            </span>
          </div>
          <h3 className="font-mono text-sm font-semibold text-zinc-100">
            {alert.title}
          </h3>
          <p className="mt-1 text-[13px] text-zinc-400">{alert.description}</p>
        </div>
        <ChevronRight
          className={`mt-1 h-4 w-4 shrink-0 text-zinc-600 transition-transform ${expanded ? "rotate-90" : ""}`}
        />
      </button>

      {/* Expanded analysis */}
      {expanded && (
        <div className="border-t border-zinc-800/50 bg-zinc-900/30 px-4 py-3 space-y-3">
          {/* Impact Analysis */}
          <div>
            <div className="mb-1 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-emerald-500">
                Impact Analysis
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-zinc-300">
              {alert.impact_analysis}
            </p>
          </div>

          {/* Recommended Action */}
          <div>
            <div className="mb-1 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-amber-500">
                Recommended Action
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-zinc-300">
              {alert.recommended_action}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// Quick Stats Bar
// =============================================================================

function QuickStatsBar() {
  const critical = MARKET_ALERTS.filter((a) => a.severity === "critical").length
  const warning = MARKET_ALERTS.filter((a) => a.severity === "warning").length
  const info = MARKET_ALERTS.filter((a) => a.severity === "info").length

  return (
    <div className="flex gap-2">
      <div className="flex items-center gap-2 rounded border border-red-900/30 bg-red-950/20 px-3 py-1.5">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        <span className="font-mono text-xs tabular-nums text-red-400">
          {critical} critical
        </span>
      </div>
      <div className="flex items-center gap-2 rounded border border-amber-900/30 bg-amber-950/20 px-3 py-1.5">
        <span className="h-2 w-2 rounded-full bg-amber-500" />
        <span className="font-mono text-xs tabular-nums text-amber-400">
          {warning} warning
        </span>
      </div>
      <div className="flex items-center gap-2 rounded border border-blue-900/30 bg-blue-950/20 px-3 py-1.5">
        <span className="h-2 w-2 rounded-full bg-blue-500" />
        <span className="font-mono text-xs tabular-nums text-blue-400">
          {info} info
        </span>
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="font-mono text-[11px] text-emerald-600">LIVE MONITORING</span>
      </div>
    </div>
  )
}

// =============================================================================
// Main Page
// =============================================================================

export default function AlertsPage() {
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all")
  const [categoryFilter, setCategoryFilter] = useState<AlertCategory | "all">("all")

  const filtered = useMemo(() => {
    let items = [...MARKET_ALERTS]
    if (severityFilter !== "all") {
      items = items.filter((a) => a.severity === severityFilter)
    }
    if (categoryFilter !== "all") {
      items = items.filter((a) => a.category === categoryFilter)
    }
    return items
  }, [severityFilter, categoryFilter])

  const severityOptions: { key: Severity | "all"; label: string }[] = [
    { key: "all", label: "All" },
    { key: "critical", label: "Critical" },
    { key: "warning", label: "Warning" },
    { key: "info", label: "Info" },
  ]

  const categoryOptions: { key: AlertCategory | "all"; label: string }[] = [
    { key: "all", label: "All Types" },
    { key: "interest_rate", label: "Interest Rate" },
    { key: "fuel_price", label: "Fuel / Pricing" },
    { key: "model_launch", label: "Model Launch" },
    { key: "competitor", label: "Competitor" },
  ]

  return (
    <div className="space-y-3">
      {/* Header */}
      <Panel title="Market Alerts">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-emerald-500" />
          <span className="text-sm text-zinc-300">
            Real-time market events with AI impact analysis
          </span>
        </div>
      </Panel>

      {/* Quick Stats */}
      <QuickStatsBar />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-3.5 w-3.5 text-zinc-600" />
        {severityOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSeverityFilter(opt.key)}
            className={`rounded px-2.5 py-1 font-mono text-[11px] font-medium transition-colors ${
              severityFilter === opt.key
                ? "bg-emerald-900/50 text-emerald-400"
                : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
        <span className="text-zinc-800">|</span>
        {categoryOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setCategoryFilter(opt.key)}
            className={`rounded px-2.5 py-1 font-mono text-[11px] font-medium transition-colors ${
              categoryFilter === opt.key
                ? "bg-emerald-900/50 text-emerald-400"
                : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Alert Cards */}
      <div className="space-y-2">
        {filtered.length > 0 ? (
          filtered.map((alert) => <AlertCard key={alert.id} alert={alert} />)
        ) : (
          <div className="flex flex-col items-center gap-2 rounded border border-zinc-800/50 bg-[#0d1117] py-12">
            <AlertTriangle className="h-8 w-8 text-zinc-700" />
            <p className="text-sm text-zinc-500">No alerts match your filters</p>
            <button
              onClick={() => {
                setSeverityFilter("all")
                setCategoryFilter("all")
              }}
              className="font-mono text-xs text-emerald-600 hover:text-emerald-400"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-emerald-900/20 px-2 py-2">
        <span className="font-mono text-[10px] text-zinc-600">
          Source: SARB / DoE / NAAMSA / Visio Auto Intelligence
        </span>
        <span className="font-mono text-[10px] text-zinc-600">
          Monitoring active | Updated in real-time
        </span>
      </div>
    </div>
  )
}
