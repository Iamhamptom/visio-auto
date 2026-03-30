"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Flame,
  Car,
  DollarSign,
  Clock,
  TrendingUp,
  Zap,
  Briefcase,
  Home,
  Baby,
  GraduationCap,
  ArrowUpRight,
  FileText,
  Send,
  Terminal,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { Lead, Signal } from "@/lib/types";
import { KPICard } from "@/components/dashboard/KPICard";
import { SignalFeed } from "@/components/dashboard/SignalFeed";
import { LeadTable } from "@/components/dashboard/LeadTable";
import { ChartCard } from "@/components/dashboard/ChartCard";

// --- Mock Data ---

const kpiConfig = [
  {
    title: "Total Leads",
    value: 247,
    change: 18,
    changeDirection: "up" as const,
    subtitle: "This month",
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    format: "number" as const,
  },
  {
    title: "Hot Leads",
    value: 38,
    change: 24,
    changeDirection: "up" as const,
    subtitle: "Score 80+",
    icon: Flame,
    color: "text-red-400",
    bg: "bg-red-400/10",
    format: "number" as const,
  },
  {
    title: "Test Drives",
    value: 52,
    change: 12,
    changeDirection: "up" as const,
    subtitle: "Booked this month",
    icon: Car,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    format: "number" as const,
  },
  {
    title: "Sales Closed",
    value: 19,
    change: 8,
    changeDirection: "up" as const,
    subtitle: "R4.2M revenue",
    icon: DollarSign,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    format: "number" as const,
  },
  {
    title: "Avg Response",
    value: "28s",
    change: 15,
    changeDirection: "up" as const,
    subtitle: "WhatsApp delivery",
    icon: Clock,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    format: "time" as const,
  },
  {
    title: "ROI",
    value: "4.2x",
    change: 7,
    changeDirection: "up" as const,
    subtitle: "vs R15K spend",
    icon: TrendingUp,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    format: "number" as const,
  },
];

const recentLeads: Partial<Lead>[] = [
  {
    id: "l1",
    name: "Thabo Molefe",
    ai_score: 92,
    score_tier: "hot",
    budget_max: 650000,
    preferred_brand: "BMW",
    timeline: "this_week",
    status: "qualified",
  },
  {
    id: "l2",
    name: "Naledi Khumalo",
    ai_score: 87,
    score_tier: "hot",
    budget_max: 480000,
    preferred_brand: "VW",
    timeline: "this_month",
    status: "test_drive_booked",
  },
  {
    id: "l3",
    name: "Sipho Nkosi",
    ai_score: 78,
    score_tier: "warm",
    budget_max: 350000,
    preferred_brand: "Toyota",
    timeline: "this_month",
    status: "contacted",
  },
  {
    id: "l4",
    name: "Lerato Dlamini",
    ai_score: 94,
    score_tier: "hot",
    budget_max: 920000,
    preferred_brand: "Mercedes",
    timeline: "this_week",
    status: "negotiating",
  },
  {
    id: "l5",
    name: "Pieter van Wyk",
    ai_score: 65,
    score_tier: "warm",
    budget_max: 280000,
    preferred_brand: "Haval",
    timeline: "three_months",
    status: "new",
  },
  {
    id: "l6",
    name: "Zanele Mthembu",
    ai_score: 71,
    score_tier: "warm",
    budget_max: 450000,
    preferred_brand: "Toyota",
    timeline: "this_month",
    status: "contacted",
  },
  {
    id: "l7",
    name: "Kabelo Modise",
    ai_score: 55,
    score_tier: "cold",
    budget_max: 200000,
    preferred_brand: "VW",
    timeline: "just_browsing",
    status: "new",
  },
  {
    id: "l8",
    name: "Ayanda Ndaba",
    ai_score: 83,
    score_tier: "hot",
    budget_max: 550000,
    preferred_brand: "BMW",
    timeline: "this_week",
    status: "qualified",
  },
  {
    id: "l9",
    name: "Francois du Plessis",
    ai_score: 69,
    score_tier: "warm",
    budget_max: 380000,
    preferred_brand: "Toyota",
    timeline: "this_month",
    status: "contacted",
  },
  {
    id: "l10",
    name: "Nomsa Sithole",
    ai_score: 45,
    score_tier: "cold",
    budget_max: 150000,
    preferred_brand: "Suzuki",
    timeline: "three_months",
    status: "new",
  },
];

const recentSignals: Partial<Signal>[] = [
  {
    id: "s1",
    signal_type: "promotion",
    title: "Thabo Molefe promoted to Senior Manager at Discovery",
    signal_strength: "strong",
    buying_probability: 0.85,
    created_at: "2 min ago",
  },
  {
    id: "s2",
    signal_type: "new_baby",
    title: "Naledi Khumalo announced new family addition",
    signal_strength: "medium",
    buying_probability: 0.62,
    created_at: "15 min ago",
  },
  {
    id: "s3",
    signal_type: "new_business",
    title: "New company registered: Modise Consulting (Pty) Ltd",
    signal_strength: "strong",
    buying_probability: 0.78,
    created_at: "32 min ago",
  },
  {
    id: "s4",
    signal_type: "relocation",
    title: "Sipho Nkosi relocating from Cape Town to Sandton",
    signal_strength: "strong",
    buying_probability: 0.72,
    created_at: "1 hour ago",
  },
  {
    id: "s5",
    signal_type: "graduation",
    title: "Zanele Mthembu graduated MBA from Wits Business School",
    signal_strength: "medium",
    buying_probability: 0.55,
    created_at: "2 hours ago",
  },
];

const sourceData = [
  { name: "Social Signals", value: 82, fill: "#10b981" },
  { name: "CIPC Registry", value: 54, fill: "#3b82f6" },
  { name: "Job Portals", value: 41, fill: "#a855f7" },
  { name: "Property", value: 38, fill: "#f59e0b" },
  { name: "Referrals", value: 32, fill: "#ef4444" },
];

const sourceChartConfig: ChartConfig = {
  "Social Signals": { label: "Social Signals", color: "#10b981" },
  "CIPC Registry": { label: "CIPC Registry", color: "#3b82f6" },
  "Job Portals": { label: "Job Portals", color: "#a855f7" },
  Property: { label: "Property", color: "#f59e0b" },
  Referrals: { label: "Referrals", color: "#ef4444" },
};

const trendData = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  return {
    day: `Mar ${day}`,
    leads: Math.floor(5 + Math.random() * 10 + (i / 30) * 5),
    hot: Math.floor(1 + Math.random() * 4 + (i / 30) * 2),
  };
});

const trendChartConfig: ChartConfig = {
  leads: { label: "Total Leads", color: "#10b981" },
  hot: { label: "Hot Leads", color: "#ef4444" },
};

function useElapsedTime() {
  const [elapsed, setElapsed] = useState(0);
  const [startTime] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return elapsed;
}

export default function DashboardOverview() {
  const [leads, setLeads] = useState<Partial<Lead>[]>(recentLeads);
  const [signals, setSignals] = useState<Partial<Signal>[]>(recentSignals);
  const [loading, setLoading] = useState(true);
  const elapsed = useElapsedTime();

  useEffect(() => {
    Promise.allSettled([
      fetch("/api/leads?limit=10&sort=created_at")
        .then((r) => r.json())
        .then((json) => {
          const rows = json.data ?? json.leads ?? [];
          if (rows.length > 0) setLeads(rows);
        }),
      fetch("/api/signals?limit=5")
        .then((r) => r.json())
        .then((json) => {
          const rows = json.data ?? json.signals ?? [];
          if (rows.length > 0) setSignals(rows);
        }),
    ]).finally(() => setLoading(false));
  }, []);

  // Compute KPIs from live leads data
  const computedKpis =
    leads.length > 0
      ? kpiConfig.map((kpi) => {
          if (kpi.title === "Total Leads") return { ...kpi, value: leads.length };
          if (kpi.title === "Hot Leads")
            return {
              ...kpi,
              value: leads.filter((l) => l.score_tier === "hot").length,
            };
          return kpi;
        })
      : kpiConfig;

  return (
    <div className="space-y-6">
      {/* Header with quick actions */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-lg font-bold text-white">Dashboard Overview</h1>
          <p className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
            <span>Last updated: {elapsed}s ago</span>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <RefreshCw className="h-3 w-3 text-zinc-600" />
            </motion.span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/pitch">
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              Generate Brief
            </Button>
          </Link>
          <Link href="/dashboard/outreach">
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Send Blast
            </Button>
          </Link>
          <Link href="/dashboard/terminal">
            <Button
              size="sm"
              className="bg-emerald-600 text-white hover:bg-emerald-500"
            >
              <Terminal className="mr-1.5 h-3.5 w-3.5" />
              View Terminal
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {computedKpis.map((kpi, index) => (
          <KPICard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            changeDirection={kpi.changeDirection}
            icon={kpi.icon}
            format={kpi.format}
            delay={index * 0.08}
            subtitle={kpi.subtitle}
            color={kpi.color}
            bg={kpi.bg}
          />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Leads Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="overflow-hidden border-zinc-800/50 bg-zinc-900/50">
            <CardHeader className="flex-row items-center justify-between border-b border-zinc-800/30 px-5 py-4">
              <CardTitle className="text-sm font-semibold text-white">
                Recent Leads
              </CardTitle>
              <Link href="/dashboard/leads">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-400 hover:text-white"
                >
                  View All
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <LeadTable leads={leads} loading={loading} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Live Signals Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="border-zinc-800/50 bg-zinc-900/50">
            <CardHeader className="flex-row items-center justify-between border-b border-zinc-800/30 px-5 py-4">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-semibold text-white">
                  Live Signals
                </CardTitle>
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(16, 185, 129, 0.4)",
                      "0 0 0 6px rgba(16, 185, 129, 0)",
                    ],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="h-2 w-2 rounded-full bg-emerald-400"
                />
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-400 ring-emerald-500/20 hover:bg-emerald-500/10">
                {signals.length} new
              </Badge>
            </CardHeader>
            <CardContent className="p-4">
              <SignalFeed signals={signals} loading={loading} />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Leads by Source */}
        <ChartCard title="Leads by Source" subtitle="Distribution by acquisition channel" delay={0.1}>
          <ChartContainer
            config={sourceChartConfig}
            className="mx-auto aspect-square max-h-[280px]"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                strokeWidth={0}
              >
                {sourceData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {sourceData.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-xs">
                <div
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: s.fill }}
                />
                <span className="text-zinc-400">{s.name}</span>
                <span className="ml-auto font-mono text-zinc-300">
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Leads Trend */}
        <ChartCard title="Leads Trend" subtitle="Daily acquisition over time" delay={0.2}>
          <ChartContainer
            config={trendChartConfig}
            className="aspect-[2/1] w-full"
          >
            <LineChart data={trendData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval={6}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="leads"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="hot"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </ChartCard>
      </div>
    </div>
  );
}
