'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  ArrowRight, MessageCircle, Hash, TrendingUp,
  Video, Globe, Camera, Briefcase, Play,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { SocialSignal, SocialPlatform } from '@/lib/types'

// ---------------------------------------------------------------------------
// Platform config
// ---------------------------------------------------------------------------
const PLATFORM_CONFIG: Record<SocialPlatform, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  tiktok: { label: 'TikTok', icon: Video, color: 'text-pink-400' },
  facebook: { label: 'Facebook', icon: Globe, color: 'text-blue-400' },
  instagram: { label: 'Instagram', icon: Camera, color: 'text-fuchsia-400' },
  linkedin: { label: 'LinkedIn', icon: Briefcase, color: 'text-sky-400' },
  youtube: { label: 'YouTube', icon: Play, color: 'text-red-400' },
  twitter: { label: 'X / Twitter', icon: Hash, color: 'text-zinc-400' },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function sentimentBadge(sentiment: string) {
  switch (sentiment) {
    case 'positive':
      return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">Positive</Badge>
    case 'negative':
      return <Badge className="bg-red-500/15 text-red-400 border-red-500/30">Negative</Badge>
    default:
      return <Badge className="bg-zinc-500/15 text-zinc-400 border-zinc-500/30">Neutral</Badge>
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function SocialRadarPage() {
  const [allSignals, setAllSignals] = useState<SocialSignal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [integrationReady, setIntegrationReady] = useState(false)
  const [platformFilter, setPlatformFilter] = useState<string>('all')

  useEffect(() => {
    const params = new URLSearchParams()
    if (platformFilter !== 'all') params.set('platform', platformFilter)
    const url = `/api/social${params.toString() ? `?${params}` : ''}`
    setLoading(true)
    setError(null)
    fetch(url)
      .then(async (r) => {
        if (r.status === 503) {
          setIntegrationReady(false)
          return { signals: [] }
        }
        if (!r.ok) throw new Error(`Social fetch failed (${r.status})`)
        setIntegrationReady(true)
        return r.json()
      })
      .then((json) => setAllSignals(json.data ?? json.signals ?? []))
      .catch((err: Error) => {
        setError(err.message)
        setAllSignals([])
      })
      .finally(() => setLoading(false))
  }, [platformFilter])

  const filtered = useMemo(() => {
    if (platformFilter === 'all') return allSignals
    return allSignals.filter((s) => s.platform === platformFilter)
  }, [platformFilter, allSignals])

  // Platform stats
  const platformStats = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const s of allSignals) {
      counts[s.platform] = (counts[s.platform] || 0) + 1
    }
    return counts
  }, [allSignals])

  // Trending brands
  const trendingBrands = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const s of allSignals) {
      if (s.brand_mentioned) counts[s.brand_mentioned] = (counts[s.brand_mentioned] || 0) + 1
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
  }, [allSignals])

  // Trending models
  const trendingModels = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const s of allSignals) {
      if (s.model_mentioned) counts[s.model_mentioned] = (counts[s.model_mentioned] || 0) + 1
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
  }, [allSignals])

  const totalSignals = allSignals.length

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Social Radar</h1>
        <p className="text-muted-foreground mt-1">
          Monitor buying intent signals across social media platforms in real time.
        </p>
      </div>

      {/* Platform stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {(Object.entries(PLATFORM_CONFIG) as [SocialPlatform, typeof PLATFORM_CONFIG[SocialPlatform]][]).map(([key, cfg]) => {
          const count = platformStats[key] || 0
          const pct = totalSignals > 0 ? Math.round((count / totalSignals) * 100) : 0
          const PIcon = cfg.icon
          return (
            <Card key={key} className="bg-card border-border">
              <CardContent className="py-4">
                <div className="flex items-center gap-2 mb-2">
                  <PIcon className={`h-4 w-4 ${cfg.color}`} />
                  <span className="text-sm font-medium">{cfg.label}</span>
                </div>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">{pct}% of signals</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Platform tabs */}
      <Tabs value={platformFilter} onValueChange={setPlatformFilter} className="mb-6">
        <TabsList className="bg-zinc-900 border border-border">
          <TabsTrigger value="all">All ({totalSignals})</TabsTrigger>
          {(Object.entries(PLATFORM_CONFIG) as [SocialPlatform, typeof PLATFORM_CONFIG[SocialPlatform]][]).map(([key, cfg]) => (
            <TabsTrigger key={key} value={key}>
              {cfg.label} ({platformStats[key] || 0})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Signal stream */}
        <div className="space-y-3">
          {filtered.map((signal) => {
            const cfg = PLATFORM_CONFIG[signal.platform]
            const PIcon = cfg.icon
            return (
              <Card key={signal.id} className="bg-card border-border hover:border-emerald-500/30 transition-colors">
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    {/* Platform icon */}
                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800 ${cfg.color}`}>
                      <PIcon className="h-4.5 w-4.5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
                        <span className="text-sm text-muted-foreground">
                          {signal.person_handle ?? signal.person_name ?? 'Anonymous'}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto shrink-0">{timeAgo(signal.created_at)}</span>
                      </div>

                      <p className="text-sm mb-3 leading-relaxed">{signal.content}</p>

                      {/* Metadata badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        {sentimentBadge(signal.sentiment)}
                        {signal.brand_mentioned && (
                          <Badge variant="outline" className="text-xs">{signal.brand_mentioned}</Badge>
                        )}
                        {signal.model_mentioned && (
                          <Badge variant="outline" className="text-xs">{signal.model_mentioned}</Badge>
                        )}
                        {signal.area_detected && (
                          <Badge variant="outline" className="text-xs">{signal.area_detected}</Badge>
                        )}
                        {signal.engagement_count > 0 && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {signal.engagement_count}
                          </span>
                        )}

                        {/* Convert button */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="ml-auto border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                          onClick={async () => {
                            try {
                              await fetch('/api/signals', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  signal_type: 'social_intent',
                                  title: `Social: ${signal.content?.substring(0, 60)}`,
                                  description: signal.content,
                                  person_name: signal.person_name || signal.person_handle,
                                  area: signal.area_detected,
                                  data_source: signal.platform,
                                  signal_strength: 'medium',
                                  buying_probability: 55,
                                  brand_mentioned: signal.brand_mentioned,
                                }),
                              })
                              setAllSignals((prev) => prev.map((s) => s.id === signal.id ? { ...s, is_processed: true } : s))
                            } catch { /* keep current state */ }
                          }}
                          disabled={signal.is_processed}
                        >
                          {signal.is_processed ? 'Converted' : 'Convert to Signal'} <ArrowRight className="ml-1.5 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {loading && (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center text-muted-foreground">
                Loading social signals…
              </CardContent>
            </Card>
          )}
          {!loading && error && (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center text-red-400">
                Could not load — {error}
              </CardContent>
            </Card>
          )}
          {!loading && !error && !integrationReady && filtered.length === 0 && (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center text-muted-foreground space-y-2">
                <p className="text-white/70 text-sm">Social radar is not yet connected in this workspace.</p>
                <p className="text-xs">We&apos;re still wiring TikTok / Facebook / LinkedIn scrapers. Until it&apos;s live we won&apos;t show simulated posts here — empty is honest.</p>
              </CardContent>
            </Card>
          )}
          {!loading && !error && integrationReady && filtered.length === 0 && (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center text-muted-foreground">
                No social signals on this platform yet.
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right sidebar: Trending */}
        <div className="space-y-4">
          {/* Trending brands */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                Trending Brands
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {trendingBrands.map(([brand, count], i) => (
                <div key={brand} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground w-4 text-right text-xs">{i + 1}.</span>
                    {brand}
                  </span>
                  <Badge variant="secondary" className="text-xs">{count} mentions</Badge>
                </div>
              ))}
              {trendingBrands.length === 0 && (
                <p className="text-sm text-muted-foreground">No brand mentions yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Trending models */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-sky-400" />
                Trending Models
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {trendingModels.map(([model, count], i) => (
                <div key={model} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground w-4 text-right text-xs">{i + 1}.</span>
                    {model}
                  </span>
                  <Badge variant="secondary" className="text-xs">{count} mentions</Badge>
                </div>
              ))}
              {trendingModels.length === 0 && (
                <p className="text-sm text-muted-foreground">No model mentions yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Platform distribution */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Platform Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(Object.entries(PLATFORM_CONFIG) as [SocialPlatform, typeof PLATFORM_CONFIG[SocialPlatform]][]).map(([key, cfg]) => {
                const count = platformStats[key] || 0
                const pct = totalSignals > 0 ? Math.round((count / totalSignals) * 100) : 0
                const PIcon = cfg.icon
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <PIcon className={`h-3.5 w-3.5 ${cfg.color}`} />
                        {cfg.label}
                      </span>
                      <span className="text-muted-foreground text-xs">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
