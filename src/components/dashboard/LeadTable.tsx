"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  MessageCircle,
  Eye,
  Phone,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Lead } from "@/lib/types";

interface LeadTableProps {
  leads: Partial<Lead>[];
  loading?: boolean;
}

type SortField = "name" | "ai_score" | "budget_max" | "timeline" | "status";
type SortDir = "asc" | "desc";

function scoreBadge(tier: string, score: number) {
  const styles: Record<string, { badge: string; pulse: string }> = {
    hot: {
      badge: "bg-red-500/10 text-red-400 ring-red-500/20",
      pulse: "animate-pulse",
    },
    warm: {
      badge: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
      pulse: "",
    },
    cold: {
      badge: "bg-blue-500/10 text-blue-400 ring-blue-500/20",
      pulse: "",
    },
  };
  const s = styles[tier] || styles.cold;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset",
        s.badge,
        s.pulse
      )}
    >
      {score}
      <span className="text-[10px] uppercase opacity-70">{tier}</span>
    </span>
  );
}

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    new: "bg-zinc-500/10 text-zinc-400 ring-zinc-500/20",
    contacted: "bg-blue-500/10 text-blue-400 ring-blue-500/20",
    qualified: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
    test_drive_booked: "bg-purple-500/10 text-purple-400 ring-purple-500/20",
    negotiating: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
    sold: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20",
  };
  const labels: Record<string, string> = {
    new: "New",
    contacted: "Contacted",
    qualified: "Qualified",
    test_drive_booked: "Test Drive",
    negotiating: "Negotiating",
    sold: "Sold",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        styles[status] || styles.new
      )}
    >
      {labels[status] || status}
    </span>
  );
}

function formatRand(amount: number) {
  return `R${(amount / 1000).toFixed(0)}K`;
}

function SkeletonRow() {
  return (
    <TableRow className="border-zinc-800/30">
      {Array.from({ length: 7 }).map((_, i) => (
        <TableCell key={i}>
          <div
            className="h-4 animate-pulse rounded bg-zinc-800"
            style={{ width: `${50 + Math.random() * 40}%` }}
          />
        </TableCell>
      ))}
    </TableRow>
  );
}

export function LeadTable({ leads, loading }: LeadTableProps) {
  const [sortField, setSortField] = useState<SortField>("ai_score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sorted = [...leads].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    switch (sortField) {
      case "ai_score":
        return ((a.ai_score || 0) - (b.ai_score || 0)) * dir;
      case "budget_max":
        return ((a.budget_max || 0) - (b.budget_max || 0)) * dir;
      case "name":
        return (a.name || "").localeCompare(b.name || "") * dir;
      default:
        return 0;
    }
  });

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-30" />;
    }
    return sortDir === "asc" ? (
      <motion.span
        key="asc"
        initial={{ rotate: 180, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <ArrowUp className="ml-1 h-3 w-3 text-emerald-400" />
      </motion.span>
    ) : (
      <motion.span
        key="desc"
        initial={{ rotate: -180, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <ArrowDown className="ml-1 h-3 w-3 text-emerald-400" />
      </motion.span>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-zinc-800/50 hover:bg-transparent">
          <TableHead
            className="cursor-pointer select-none text-zinc-500 hover:text-zinc-300"
            onClick={() => toggleSort("name")}
          >
            <div className="flex items-center">
              Name
              <SortIcon field="name" />
            </div>
          </TableHead>
          <TableHead
            className="cursor-pointer select-none text-zinc-500 hover:text-zinc-300"
            onClick={() => toggleSort("ai_score")}
          >
            <div className="flex items-center">
              Score
              <SortIcon field="ai_score" />
            </div>
          </TableHead>
          <TableHead
            className="cursor-pointer select-none text-zinc-500 hover:text-zinc-300"
            onClick={() => toggleSort("budget_max")}
          >
            <div className="flex items-center">
              Budget
              <SortIcon field="budget_max" />
            </div>
          </TableHead>
          <TableHead className="text-zinc-500">Brand</TableHead>
          <TableHead className="text-zinc-500">Timeline</TableHead>
          <TableHead className="text-zinc-500">Status</TableHead>
          <TableHead className="text-zinc-500">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </>
        ) : (
          <AnimatePresence mode="popLayout">
            {sorted.map((lead, index) => (
              <motion.tr
                key={lead.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.03,
                }}
                className="group border-zinc-800/30 transition-colors hover:bg-zinc-800/20"
              >
                <TableCell className="font-medium text-zinc-200">
                  <Link
                    href={`/dashboard/leads/${lead.id}`}
                    className="transition-colors hover:text-emerald-400"
                  >
                    {lead.name}
                  </Link>
                </TableCell>
                <TableCell>
                  {scoreBadge(lead.score_tier || "cold", lead.ai_score || 0)}
                </TableCell>
                <TableCell className="font-mono text-zinc-300">
                  {formatRand(lead.budget_max || 0)}
                </TableCell>
                <TableCell className="text-zinc-400">
                  {lead.preferred_brand}
                </TableCell>
                <TableCell className="text-zinc-400 capitalize">
                  {(lead.timeline || "").replace(/_/g, " ")}
                </TableCell>
                <TableCell>{statusBadge(lead.status || "new")}</TableCell>
                <TableCell>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-zinc-500 hover:text-emerald-400"
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-zinc-500 hover:text-emerald-400"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-zinc-500 hover:text-emerald-400"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </AnimatePresence>
        )}
      </TableBody>
    </Table>
  );
}
