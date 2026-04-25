"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  DollarSign,
  Car,
  User,
  CreditCard,
  Clock,
  Star,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface LeadDetail {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  whatsapp?: string | null;
  area?: string | null;
  city?: string | null;
  province?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  preferred_brand?: string | null;
  preferred_model?: string | null;
  preferred_type?: string | null;
  new_or_used?: string | null;
  has_trade_in?: boolean | null;
  trade_in_brand?: string | null;
  trade_in_model?: string | null;
  trade_in_year?: number | null;
  timeline?: string | null;
  finance_status?: string | null;
  ai_score: number;
  score_tier: "hot" | "warm" | "cold";
  source?: string | null;
  language?: string | null;
  status: string;
  created_at?: string;
  contacted_at?: string | null;
  test_drive_at?: string | null;
  oem_pass_through?: boolean;
  oem_brand_detected?: string | null;
}

interface MatchedVehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  match_score: number;
  features?: string[];
  color?: string | null;
  mileage?: number | null;
  condition?: string | null;
  vin?: string | null;
  variant?: string | null;
}

function formatRand(amount: number | null | undefined) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function scoreBadge(tier: string, score: number) {
  const styles: Record<string, string> = {
    hot: "bg-red-500/10 text-red-400 ring-red-500/20",
    warm: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
    cold: "bg-blue-500/10 text-blue-400 ring-blue-500/20",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-semibold ring-1 ring-inset ${styles[tier] || styles.cold}`}
    >
      {score}
      <span className="text-xs uppercase">{tier}</span>
    </span>
  );
}

function statusLabel(status: string) {
  const labels: Record<string, { text: string; color: string }> = {
    new: { text: "New Lead", color: "bg-zinc-500/10 text-zinc-400" },
    contacted: { text: "Contacted", color: "bg-blue-500/10 text-blue-400" },
    qualified: { text: "Qualified", color: "bg-emerald-500/10 text-emerald-400" },
    test_drive_booked: { text: "Test Drive Booked", color: "bg-purple-500/10 text-purple-400" },
    negotiating: { text: "Negotiating", color: "bg-amber-500/10 text-amber-400" },
    sold: { text: "Sold", color: "bg-emerald-600/10 text-emerald-300" },
  };
  const l = labels[status] || labels.new;
  return (
    <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${l.color}`}>
      {l.text}
    </span>
  );
}

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [vehicles, setVehicles] = useState<MatchedVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waMessage, setWaMessage] = useState("");
  const [waSending, setWaSending] = useState(false);
  const [waSendStatus, setWaSendStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function sendWhatsApp() {
    if (!waMessage.trim() || !lead) return;
    setWaSending(true);
    setWaSendStatus(null);
    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: lead.phone, message: waMessage, lead_id: lead.id }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setWaSendStatus({ ok: false, message: body.error ?? `Send failed (${res.status})` });
      } else {
        setWaSendStatus({ ok: true, message: "Sent." });
        setWaMessage("");
      }
    } catch (err) {
      setWaSendStatus({
        ok: false,
        message: err instanceof Error ? err.message : "Send failed",
      });
    } finally {
      setWaSending(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    setError(null);
    setNotFound(false);

    fetch(`/api/leads/${id}`)
      .then(async (r) => {
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        if (!r.ok) throw new Error(`Lead fetch failed (${r.status})`);
        return r.json();
      })
      .then((json) => {
        if (!json) return;
        const row = json.data ?? json.lead ?? json;
        if (row && row.id) setLead(row as LeadDetail);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));

    fetch("/api/inventory/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_id: id }),
    })
      .then((r) => (r.ok ? r.json() : { vehicles: [] }))
      .then((json) => {
        const rows = json.data ?? json.vehicles ?? [];
        setVehicles(rows);
      })
      .catch(() => setVehicles([]));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="space-y-4 max-w-md">
        <h1 className="text-xl font-semibold text-white">Lead not found</h1>
        <p className="text-sm text-zinc-500">
          We couldn&apos;t find a lead with id <code className="font-mono">{id}</code>. It may have been deleted or merged.
        </p>
        <Link href="/dashboard/leads">
          <Button variant="outline" size="sm">Back to leads</Button>
        </Link>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="space-y-4 max-w-md">
        <h1 className="text-xl font-semibold text-white">Could not load lead</h1>
        <p className="text-sm text-red-400">{error ?? "Unknown error"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back + Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/leads">
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-zinc-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-white">{lead.name}</h1>
            <p className="text-sm text-zinc-500">
              Lead ID: {lead.id} &middot; Created {lead.created_at}
            </p>
          </div>
          <div className="ml-2">{scoreBadge(lead.score_tier, lead.ai_score)}</div>
          <div className="ml-1">{statusLabel(lead.status)}</div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            onClick={() => window.open(`tel:${lead.phone}`)}
          >
            <Phone className="h-3.5 w-3.5" />
            Contact
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            disabled={actionLoading === "test_drive"}
            onClick={async () => {
              setActionLoading("test_drive");
              try {
                await fetch(`/api/leads/${lead.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: "test_drive_booked", test_drive_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() }),
                });
                setLead((prev) => prev ? { ...prev, status: "test_drive_booked" } : prev);
              } catch { /* keep current state */ }
              setActionLoading(null);
            }}
          >
            <Car className="h-3.5 w-3.5" />
            Book Test Drive
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            disabled={actionLoading === "assign"}
            onClick={async () => {
              setActionLoading("assign");
              try {
                const res = await fetch("/api/dealers");
                const data = await res.json();
                const dealer = data.dealers?.[0];
                if (dealer) {
                  await fetch(`/api/leads/${lead.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ assigned_dealer_id: dealer.id }),
                  });
                }
              } catch { /* keep current state */ }
              setActionLoading(null);
            }}
          >
            <User className="h-3.5 w-3.5" />
            Assign to Dealer
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-emerald-600 text-white hover:bg-emerald-500"
            disabled={actionLoading === "sold"}
            onClick={async () => {
              setActionLoading("sold");
              try {
                await fetch(`/api/leads/${lead.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: "sold", sold_at: new Date().toISOString() }),
                });
                setLead((prev) => prev ? { ...prev, status: "sold" } : prev);
              } catch { /* keep current state */ }
              setActionLoading(null);
            }}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Mark as Sold
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Lead Info */}
        <Card className="border-zinc-800/50 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-white">Lead Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <InfoRow icon={User} label="Name" value={lead.name} />
              <InfoRow icon={Phone} label="Phone" value={lead.phone} mono />
              <InfoRow
                icon={MessageCircle}
                label="WhatsApp"
                value={lead.whatsapp}
                mono
              />
              <InfoRow
                icon={Send}
                label="Email"
                value={lead.email}
              />
              <InfoRow
                icon={MapPin}
                label="Location"
                value={`${lead.area}, ${lead.city}, ${lead.province}`}
              />

              <div className="border-t border-zinc-800/50 pt-4" />

              <InfoRow
                icon={DollarSign}
                label="Budget"
                value={`${formatRand(lead.budget_min)} - ${formatRand(lead.budget_max)}`}
                mono
              />
              <InfoRow icon={Car} label="Brand" value={lead.preferred_brand} />
              <InfoRow icon={Car} label="Model" value={lead.preferred_model} />
              <InfoRow
                icon={Car}
                label="Type"
                value={`${lead.preferred_type} (${lead.new_or_used})`}
              />
              <InfoRow
                icon={Calendar}
                label="Timeline"
                value={(lead.timeline ?? "").replace(/_/g, " ")}
                highlight={lead.timeline === "this_week"}
              />
              <InfoRow
                icon={CreditCard}
                label="Finance"
                value={(lead.finance_status ?? "").replace(/_/g, " ")}
                highlight={lead.finance_status === "pre_approved" || lead.finance_status === "cash"}
              />

              {lead.has_trade_in && (
                <>
                  <div className="border-t border-zinc-800/50 pt-4" />
                  <InfoRow
                    icon={Car}
                    label="Trade-In"
                    value={`${lead.trade_in_year} ${lead.trade_in_brand} ${lead.trade_in_model}`}
                  />
                </>
              )}

              <div className="border-t border-zinc-800/50 pt-4" />

              <InfoRow icon={AlertCircle} label="Source" value={lead.source ?? "unknown"} />
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Conversation */}
        <Card className="border-zinc-800/50 bg-zinc-900/50">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <MessageCircle className="h-4 w-4 text-emerald-400" />
              WhatsApp Conversation
            </CardTitle>
            <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10">
              Live
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 min-h-[120px]">
              <p className="text-xs text-zinc-500 text-center py-8">
                No conversation history yet. Start a thread below.
              </p>
            </div>

            {/* Input */}
            <div className="mt-4 border-t border-zinc-800/50 pt-4">
              {waSendStatus && (
                <p className={`text-xs mb-2 ${waSendStatus.ok ? "text-emerald-400" : "text-red-400"}`}>
                  {waSendStatus.message}
                </p>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={waMessage}
                  onChange={(e) => setWaMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && waMessage.trim() && !waSending) {
                      sendWhatsApp();
                    }
                  }}
                  className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-emerald-500/50"
                />
                <Button
                  size="sm"
                  disabled={waSending || !waMessage.trim()}
                  className="bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50"
                  onClick={sendWhatsApp}
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Matched Vehicles */}
      <Card className="border-zinc-800/50 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-white">
            Matched Vehicles ({vehicles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className="rounded-xl border border-zinc-800/50 bg-zinc-950/50 p-4"
              >
                {/* Vehicle header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-white">
                      {v.year} {v.brand} {v.model}
                    </p>
                    <p className="text-xs text-zinc-500">{v.color ?? v.variant ?? ""}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                    {v.match_score}% match
                  </span>
                </div>

                {/* Price & details */}
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Price</span>
                    <span className="font-mono text-sm font-semibold text-white">
                      {formatRand(v.price)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Mileage</span>
                    <span className="font-mono text-sm text-zinc-300">
                      {v.mileage != null ? `${v.mileage.toLocaleString()} km` : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Condition</span>
                    <span className="text-sm capitalize text-zinc-300">
                      {(v.condition ?? "—").replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">VIN</span>
                    <span className="font-mono text-[11px] text-zinc-500">
                      {v.vin ?? "—"}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(v.features ?? []).map((f) => (
                    <span
                      key={f}
                      className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  mono,
  highlight,
}: {
  icon: typeof User;
  label: string;
  value: string | number | null | undefined;
  mono?: boolean;
  highlight?: boolean;
}) {
  const display = value == null || value === "" ? "—" : String(value);
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 shrink-0 text-zinc-600" />
      <span className="w-20 shrink-0 text-xs text-zinc-500">{label}</span>
      <span
        className={`text-sm ${
          highlight
            ? "font-medium text-emerald-400"
            : mono
              ? "font-mono text-zinc-300"
              : "text-zinc-300"
        } ${!mono && !highlight ? "capitalize" : ""}`}
      >
        {display}
      </span>
    </div>
  );
}
