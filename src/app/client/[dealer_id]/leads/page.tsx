"use client";

import { useState, useEffect, use } from "react";
import {
  Search,
  ThumbsUp,
  ThumbsDown,
  Phone,
  ArrowLeft,
  Loader2,
  Filter,
  Car,
} from "lucide-react";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LeadRow {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  ai_score: number;
  score_tier: string;
  status: string;
  preferred_brand: string | null;
  preferred_model: string | null;
  budget_min: number | null;
  budget_max: number | null;
  timeline: string | null;
  source: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ClientLeadManagement({
  params,
}: {
  params: Promise<{ dealer_id: string }>;
}) {
  const { dealer_id } = use(params);

  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [filtered, setFiltered] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [scoreFilter, setScoreFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/leads?dealer_id=${dealer_id}&limit=200&sort=created_at`)
      .then((r) => r.json())
      .then((json) => {
        const rows = json.data || json.leads || [];
        setLeads(rows);
        setFiltered(rows);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [dealer_id]);

  // Filter logic
  useEffect(() => {
    let result = [...leads];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.preferred_brand?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q)
      );
    }
    if (scoreFilter !== "all") {
      result = result.filter((l) => l.score_tier === scoreFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter((l) => l.status === statusFilter);
    }
    setFiltered(result);
  }, [search, scoreFilter, statusFilter, leads]);

  const updateStatus = async (leadId: string, newStatus: string) => {
    setUpdating(leadId);
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdating(null);
    }
  };

  const sendFeedback = async (leadId: string, quality: "good" | "bad") => {
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: quality }),
      });
    } catch {
      // Silently fail — non-critical
    }
  };

  const statuses = ["new", "contacted", "qualified", "test_drive_booked", "test_drive_done", "negotiating", "sold", "lost"];
  const statusLabels: Record<string, string> = {
    new: "New",
    contacted: "Contacted",
    qualified: "Qualified",
    test_drive_booked: "Test Drive Booked",
    test_drive_done: "Test Drive Done",
    negotiating: "Negotiating",
    sold: "Sold",
    lost: "Lost",
  };
  const statusColors: Record<string, string> = {
    new: "bg-zinc-500/10 text-zinc-400",
    contacted: "bg-blue-500/10 text-blue-400",
    qualified: "bg-emerald-500/10 text-emerald-400",
    test_drive_booked: "bg-purple-500/10 text-purple-400",
    test_drive_done: "bg-purple-500/10 text-purple-300",
    negotiating: "bg-amber-500/10 text-amber-400",
    sold: "bg-emerald-500/10 text-emerald-300",
    lost: "bg-red-500/10 text-red-400",
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
          <Link
            href={`/client/${dealer_id}`}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Portal
          </Link>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500">
            <Car className="h-3.5 w-3.5 text-white" />
          </div>
          <h1 className="text-sm font-semibold">Lead Management</h1>
          <span className="text-xs text-zinc-500">{filtered.length} leads</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, brand, email..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 pl-10 pr-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-zinc-500" />
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-2 py-2 text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All Scores</option>
              <option value="hot">Hot</option>
              <option value="warm">Warm</option>
              <option value="cold">Cold</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-2 py-2 text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>{statusLabels[s]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-zinc-800/50">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800/50 bg-zinc-900/80">
                <th className="px-4 py-3 text-xs font-medium text-zinc-500">Name</th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-500">Score</th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-500">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-500">Brand / Model</th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-500">Budget</th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-500">Date</th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-zinc-200">{lead.name}</p>
                      {lead.phone && <p className="text-xs text-zinc-500">{lead.phone}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
                        lead.score_tier === "hot"
                          ? "bg-red-500/10 text-red-400"
                          : lead.score_tier === "warm"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-blue-500/10 text-blue-400"
                      }`}
                    >
                      {lead.ai_score}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={lead.status}
                      onChange={(e) => updateStatus(lead.id, e.target.value)}
                      disabled={updating === lead.id}
                      className={`rounded-md px-2 py-1 text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500/30 ${statusColors[lead.status] || "bg-zinc-500/10 text-zinc-400"}`}
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>{statusLabels[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {lead.preferred_brand || "-"}{lead.preferred_model ? ` ${lead.preferred_model}` : ""}
                  </td>
                  <td className="px-4 py-3 font-mono text-zinc-300">
                    {lead.budget_max ? `R${(lead.budget_max / 1000).toFixed(0)}K` : "-"}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {lead.created_at?.split("T")[0] || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {lead.phone && (
                        <a
                          href={`tel:${lead.phone}`}
                          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-zinc-700/50 text-zinc-500 hover:text-emerald-400 transition-colors"
                          title="Call"
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => sendFeedback(lead.id, "good")}
                        className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-400 transition-colors"
                        title="Good lead"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => sendFeedback(lead.id, "bad")}
                        className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
                        title="Bad lead"
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                    {search || scoreFilter !== "all" || statusFilter !== "all"
                      ? "No leads match your filters"
                      : "No leads delivered yet"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
