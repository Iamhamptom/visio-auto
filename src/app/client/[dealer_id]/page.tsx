"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  Users,
  Flame,
  Car,
  DollarSign,
  TrendingUp,
  Zap,
  Download,
  Settings,
  ArrowUpRight,
  Loader2,
  FileText,
  Shield,
  ExternalLink,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types (inline — this page is self-contained for client access)
// ---------------------------------------------------------------------------

interface DealerInfo {
  id: string;
  name: string;
  tier: string;
  monthly_fee: number;
  brands: string[];
  area: string;
  leads_quota: number;
}

interface LeadRow {
  id: string;
  name: string;
  ai_score: number;
  score_tier: string;
  status: string;
  preferred_brand: string | null;
  budget_max: number | null;
  timeline: string | null;
  created_at: string;
}

interface SignalRow {
  id: string;
  signal_type: string;
  title: string;
  buying_probability: number;
  created_at: string;
}

interface ROIData {
  leads_delivered: number;
  hot_leads: number;
  test_drives: number;
  sales_closed: number;
  total_revenue: number;
  roi_multiple: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ClientPortal({
  params,
}: {
  params: Promise<{ dealer_id: string }>;
}) {
  const { dealer_id } = use(params);

  const [dealer, setDealer] = useState<DealerInfo | null>(null);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [signals, setSignals] = useState<SignalRow[]>([]);
  const [roi, setROI] = useState<ROIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "leads" | "signals" | "report" | "settings">("overview");
  const [reportHtml, setReportHtml] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // Fetch dealer info
        const dRes = await fetch(`/api/dealers/${dealer_id}`);
        if (!dRes.ok) throw new Error("Dealer not found");
        const dJson = await dRes.json();
        setDealer(dJson.data || dJson.dealer || dJson);

        // Fetch leads
        const lRes = await fetch(`/api/leads?dealer_id=${dealer_id}&limit=50&sort=created_at`);
        const lJson = await lRes.json();
        const allLeads: LeadRow[] = lJson.data || lJson.leads || [];
        setLeads(allLeads);

        // Fetch signals (dealer area)
        const sRes = await fetch(`/api/signals?limit=10`);
        const sJson = await sRes.json();
        setSignals(sJson.data || sJson.signals || []);

        // Compute ROI from leads
        const hot = allLeads.filter((l) => l.score_tier === "hot").length;
        const testDrives = allLeads.filter((l) =>
          ["test_drive_booked", "test_drive_done", "negotiating", "sold"].includes(l.status)
        ).length;
        const sold = allLeads.filter((l) => l.status === "sold");
        const revenue = sold.reduce((s, l) => s + (l.budget_max || 0), 0);
        const fee = dJson.data?.monthly_fee || dJson.dealer?.monthly_fee || dJson.monthly_fee || 10000;

        setROI({
          leads_delivered: allLeads.length,
          hot_leads: hot,
          test_drives: testDrives,
          sales_closed: sold.length,
          total_revenue: revenue,
          roi_multiple: fee > 0 ? Math.round((revenue / fee) * 10) / 10 : 0,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [dealer_id]);

  const loadReport = async () => {
    if (reportHtml) return;
    try {
      const res = await fetch(`/api/reports/roi?dealer_id=${dealer_id}&format=html`);
      const html = await res.text();
      setReportHtml(html);
    } catch {
      setReportHtml("<p>Failed to generate report.</p>");
    }
  };

  const exportCSV = () => {
    const headers = ["Name", "Score", "Tier", "Status", "Brand", "Budget", "Timeline", "Date"];
    const rows = leads.map((l) => [
      l.name,
      l.ai_score,
      l.score_tier,
      l.status,
      l.preferred_brand || "",
      l.budget_max || "",
      l.timeline || "",
      l.created_at?.split("T")[0] || "",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visio-auto-leads-${dealer_id.slice(0, 8)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (error || !dealer) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-zinc-950 text-white">
        <Shield className="h-12 w-12 text-red-400 mb-4" />
        <h1 className="text-xl font-bold">Access Denied</h1>
        <p className="mt-2 text-zinc-400 text-sm">{error || "Invalid dealer ID"}</p>
      </div>
    );
  }

  const tierColors: Record<string, string> = {
    starter: "bg-zinc-500/10 text-zinc-400 ring-zinc-500/20",
    growth: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
    pro: "bg-purple-500/10 text-purple-400 ring-purple-500/20",
    enterprise: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
  };

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: TrendingUp },
    { key: "leads" as const, label: "Leads", icon: Users },
    { key: "signals" as const, label: "Signals", icon: Zap },
    { key: "report" as const, label: "ROI Report", icon: FileText },
    { key: "settings" as const, label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500">
              <Car className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-white">{dealer.name}</h1>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium uppercase ring-1 ring-inset ${tierColors[dealer.tier] || tierColors.starter}`}
                >
                  {dealer.tier}
                </span>
              </div>
              <p className="text-xs text-zinc-500">{dealer.area} &middot; {dealer.brands?.join(", ")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700/50 transition-colors"
            >
              <Download className="h-3 w-3" />
              Export CSV
            </button>
          </div>
        </div>
        {/* Tab nav */}
        <div className="mx-auto max-w-6xl px-4">
          <nav className="flex gap-1 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  if (tab.key === "report") loadReport();
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-emerald-400 text-emerald-400"
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Overview */}
        {activeTab === "overview" && roi && (
          <div className="space-y-6">
            {/* KPI cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {[
                { label: "Leads This Month", value: roi.leads_delivered, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
                { label: "Hot Leads", value: roi.hot_leads, icon: Flame, color: "text-red-400", bg: "bg-red-400/10" },
                { label: "Test Drives", value: roi.test_drives, icon: Car, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                { label: "Sales Closed", value: roi.sales_closed, icon: DollarSign, color: "text-amber-400", bg: "bg-amber-400/10" },
                { label: "Revenue", value: `R${(roi.total_revenue / 1000).toFixed(0)}K`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                { label: "ROI", value: `${roi.roi_multiple}x`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10" },
              ].map((kpi) => (
                <div key={kpi.label} className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${kpi.bg}`}>
                      <kpi.icon className={`h-3.5 w-3.5 ${kpi.color}`} />
                    </div>
                    <span className="text-xs text-zinc-500">{kpi.label}</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold font-mono text-white">{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Recent leads preview */}
            <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">Recent Leads</h2>
                <button onClick={() => setActiveTab("leads")} className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
                  View All <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
              <div className="space-y-2">
                {leads.slice(0, 5).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between rounded-lg bg-zinc-800/30 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{lead.name}</p>
                      <p className="text-xs text-zinc-500">{lead.preferred_brand || "Any"} &middot; {lead.timeline?.replace(/_/g, " ") || "Unknown"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                        lead.score_tier === "hot" ? "bg-red-500/10 text-red-400" :
                        lead.score_tier === "warm" ? "bg-amber-500/10 text-amber-400" :
                        "bg-blue-500/10 text-blue-400"
                      }`}>{lead.ai_score}</span>
                      <span className="rounded-md bg-zinc-700/50 px-2 py-0.5 text-xs text-zinc-400 capitalize">{lead.status.replace(/_/g, " ")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upgrade CTA */}
            {dealer.tier !== "enterprise" && dealer.tier !== "pro" && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-emerald-300">Upgrade to Growth for R15K/month</h3>
                    <p className="mt-1 text-xs text-zinc-400">
                      Unlock voice AI calling, marketplace integration, priority lead routing, and dedicated account manager.
                    </p>
                    <a
                      href="mailto:sales@visioauto.co.za?subject=Upgrade%20to%20Growth%20Plan"
                      className="mt-3 inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 transition-colors"
                    >
                      Contact Sales <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Leads tab */}
        {activeTab === "leads" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">{leads.length} Leads</h2>
              <button onClick={exportCSV} className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700 transition-colors">
                <Download className="h-3 w-3" />
                Export
              </button>
            </div>
            <Link
              href={`/client/${dealer_id}/leads`}
              className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline"
            >
              Open full lead management <ArrowUpRight className="h-3 w-3" />
            </Link>
            <div className="overflow-x-auto rounded-xl border border-zinc-800/50">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50 bg-zinc-900/80">
                    <th className="px-4 py-3 text-xs font-medium text-zinc-500">Name</th>
                    <th className="px-4 py-3 text-xs font-medium text-zinc-500">Score</th>
                    <th className="px-4 py-3 text-xs font-medium text-zinc-500">Status</th>
                    <th className="px-4 py-3 text-xs font-medium text-zinc-500">Brand</th>
                    <th className="px-4 py-3 text-xs font-medium text-zinc-500">Budget</th>
                    <th className="px-4 py-3 text-xs font-medium text-zinc-500">Timeline</th>
                    <th className="px-4 py-3 text-xs font-medium text-zinc-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20">
                      <td className="px-4 py-3 font-medium text-zinc-200">{lead.name}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                          lead.score_tier === "hot" ? "bg-red-500/10 text-red-400" :
                          lead.score_tier === "warm" ? "bg-amber-500/10 text-amber-400" :
                          "bg-blue-500/10 text-blue-400"
                        }`}>{lead.ai_score} {lead.score_tier}</span>
                      </td>
                      <td className="px-4 py-3 text-zinc-400 capitalize">{lead.status.replace(/_/g, " ")}</td>
                      <td className="px-4 py-3 text-zinc-400">{lead.preferred_brand || "-"}</td>
                      <td className="px-4 py-3 font-mono text-zinc-300">{lead.budget_max ? `R${(lead.budget_max / 1000).toFixed(0)}K` : "-"}</td>
                      <td className="px-4 py-3 text-zinc-400 capitalize">{lead.timeline?.replace(/_/g, " ") || "-"}</td>
                      <td className="px-4 py-3 text-zinc-500 text-xs">{lead.created_at?.split("T")[0] || "-"}</td>
                    </tr>
                  ))}
                  {leads.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-500">No leads yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Signals tab */}
        {activeTab === "signals" && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-white">Recent Signals</h2>
            {signals.map((sig) => (
              <div key={sig.id} className="flex items-start gap-3 rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10">
                  <Zap className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-300">{sig.title}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs">
                    <span className="font-mono text-emerald-400">{Math.round(sig.buying_probability * 100)}%</span>
                    <span className="text-zinc-600">buy probability</span>
                    <span className="text-zinc-600 capitalize">{sig.signal_type.replace(/_/g, " ")}</span>
                  </div>
                </div>
              </div>
            ))}
            {signals.length === 0 && (
              <p className="text-sm text-zinc-500 py-8 text-center">No signals available for your area yet.</p>
            )}
          </div>
        )}

        {/* Report tab */}
        {activeTab === "report" && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-white">Monthly ROI Report</h2>
            {reportHtml ? (
              <iframe
                srcDoc={reportHtml}
                className="w-full rounded-xl border border-zinc-800/50 bg-zinc-900"
                style={{ height: "800px" }}
                title="ROI Report"
              />
            ) : (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
              </div>
            )}
          </div>
        )}

        {/* Settings tab */}
        {activeTab === "settings" && (
          <div className="space-y-6 max-w-lg">
            <h2 className="text-sm font-semibold text-white">Notification Preferences</h2>
            <div className="space-y-4">
              {[
                { label: "WhatsApp lead alerts", desc: "Get new leads via WhatsApp instantly" },
                { label: "Email daily digest", desc: "Daily summary of leads and signals" },
                { label: "Weekly ROI report", desc: "Automated weekly performance report" },
              ].map((pref) => (
                <div key={pref.label} className="flex items-center justify-between rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{pref.label}</p>
                    <p className="text-xs text-zinc-500">{pref.desc}</p>
                  </div>
                  <div className="h-5 w-9 rounded-full bg-emerald-500/20 relative cursor-pointer">
                    <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-emerald-400 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">Webhook URL</h3>
              <p className="text-xs text-zinc-500">Receive lead data via webhook for CRM integration.</p>
              <input
                type="url"
                placeholder="https://your-crm.com/webhook/visio"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
              />
            </div>
            <p className="text-xs text-zinc-600">
              Contact <a href="mailto:support@visioauto.co.za" className="text-emerald-400 hover:underline">support@visioauto.co.za</a> to update your settings.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
