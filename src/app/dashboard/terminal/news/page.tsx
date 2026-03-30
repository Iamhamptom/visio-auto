"use client"

import { useState, useMemo } from "react"
import { Newspaper, Filter, ExternalLink, Share2, TrendingUp, Tag } from "lucide-react"
import { SA_AUTO_NEWS, type NewsItem } from "@/lib/newsletter/generator"

// =============================================================================
// Panel Wrapper (consistent with terminal styling)
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
// Filter Chips
// =============================================================================

type Category = "all" | "sales" | "regulation" | "technology" | "pricing"

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "all", label: "All" },
  { key: "sales", label: "Sales" },
  { key: "regulation", label: "Regulation" },
  { key: "technology", label: "Technology" },
  { key: "pricing", label: "Pricing" },
]

const BRANDS = ["Toyota", "Suzuki", "VW", "Hyundai", "Ford", "GWM", "Chery", "BYD", "Kia"]

// =============================================================================
// News Card
// =============================================================================

function NewsCard({ item }: { item: NewsItem }) {
  const categoryColors: Record<string, string> = {
    sales: "bg-emerald-900/40 text-emerald-400",
    regulation: "bg-blue-900/40 text-blue-400",
    technology: "bg-violet-900/40 text-violet-400",
    pricing: "bg-amber-900/40 text-amber-400",
  }

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(
      `${item.title}\n\n${item.summary}\n\nSource: ${item.source}\n\nShared via Visio Auto Intelligence`
    )
    window.open(`https://wa.me/?text=${text}`, "_blank")
  }

  return (
    <div className="group rounded border border-zinc-800/50 bg-[#0d1117] p-4 transition-colors hover:border-emerald-900/40">
      {/* Header row */}
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded px-2 py-0.5 font-mono text-[10px] font-semibold uppercase ${categoryColors[item.category] || "bg-zinc-800 text-zinc-400"}`}
          >
            {item.category}
          </span>
          {item.brands_mentioned.map((brand) => (
            <span
              key={brand}
              className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400"
            >
              {brand}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <span className="font-mono text-[10px] tabular-nums text-emerald-600">
            {item.relevance_score}%
          </span>
          <TrendingUp className="h-3 w-3 text-emerald-700" />
        </div>
      </div>

      {/* Title */}
      <h3 className="mb-1.5 font-mono text-sm font-semibold leading-snug text-zinc-100">
        {item.title}
      </h3>

      {/* Summary */}
      <p className="mb-3 text-[13px] leading-relaxed text-zinc-400">
        {item.summary}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] text-zinc-600">
          <span>{item.source}</span>
          <span>{item.date}</span>
        </div>
        <button
          onClick={shareToWhatsApp}
          className="flex items-center gap-1.5 rounded bg-emerald-900/30 px-2.5 py-1 font-mono text-[10px] font-semibold text-emerald-400 opacity-0 transition-opacity hover:bg-emerald-900/50 group-hover:opacity-100"
        >
          <Share2 className="h-3 w-3" />
          Share to WhatsApp
        </button>
      </div>
    </div>
  )
}

// =============================================================================
// Main Page
// =============================================================================

export default function NewsPage() {
  const [categoryFilter, setCategoryFilter] = useState<Category>("all")
  const [brandFilter, setBrandFilter] = useState<string | null>(null)

  const filteredNews = useMemo(() => {
    let items = [...SA_AUTO_NEWS]

    if (categoryFilter !== "all") {
      items = items.filter((n) => n.category === categoryFilter)
    }

    if (brandFilter) {
      items = items.filter((n) =>
        n.brands_mentioned.some((b) =>
          b.toLowerCase().includes(brandFilter.toLowerCase())
        )
      )
    }

    return items.sort((a, b) => b.relevance_score - a.relevance_score)
  }, [categoryFilter, brandFilter])

  return (
    <div className="space-y-3">
      {/* Header */}
      <Panel title="SA Automotive News Feed">
        <div className="flex items-center gap-2">
          <Newspaper className="h-4 w-4 text-emerald-500" />
          <span className="text-sm text-zinc-300">
            AI-curated news, scored for dealer relevance
          </span>
          <span className="ml-auto font-mono text-[11px] text-zinc-600">
            {filteredNews.length} articles
          </span>
        </div>
      </Panel>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Category filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-zinc-600" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategoryFilter(cat.key)}
              className={`rounded px-2.5 py-1 font-mono text-[11px] font-medium transition-colors ${
                categoryFilter === cat.key
                  ? "bg-emerald-900/50 text-emerald-400"
                  : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <span className="text-zinc-800">|</span>

        {/* Brand filter */}
        <div className="flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5 text-zinc-600" />
          <button
            onClick={() => setBrandFilter(null)}
            className={`rounded px-2 py-1 font-mono text-[11px] font-medium transition-colors ${
              !brandFilter
                ? "bg-emerald-900/50 text-emerald-400"
                : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            All Brands
          </button>
          {BRANDS.map((brand) => (
            <button
              key={brand}
              onClick={() => setBrandFilter(brandFilter === brand ? null : brand)}
              className={`rounded px-2 py-1 font-mono text-[11px] font-medium transition-colors ${
                brandFilter === brand
                  ? "bg-emerald-900/50 text-emerald-400"
                  : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* News Cards */}
      <div className="space-y-2">
        {filteredNews.length > 0 ? (
          filteredNews.map((item, i) => <NewsCard key={i} item={item} />)
        ) : (
          <div className="flex flex-col items-center gap-2 rounded border border-zinc-800/50 bg-[#0d1117] py-12">
            <Newspaper className="h-8 w-8 text-zinc-700" />
            <p className="text-sm text-zinc-500">
              No articles match your filters
            </p>
            <button
              onClick={() => {
                setCategoryFilter("all")
                setBrandFilter(null)
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
          Source: NAAMSA / Cars.co.za / TransUnion / DoE / Visio Auto Intelligence
        </span>
        <span className="font-mono text-[10px] text-zinc-600">
          Last updated: {new Date().toLocaleDateString("en-ZA")}
        </span>
      </div>
    </div>
  )
}
