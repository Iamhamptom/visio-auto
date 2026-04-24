'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Briefcase, UserPlus, TrendingUp, Users, UserCheck,
  Baby, Heart, GraduationCap, Cake, KeyRound,
  Banknote, FileCheck, Truck, MapPin, Plane, Home, Building,
  Clock, Shield, Percent, Wallet, Store, MessageCircle, Zap,
  ArrowRight, Filter, Search,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SIGNAL_CATEGORIES, SIGNAL_TYPE_MAP } from '@/lib/signals/types'
import type { Signal, SignalType } from '@/lib/types'

// ---------------------------------------------------------------------------
// Icon map
// ---------------------------------------------------------------------------
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Briefcase, UserPlus, TrendingUp, Users, UserCheck,
  Baby, Heart, GraduationCap, Cake, KeyRound,
  Banknote, FileCheck, Truck, MapPin, Plane, Home, Building,
  Clock, Shield, Percent, Wallet, Store, MessageCircle, Zap,
}

function SignalIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? Zap
  return <Icon className={className} />
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function strengthBadge(strength: string) {
  switch (strength) {
    case 'strong':
      return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">Strong</Badge>
    case 'medium':
      return <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/20">Medium</Badge>
    default:
      return <Badge className="bg-zinc-500/15 text-zinc-400 border-zinc-500/30 hover:bg-zinc-500/20">Weak</Badge>
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

function formatBudget(min: number | null, max: number | null) {
  const fmt = (n: number) => {
    if (n >= 1000000) return `R${(n / 1000000).toFixed(1)}M`
    return `R${(n / 1000).toFixed(0)}K`
  }
  if (min && max) return `${fmt(min)} — ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  if (max) return `Up to ${fmt(max)}`
  return null
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function SignalsPage() {
  const [allSignals, setAllSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [strengthFilter, setStrengthFilter] = useState<string>('all')
  const [areaSearch, setAreaSearch] = useState('')

  useEffect(() => {
    const params = new URLSearchParams()
    if (typeFilter !== 'all') params.set('signal_type', typeFilter)
    if (strengthFilter !== 'all') params.set('signal_strength', strengthFilter)
    const url = `/api/signals${params.toString() ? `?${params}` : ''}`
    setLoading(true)
    setError(null)
    fetch(url)
      .then(async (r) => {
        if (!r.ok) throw new Error(`Signal fetch failed (${r.status})`)
        return r.json()
      })
      .then((json) => setAllSignals(json.data ?? json.signals ?? []))
      .catch((err: Error) => {
        setError(err.message)
        setAllSignals([])
      })
      .finally(() => setLoading(false))
  }, [typeFilter, strengthFilter])

  const filtered = useMemo(() => {
    let list = allSignals
    if (typeFilter !== 'all') list = list.filter((s) => s.signal_type === typeFilter)
    if (strengthFilter !== 'all') list = list.filter((s) => s.signal_strength === strengthFilter)
    if (areaSearch) list = list.filter((s) => s.area?.toLowerCase().includes(areaSearch.toLowerCase()))
    return list
  }, [allSignals, typeFilter, strengthFilter, areaSearch])

  const stats = useMemo(() => {
    const total = allSignals.length
    const strong = allSignals.filter((s) => s.signal_strength === 'strong').length
    const converted = allSignals.filter((s) => s.converted_to_lead_id).length
    const rate = total > 0 ? Math.round((converted / total) * 100) : 0
    return { total, strong, converted, rate }
  }, [allSignals])

  // Category counts for sidebar
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const s of allSignals) {
      counts[s.signal_type] = (counts[s.signal_type] || 0) + 1
    }
    return counts
  }, [allSignals])

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Signal Engine</h1>
        <p className="text-muted-foreground mt-1">
          Real-time buying signals detected across Gauteng — life events, career moves, business registrations, and more.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Signals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Today: 4 / Week: 11 / Month: {stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Strong Signals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-400">{stats.strong}</div>
            <p className="text-xs text-muted-foreground mt-1">{Math.round((stats.strong / stats.total) * 100)}% of total</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Converted to Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-sky-400">{stats.converted}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting conversion</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.rate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Signal-to-lead</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter bar */}
      <Card className="mb-6 bg-card border-border">
        <CardContent className="flex flex-wrap items-center gap-3 py-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? 'all')}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Signal Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {SIGNAL_CATEGORIES.flatMap((cat) =>
                cat.types.map((t) => (
                  <SelectItem key={t.type} value={t.type}>
                    {t.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Select value={strengthFilter} onValueChange={(v) => setStrengthFilter(v ?? 'all')}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Strength" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Strengths</SelectItem>
              <SelectItem value="strong">Strong</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="weak">Weak</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search area..."
              value={areaSearch}
              onChange={(e) => setAreaSearch(e.target.value)}
              className="pl-9 w-[180px]"
            />
          </div>
          <span className="text-sm text-muted-foreground ml-auto">{filtered.length} signals</span>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Signal feed */}
        <div className="space-y-4">
          {filtered.map((signal) => {
            const def = SIGNAL_TYPE_MAP[signal.signal_type]
            const budget = formatBudget(signal.estimated_budget_min, signal.estimated_budget_max)
            return (
              <Card key={signal.id} className="bg-card border-border hover:border-emerald-500/30 transition-colors">
                <CardContent className="py-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 ${def?.color ?? 'text-zinc-400'}`}>
                      <SignalIcon name={def?.icon ?? 'Zap'} className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className="font-semibold leading-tight">{signal.title}</h3>
                        <span className="text-xs text-muted-foreground shrink-0">{timeAgo(signal.created_at)}</span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">{signal.description}</p>

                      {/* Person / company info */}
                      {(signal.person_name || signal.company_name) && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
                          {signal.person_name && <span>Contact: <span className="text-foreground">{signal.person_name}</span></span>}
                          {signal.company_name && <span>Company: <span className="text-foreground">{signal.company_name}</span></span>}
                          {signal.area && <span>Area: <span className="text-foreground">{signal.area}, {signal.city}</span></span>}
                          {signal.person_phone && <span>Phone: <span className="text-foreground">{signal.person_phone}</span></span>}
                        </div>
                      )}

                      {/* Badges + probability */}
                      <div className="flex flex-wrap items-center gap-3">
                        {strengthBadge(signal.signal_strength)}
                        <Badge variant="outline" className="text-xs">{def?.label ?? signal.signal_type}</Badge>
                        {budget && <Badge variant="outline" className="text-xs">{budget}</Badge>}
                        {signal.vehicle_type_likely && (
                          <Badge variant="outline" className="text-xs capitalize">{signal.vehicle_type_likely}</Badge>
                        )}

                        {/* Buying probability */}
                        <div className="flex items-center gap-2 ml-auto">
                          <span className="text-xs text-muted-foreground">Buy prob.</span>
                          <div className="w-24">
                            <Progress
                              value={signal.buying_probability}
                              className="h-2 [&>div]:bg-emerald-500"
                            />
                          </div>
                          <span className="text-xs font-medium w-8 text-right">{signal.buying_probability}%</span>
                        </div>
                      </div>

                      {/* Convert button */}
                      {!signal.converted_to_lead_id && (
                        <div className="mt-4 flex justify-end">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => {
                              fetch('/api/signals/convert', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ signal_id: signal.id }),
                              })
                                .then((r) => r.json())
                                .then((json) => {
                                  if (json.lead_id || json.data?.id) {
                                    setAllSignals((prev) =>
                                      prev.map((s) =>
                                        s.id === signal.id
                                          ? { ...s, converted_to_lead_id: json.lead_id ?? json.data?.id }
                                          : s
                                      )
                                    )
                                  }
                                })
                                .catch(() => {/* ignore */})
                            }}
                          >
                            Convert to Lead <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {filtered.length === 0 && (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center text-muted-foreground">
                No signals match your filters. Try broadening your search.
              </CardContent>
            </Card>
          )}
        </div>

        {/* Categories sidebar */}
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Signal Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {SIGNAL_CATEGORIES.map((cat) => (
                <div key={cat.key}>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{cat.label}</h4>
                  <div className="space-y-1">
                    {cat.types.map((t) => {
                      const count = categoryCounts[t.type] || 0
                      return (
                        <button
                          key={t.type}
                          onClick={() => setTypeFilter(typeFilter === t.type ? 'all' : t.type)}
                          className={`flex items-center justify-between w-full rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-zinc-800 ${
                            typeFilter === t.type ? 'bg-zinc-800 text-emerald-400' : 'text-foreground'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <SignalIcon name={t.icon} className={`h-3.5 w-3.5 ${t.color}`} />
                            {t.label}
                          </span>
                          {count > 0 && (
                            <Badge variant="secondary" className="text-[10px] h-5 min-w-5 justify-center">
                              {count}
                            </Badge>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
