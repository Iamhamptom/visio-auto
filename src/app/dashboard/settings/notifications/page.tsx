"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, XCircle, Loader2, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PendingLead {
  id: string;
  name: string;
  phone: string;
  ai_score: number;
  score_tier: "hot" | "warm" | "cold";
  source: string;
  area: string;
  city: string;
  preferred_brand: string | null;
  oem_pass_through: boolean;
  oem_brand_detected: string | null;
  created_at: string;
  assigned_dealer_id: string | null;
}

export default function NotificationsSettingsPage() {
  const [pending, setPending] = useState<PendingLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadPending() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications/pending");
      if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
      const json = await res.json();
      setPending(json.pending ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPending();
  }, []);

  async function act(leadId: string, action: "approve" | "skip") {
    setActing(leadId);
    try {
      const res = await fetch("/api/notifications/pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: leadId, action }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Action failed");
      }
      setPending((prev) => prev.filter((p) => p.id !== leadId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActing(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
          <Bell className="h-5 w-5 text-emerald-400" /> Notification approvals
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Per Visio Auto policy, dealer alerts are queued for approval before any WhatsApp or email fires. Review the queue below, approve to send, or skip to drop.
        </p>
      </div>

      <Card className="border-amber-500/20 bg-amber-500/[0.03]">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-4 w-4 text-amber-400 mt-0.5" />
            <div className="text-xs text-amber-200/80 space-y-1">
              <p>
                <span className="font-mono uppercase tracking-wider text-[10px] text-amber-400">
                  Auto-notify gate
                </span>{" "}
                is currently <span className="font-mono">{process.env.NEXT_PUBLIC_AUTO_NOTIFY_DISPLAY ?? "OFF"}</span>.
                Set <code>AUTO_NOTIFY_ENABLED=true</code> on the server to let high-score leads notify dealers automatically.
              </p>
              <p className="text-amber-200/60">
                Even with the gate on, cold leads always go through this queue — never auto-fired.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-zinc-800/50 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-sm text-white flex items-center justify-between">
            <span>Pending queue ({pending.length})</span>
            <Button
              size="sm"
              variant="outline"
              onClick={loadPending}
              disabled={loading}
              className="text-xs"
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Refresh"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="text-center py-12 text-zinc-500 text-sm">
              <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> Loading queue…
            </div>
          )}
          {!loading && error && (
            <p className="text-sm text-red-400 py-8 text-center">{error}</p>
          )}
          {!loading && !error && pending.length === 0 && (
            <p className="text-sm text-zinc-500 py-12 text-center">
              No pending approvals. New leads will appear here when they need a human review.
            </p>
          )}
          {!loading && pending.length > 0 && (
            <div className="space-y-2">
              {pending.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-3 border border-white/[0.06] rounded-md bg-white/[0.01]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/leads/${lead.id}`}
                        className="text-sm font-medium text-white hover:text-emerald-400"
                      >
                        {lead.name}
                      </Link>
                      <TierBadge tier={lead.score_tier} score={lead.ai_score} />
                      {lead.oem_pass_through && lead.oem_brand_detected && (
                        <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400 border border-amber-500/30 px-1.5 py-0.5">
                          OEM: {lead.oem_brand_detected}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-1 truncate">
                      {lead.preferred_brand ?? "Any brand"} · {lead.area}, {lead.city} · via {lead.source}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={acting === lead.id}
                      onClick={() => act(lead.id, "skip")}
                      className="text-xs border-zinc-700"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Skip
                    </Button>
                    <Button
                      size="sm"
                      disabled={acting === lead.id}
                      onClick={() => act(lead.id, "approve")}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {acting === lead.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Approve & send
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TierBadge({ tier, score }: { tier: "hot" | "warm" | "cold"; score: number }) {
  const styles = {
    hot: "bg-red-500/15 text-red-400 border-red-500/30",
    warm: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    cold: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  };
  return (
    <span className={`font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 border ${styles[tier]}`}>
      {tier} {score}
    </span>
  );
}
