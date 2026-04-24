"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Download,
  MessageCircle,
  Eye,
  ArrowUpDown,
  ChevronDown,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Lead } from "@/lib/types";

function scoreBadge(tier: string, score: number) {
  const styles: Record<string, string> = {
    hot: "bg-red-500/10 text-red-400 ring-red-500/20",
    warm: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
    cold: "bg-blue-500/10 text-blue-400 ring-blue-500/20",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[tier] || styles.cold}`}
    >
      {score}
      <span className="text-[10px] uppercase">{tier}</span>
    </span>
  );
}

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    new: "bg-zinc-500/10 text-zinc-400",
    contacted: "bg-blue-500/10 text-blue-400",
    qualified: "bg-emerald-500/10 text-emerald-400",
    test_drive_booked: "bg-purple-500/10 text-purple-400",
    test_drive_done: "bg-purple-500/10 text-purple-300",
    negotiating: "bg-amber-500/10 text-amber-400",
    sold: "bg-emerald-600/10 text-emerald-300",
    lost: "bg-red-500/10 text-red-400",
    inactive: "bg-zinc-600/10 text-zinc-500",
  };
  const labels: Record<string, string> = {
    new: "New",
    contacted: "Contacted",
    qualified: "Qualified",
    test_drive_booked: "Test Drive",
    test_drive_done: "TD Done",
    negotiating: "Negotiating",
    sold: "Sold",
    lost: "Lost",
    inactive: "Inactive",
  };
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${styles[status] || styles.new}`}
    >
      {labels[status] || status}
    </span>
  );
}

function formatRand(amount: number) {
  return `R${(amount / 1000).toFixed(0)}K`;
}

function formatFinance(status: string) {
  const labels: Record<string, string> = {
    pre_approved: "Pre-Approved",
    needs_finance: "Needs Finance",
    cash: "Cash Buyer",
    unknown: "Unknown",
  };
  return labels[status] || status;
}

function formatTimeline(tl: string) {
  const labels: Record<string, string> = {
    this_week: "This Week",
    this_month: "This Month",
    three_months: "3 Months",
    just_browsing: "Browsing",
  };
  return labels[tl] || tl;
}

export default function LeadsPage() {
  const [allLeads, setAllLeads] = useState<Partial<Lead>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (tierFilter !== "all") params.set("score_tier", tierFilter);
    const url = `/api/leads${params.toString() ? `?${params}` : ""}`;
    setLoading(true);
    setError(null);
    fetch(url)
      .then(async (r) => {
        if (!r.ok) throw new Error(`Lead fetch failed (${r.status})`);
        return r.json();
      })
      .then((json) => {
        setAllLeads(json.data ?? json.leads ?? []);
      })
      .catch((err: Error) => {
        setError(err.message);
        setAllLeads([]);
      })
      .finally(() => setLoading(false));
  }, [statusFilter, tierFilter]);

  const filtered = allLeads.filter((lead) => {
    if (statusFilter !== "all" && lead.status !== statusFilter) return false;
    if (tierFilter !== "all" && lead.score_tier !== tierFilter) return false;
    if (
      searchQuery &&
      !lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !lead.preferred_brand?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !lead.area?.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Leads</h1>
          <p className="text-sm text-zinc-500">
            {allLeads.length} total leads &middot; {allLeads.filter((l) => l.score_tier === "hot").length} hot
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          onClick={() => {
            const params = new URLSearchParams({ format: "csv" });
            if (statusFilter !== "all") params.set("status", statusFilter);
            if (tierFilter !== "all") params.set("score_tier", tierFilter);
            window.open(`/api/leads/export?${params}`, "_blank");
          }}
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-zinc-800/50 bg-zinc-900/50">
        <CardContent className="pt-0">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search leads by name, brand, area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-full rounded-lg border border-zinc-800 bg-zinc-950 pl-9 pr-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 appearance-none rounded-lg border border-zinc-800 bg-zinc-950 pl-3 pr-8 text-sm text-zinc-300 outline-none focus:border-emerald-500/50"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="test_drive_booked">Test Drive</option>
                <option value="negotiating">Negotiating</option>
                <option value="sold">Sold</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>

            {/* Score Tier Filter */}
            <div className="relative">
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="h-8 appearance-none rounded-lg border border-zinc-800 bg-zinc-950 pl-3 pr-8 text-sm text-zinc-300 outline-none focus:border-emerald-500/50"
              >
                <option value="all">All Scores</option>
                <option value="hot">Hot (80+)</option>
                <option value="warm">Warm (60-79)</option>
                <option value="cold">Cold (&lt;60)</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Filter className="h-3.5 w-3.5" />
              {filtered.length} results
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card className="border-zinc-800/50 bg-zinc-900/50">
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800/50 hover:bg-transparent">
                <TableHead className="text-zinc-500">
                  <span className="flex items-center gap-1">
                    Name
                    <ArrowUpDown className="h-3 w-3" />
                  </span>
                </TableHead>
                <TableHead className="text-zinc-500">Phone</TableHead>
                <TableHead className="text-zinc-500">Area</TableHead>
                <TableHead className="text-zinc-500">Budget</TableHead>
                <TableHead className="text-zinc-500">Brand</TableHead>
                <TableHead className="text-zinc-500">Type</TableHead>
                <TableHead className="text-zinc-500">Timeline</TableHead>
                <TableHead className="text-zinc-500">Finance</TableHead>
                <TableHead className="text-zinc-500">
                  <span className="flex items-center gap-1">
                    Score
                    <ArrowUpDown className="h-3 w-3" />
                  </span>
                </TableHead>
                <TableHead className="text-zinc-500">Status</TableHead>
                <TableHead className="text-zinc-500">Source</TableHead>
                <TableHead className="text-zinc-500">Date</TableHead>
                <TableHead className="text-zinc-500">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={13} className="text-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-zinc-500 mx-auto" />
                  </TableCell>
                </TableRow>
              )}
              {!loading && error && (
                <TableRow>
                  <TableCell colSpan={13} className="text-center py-12 text-red-400">
                    Could not load leads — {error}. Check the dashboard again shortly.
                  </TableCell>
                </TableRow>
              )}
              {!loading && !error && allLeads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={13} className="text-center py-12 text-zinc-500">
                    No leads yet. As soon as the signal engine finds a match in your area, it will appear here.
                  </TableCell>
                </TableRow>
              )}
              {!loading && !error && allLeads.length > 0 && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={13} className="text-center py-12 text-zinc-500">
                    No leads match your filters. Try adjusting your search criteria.
                  </TableCell>
                </TableRow>
              )}
              {!loading && filtered.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="border-zinc-800/30 hover:bg-zinc-800/30 cursor-pointer"
                >
                  <TableCell className="font-medium text-zinc-200">
                    <Link
                      href={`/dashboard/leads/${lead.id}`}
                      className="hover:text-emerald-400 transition-colors"
                    >
                      {lead.name}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-zinc-400">
                    {lead.phone}
                  </TableCell>
                  <TableCell className="text-zinc-400">{lead.area}</TableCell>
                  <TableCell className="font-mono text-zinc-300">
                    {formatRand(lead.budget_min || 0)}-{formatRand(lead.budget_max || 0)}
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {lead.preferred_brand}
                  </TableCell>
                  <TableCell className="text-zinc-400 capitalize">
                    {lead.preferred_type}
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    {formatTimeline(lead.timeline || "")}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-400">
                    {formatFinance(lead.finance_status || "")}
                  </TableCell>
                  <TableCell>
                    {scoreBadge(lead.score_tier || "cold", lead.ai_score || 0)}
                  </TableCell>
                  <TableCell>{statusBadge(lead.status || "new")}</TableCell>
                  <TableCell className="text-xs text-zinc-500">
                    {lead.source}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-zinc-500">
                    {lead.created_at?.slice(5)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-zinc-500 hover:text-emerald-400"
                        onClick={() => window.open(`https://wa.me/${lead.phone?.replace(/\s/g, '').replace(/^\+/, '')}`, '_blank')}
                      >
                        <MessageCircle className="h-3 w-3" />
                      </Button>
                      <Link href={`/dashboard/leads/${lead.id}`}>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="text-zinc-500 hover:text-emerald-400"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
