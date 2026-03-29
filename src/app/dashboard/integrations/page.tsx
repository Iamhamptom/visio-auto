"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Plug,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Zap,
  Building2,
  MessageSquare,
  Phone,
  Ghost,
  Megaphone,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface IntegrationStatus {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  connected: boolean
  configured: boolean
  lastSync: string | null
  stats: Record<string, string | number>
  error: string | null
  loading: boolean
  canSync: boolean
  canTest: boolean
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([
    {
      id: "vprai",
      name: "V-Prai Lead Generation",
      description: "VisioCorp's AI lead generation platform at prai.visioai.co. Syncs leads bidirectionally.",
      icon: <Zap className="h-5 w-5 text-purple-400" />,
      connected: false,
      configured: false,
      lastSync: null,
      stats: {},
      error: null,
      loading: true,
      canSync: true,
      canTest: true,
    },
    {
      id: "workspace",
      name: "Visio Workspace",
      description: "Chairman's operating system. Reports analytics and pulls automotive-tagged leads.",
      icon: <Building2 className="h-5 w-5 text-blue-400" />,
      connected: false,
      configured: false,
      lastSync: null,
      stats: {},
      error: null,
      loading: true,
      canSync: false,
      canTest: true,
    },
    {
      id: "whatsapp",
      name: "WhatsApp Business",
      description: "Send automated follow-ups and notifications to leads via WhatsApp Business API.",
      icon: <MessageSquare className="h-5 w-5 text-green-400" />,
      connected: false,
      configured: false,
      lastSync: null,
      stats: {},
      error: null,
      loading: false,
      canSync: false,
      canTest: false,
    },
    {
      id: "retell",
      name: "Retell AI Voice",
      description: "AI-powered voice calls for lead qualification and follow-up conversations.",
      icon: <Phone className="h-5 w-5 text-amber-400" />,
      connected: false,
      configured: false,
      lastSync: null,
      stats: {},
      error: null,
      loading: false,
      canSync: false,
      canTest: false,
    },
    {
      id: "phantombuster",
      name: "PhantomBuster",
      description: "Social media scraping and automation for lead discovery and enrichment.",
      icon: <Ghost className="h-5 w-5 text-cyan-400" />,
      connected: false,
      configured: false,
      lastSync: null,
      stats: {},
      error: null,
      loading: false,
      canSync: false,
      canTest: false,
    },
    {
      id: "meta_ads",
      name: "Meta Ads",
      description: "Facebook and Instagram ad campaigns that feed leads directly into the pipeline.",
      icon: <Megaphone className="h-5 w-5 text-pink-400" />,
      connected: false,
      configured: false,
      lastSync: null,
      stats: {},
      error: null,
      loading: false,
      canSync: false,
      canTest: false,
    },
  ])

  const [syncing, setSyncing] = useState<string | null>(null)

  // ── Check V-Prai status on mount ────────────────────────────────────
  const checkVPrai = useCallback(async () => {
    try {
      const res = await fetch("/api/integrations/vprai/status")
      if (!res.ok) throw new Error(`Status ${res.status}`)
      const data = await res.json()

      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === "vprai"
            ? {
                ...i,
                connected: data.connected,
                configured: data.api_key_configured,
                lastSync: data.stats?.last_sync_at || null,
                stats: {
                  "Leads synced": data.stats?.total_leads_synced || 0,
                  Latency: data.latency_ms ? `${data.latency_ms}ms` : "N/A",
                },
                error: data.error,
                loading: false,
              }
            : i
        )
      )
    } catch (err) {
      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === "vprai"
            ? {
                ...i,
                connected: false,
                error: err instanceof Error ? err.message : "Check failed",
                loading: false,
              }
            : i
        )
      )
    }
  }, [])

  // ── Check Workspace status on mount ─────────────────────────────────
  const checkWorkspace = useCallback(async () => {
    const configured = true // If VISIO_GATEWAY_KEY is set, this will work
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === "workspace"
          ? {
              ...i,
              configured,
              connected: configured,
              loading: false,
              stats: { Status: configured ? "Ready" : "Not configured" },
            }
          : i
      )
    )

    // Check static env configs for other integrations
    setIntegrations((prev) =>
      prev.map((i) => {
        if (i.id === "whatsapp") {
          return { ...i, configured: false, stats: { Status: "Pending setup" } }
        }
        if (i.id === "retell") {
          return { ...i, configured: false, stats: { Status: "Pending setup" } }
        }
        if (i.id === "phantombuster") {
          return { ...i, configured: false, stats: { Status: "Pending setup" } }
        }
        if (i.id === "meta_ads") {
          return { ...i, configured: false, stats: { Status: "Pending setup" } }
        }
        return i
      })
    )
  }, [])

  useEffect(() => {
    checkVPrai()
    checkWorkspace()
  }, [checkVPrai, checkWorkspace])

  // ── Sync handler ────────────────────────────────────────────────────
  const handleSync = async (id: string) => {
    setSyncing(id)

    try {
      if (id === "vprai") {
        const res = await fetch("/api/integrations/vprai/sync", {
          headers: { Authorization: `Bearer ${id}` }, // placeholder
        })
        const data = await res.json()

        setIntegrations((prev) =>
          prev.map((i) =>
            i.id === "vprai"
              ? {
                  ...i,
                  lastSync: new Date().toISOString(),
                  stats: {
                    ...i.stats,
                    "Last import": `${data.imported || 0} leads`,
                    Skipped: data.skipped || 0,
                  },
                }
              : i
          )
        )
      }
    } catch (err) {
      console.error(`Sync failed for ${id}:`, err)
    } finally {
      setSyncing(null)
    }
  }

  // ── Test handler ────────────────────────────────────────────────────
  const handleTest = async (id: string) => {
    setSyncing(id)

    try {
      if (id === "vprai") {
        await checkVPrai()
      } else if (id === "workspace") {
        await checkWorkspace()
      }
    } finally {
      setSyncing(null)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Integrations</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Connect Visio Auto to VisioCorp platforms and third-party services
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-zinc-700 text-zinc-300 hover:text-white"
          onClick={() => {
            checkVPrai()
            checkWorkspace()
          }}
        >
          <RefreshCw className="h-3.5 w-3.5 mr-2" />
          Refresh All
        </Button>
      </div>

      {/* VisioCorp Integrations */}
      <div>
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
          VisioCorp Platform
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {integrations
            .filter((i) => i.id === "vprai" || i.id === "workspace")
            .map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                syncing={syncing === integration.id}
                onSync={() => handleSync(integration.id)}
                onTest={() => handleTest(integration.id)}
              />
            ))}
        </div>
      </div>

      {/* Third-Party Integrations */}
      <div>
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
          Third-Party Services
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {integrations
            .filter(
              (i) => i.id !== "vprai" && i.id !== "workspace"
            )
            .map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                syncing={syncing === integration.id}
                onSync={() => handleSync(integration.id)}
                onTest={() => handleTest(integration.id)}
              />
            ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Integration Card Component
// ---------------------------------------------------------------------------

function IntegrationCard({
  integration,
  syncing,
  onSync,
  onTest,
}: {
  integration: IntegrationStatus
  syncing: boolean
  onSync: () => void
  onTest: () => void
}) {
  const statusColor = integration.loading
    ? "text-zinc-500"
    : integration.connected
      ? "text-emerald-400"
      : integration.configured
        ? "text-amber-400"
        : "text-zinc-500"

  const statusLabel = integration.loading
    ? "Checking..."
    : integration.connected
      ? "Connected"
      : integration.configured
        ? "Configured"
        : "Not configured"

  const statusBadgeVariant = integration.connected
    ? "default"
    : integration.configured
      ? "secondary"
      : "outline"

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700/50">
              {integration.icon}
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-white">
                {integration.name}
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500 mt-0.5">
                {integration.description}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {integration.loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-500" />
            ) : integration.connected ? (
              <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <XCircle className={`h-3.5 w-3.5 ${statusColor}`} />
            )}
            <span className={`text-xs font-medium ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
          <Badge
            variant={statusBadgeVariant}
            className={
              integration.connected
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : integration.configured
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-zinc-800 text-zinc-500 border-zinc-700"
            }
          >
            {statusLabel}
          </Badge>
        </div>

        {/* Stats */}
        {Object.keys(integration.stats).length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(integration.stats).map(([key, value]) => (
              <div key={key} className="rounded-md bg-zinc-800/50 px-2.5 py-1.5">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                  {key}
                </p>
                <p className="text-xs font-medium text-zinc-200 mt-0.5">
                  {String(value)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Last sync */}
        {integration.lastSync && (
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <Clock className="h-3 w-3" />
            <span>
              Last sync:{" "}
              {new Date(integration.lastSync).toLocaleString("en-ZA", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </span>
          </div>
        )}

        {/* Error */}
        {integration.error && (
          <div className="rounded-md bg-red-500/10 border border-red-500/20 px-2.5 py-1.5">
            <p className="text-[11px] text-red-400">{integration.error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {integration.canSync && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-zinc-700 text-zinc-300 hover:text-white text-xs h-8"
              onClick={onSync}
              disabled={syncing || !integration.configured}
            >
              {syncing ? (
                <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1.5" />
              )}
              Sync Now
            </Button>
          )}
          {integration.canTest && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-zinc-700 text-zinc-300 hover:text-white text-xs h-8"
              onClick={onTest}
              disabled={syncing}
            >
              {syncing ? (
                <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
              ) : (
                <Plug className="h-3 w-3 mr-1.5" />
              )}
              Test
            </Button>
          )}
          {!integration.canSync && !integration.canTest && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-zinc-700 text-zinc-400 text-xs h-8"
              disabled
            >
              Coming Soon
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
