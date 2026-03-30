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
// Mock social signals
// ---------------------------------------------------------------------------
const MOCK_SIGNALS: SocialSignal[] = [
  {
    id: 'soc-001', platform: 'tiktok', signal_type: 'comment_intent',
    person_name: null, person_handle: '@thabo_wheels',
    content: 'How much is this BMW 320d? Been looking for one in JHB area \u{1F525}',
    engagement_count: 12, sentiment: 'positive',
    brand_mentioned: 'BMW', model_mentioned: '320d',
    area_detected: 'Johannesburg', language: 'en', is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'soc-002', platform: 'tiktok', signal_type: 'comment_intent',
    person_name: null, person_handle: '@sandton_life',
    content: 'Which dealer in JHB has this GLC 300? Need one before December \u{1F64F}',
    engagement_count: 8, sentiment: 'positive',
    brand_mentioned: 'Mercedes-Benz', model_mentioned: 'GLC 300',
    area_detected: 'Sandton', language: 'en', is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: 'soc-003', platform: 'facebook', signal_type: 'group_post',
    person_name: 'Mpho Sithole', person_handle: null,
    content: 'Looking for a reliable SUV under R400K in Pretoria. Must be low mileage, 2022 or newer. Toyota or Hyundai preferred. DMs open.',
    engagement_count: 34, sentiment: 'neutral',
    brand_mentioned: 'Toyota', model_mentioned: null,
    area_detected: 'Pretoria', language: 'en', is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
  },
  {
    id: 'soc-004', platform: 'linkedin', signal_type: 'job_announcement',
    person_name: 'Zanele Mkhize', person_handle: '@zanele-mkhize',
    content: 'Excited to start my new role as Regional Manager at Deloitte Sandton! Looking forward to this next chapter. #NewBeginnings #Deloitte',
    engagement_count: 523, sentiment: 'positive',
    brand_mentioned: null, model_mentioned: null,
    area_detected: 'Sandton', language: 'en', is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
  },
  {
    id: 'soc-005', platform: 'instagram', signal_type: 'engagement_spike',
    person_name: null, person_handle: '@luxe_pretoria',
    content: 'Liked 5 posts from Pharoah Auto in the last 24 hours — browsing GLE, GLC, and C-Class models',
    engagement_count: 5, sentiment: 'positive',
    brand_mentioned: 'Mercedes-Benz', model_mentioned: 'GLE',
    area_detected: 'Pretoria', language: 'en', is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
  },
  {
    id: 'soc-006', platform: 'youtube', signal_type: 'comment_intent',
    person_name: null, person_handle: '@JHBCarGuy',
    content: 'That M4 is insane. Any SA dealers have stock? Budget around R1.2M. Gauteng area.',
    engagement_count: 6, sentiment: 'positive',
    brand_mentioned: 'BMW', model_mentioned: 'M4',
    area_detected: 'Gauteng', language: 'en', is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
  },
  {
    id: 'soc-007', platform: 'facebook', signal_type: 'marketplace_browse',
    person_name: 'Bongani Ndaba', person_handle: null,
    content: 'Browsing "Cars for Sale Gauteng" — viewed 12 Toyota Hilux listings in Centurion area in the last 3 days',
    engagement_count: 12, sentiment: 'neutral',
    brand_mentioned: 'Toyota', model_mentioned: 'Hilux',
    area_detected: 'Centurion', language: 'en', is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 100).toISOString(),
  },
  {
    id: 'soc-008', platform: 'tiktok', signal_type: 'comment_intent',
    person_name: null, person_handle: '@pta_girlie',
    content: 'I NEED this Polo GTI someone connect me with a dealer in PTA please!',
    engagement_count: 45, sentiment: 'positive',
    brand_mentioned: 'Volkswagen', model_mentioned: 'Polo GTI',
    area_detected: 'Pretoria', language: 'en', is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 115).toISOString(),
  },
  {
    id: 'soc-009', platform: 'linkedin', signal_type: 'company_update',
    person_name: null, person_handle: '@grindrod-logistics',
    content: 'Grindrod Logistics expanding operations in Gauteng. Hiring 15 new drivers and looking to add to our commercial fleet.',
    engagement_count: 89, sentiment: 'positive',
    brand_mentioned: null, model_mentioned: null,
    area_detected: 'Johannesburg', language: 'en', is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 130).toISOString(),
  },
  {
    id: 'soc-010', platform: 'instagram', signal_type: 'dm_inquiry',
    person_name: null, person_handle: '@real_estate_mogul_sa',
    content: 'DM to Audi Sandton: "Hi, what\'s the wait time on a new Q7? Need it by end of month."',
    engagement_count: 1, sentiment: 'positive',
    brand_mentioned: 'Audi', model_mentioned: 'Q7',
    area_detected: 'Sandton', language: 'en', is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 145).toISOString(),
  },
  {
    id: 'soc-011', platform: 'facebook', signal_type: 'group_post',
    person_name: 'Sarah Botha', person_handle: null,
    content: 'Any ladies in Randburg driving a Haval Jolion? Thinking of getting one for the school run. Pros and cons?',
    engagement_count: 67, sentiment: 'neutral',
    brand_mentioned: 'Haval', model_mentioned: 'Jolion',
    area_detected: 'Randburg', language: 'en', is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 160).toISOString(),
  },
  {
    id: 'soc-012', platform: 'youtube', signal_type: 'comment_intent',
    person_name: null, person_handle: '@SuperCarsSA_Fan',
    content: 'Just saw one of these Porsche Cayennes in Fourways. Price in SA? Looking to finance.',
    engagement_count: 3, sentiment: 'positive',
    brand_mentioned: 'Porsche', model_mentioned: 'Cayenne',
    area_detected: 'Fourways', language: 'en', is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 175).toISOString(),
  },
  {
    id: 'soc-013', platform: 'tiktok', signal_type: 'comment_intent',
    person_name: null, person_handle: '@mzansi_whips',
    content: 'Ford Ranger Raptor or Toyota Hilux GR-S? Pretoria dealers, drop your prices below',
    engagement_count: 156, sentiment: 'positive',
    brand_mentioned: 'Ford', model_mentioned: 'Ranger Raptor',
    area_detected: 'Pretoria', language: 'en', is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 190).toISOString(),
  },
  {
    id: 'soc-014', platform: 'facebook', signal_type: 'group_post',
    person_name: 'Tshepo Mokoena', person_handle: null,
    content: 'Just sold my house in Benoni, moving to Midstream Estate. Need a good car for the N1 commute. Budget R500-700K. SUV or crossover.',
    engagement_count: 22, sentiment: 'neutral',
    brand_mentioned: null, model_mentioned: null,
    area_detected: 'Midstream', language: 'en', is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
  },
  {
    id: 'soc-015', platform: 'instagram', signal_type: 'story_mention',
    person_name: null, person_handle: '@jozi_entrepreneur',
    content: 'Story post: Test driving at BMW Sandton today! Looking at the new X1. Thoughts?',
    engagement_count: 89, sentiment: 'positive',
    brand_mentioned: 'BMW', model_mentioned: 'X1',
    area_detected: 'Sandton', language: 'en', is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 225).toISOString(),
  },
  {
    id: 'soc-016', platform: 'linkedin', signal_type: 'job_announcement',
    person_name: 'David Chen', person_handle: '@david-chen-sa',
    content: 'Relocating to Johannesburg from Hong Kong to lead the APAC expansion at Investec. Looking for housing in Sandton area.',
    engagement_count: 234, sentiment: 'positive',
    brand_mentioned: null, model_mentioned: null,
    area_detected: 'Sandton', language: 'en', is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 250).toISOString(),
  },
  {
    id: 'soc-017', platform: 'tiktok', signal_type: 'comment_intent',
    person_name: null, person_handle: '@nurse_nomsa',
    content: 'Starting at Netcare Milpark next month, finally getting my own car! Any reliable hatches under R250K?',
    engagement_count: 31, sentiment: 'positive',
    brand_mentioned: null, model_mentioned: null,
    area_detected: 'Johannesburg', language: 'en', is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 270).toISOString(),
  },
  {
    id: 'soc-018', platform: 'youtube', signal_type: 'comment_intent',
    person_name: null, person_handle: '@BakkieBoss_GP',
    content: 'Need this Isuzu D-Max for my plumbing business in Boksburg. Anyone know what deposit I need?',
    engagement_count: 7, sentiment: 'positive',
    brand_mentioned: 'Isuzu', model_mentioned: 'D-Max',
    area_detected: 'Boksburg', language: 'en', is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 290).toISOString(),
  },
  {
    id: 'soc-019', platform: 'facebook', signal_type: 'review_request',
    person_name: 'Fatima Patel', person_handle: null,
    content: 'Looking for honest reviews on Chery Tiggo 4 Pro. Husband says Chinese cars are unreliable but the price is right. We are in Laudium.',
    engagement_count: 143, sentiment: 'neutral',
    brand_mentioned: 'Chery', model_mentioned: 'Tiggo 4 Pro',
    area_detected: 'Laudium', language: 'en', is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 310).toISOString(),
  },
  {
    id: 'soc-020', platform: 'instagram', signal_type: 'engagement_spike',
    person_name: null, person_handle: '@ceo_of_levelling_up',
    content: 'Saved 8 Range Rover Sport posts from AutoTrader SA. Engaging with luxury car content daily for 2 weeks.',
    engagement_count: 8, sentiment: 'positive',
    brand_mentioned: 'Land Rover', model_mentioned: 'Range Rover Sport',
    area_detected: 'Johannesburg', language: 'en', is_processed: false,
    created_at: new Date(Date.now() - 1000 * 60 * 330).toISOString(),
  },
]

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
  const [allSignals, setAllSignals] = useState<SocialSignal[]>(MOCK_SIGNALS)
  const [loading, setLoading] = useState(true)
  const [platformFilter, setPlatformFilter] = useState<string>('all')

  useEffect(() => {
    const params = new URLSearchParams()
    if (platformFilter !== 'all') params.set('platform', platformFilter)
    const url = `/api/social${params.toString() ? `?${params}` : ''}`
    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        const rows = json.data ?? json.signals ?? []
        if (rows.length > 0) setAllSignals(rows)
      })
      .catch(() => {/* keep mock */})
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

          {filtered.length === 0 && (
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
