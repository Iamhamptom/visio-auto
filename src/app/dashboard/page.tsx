"use client";

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
  ArrowDownRight,
  MessageCircle,
  Eye,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

// --- Mock Data ---

const kpis = [
  {
    title: "Total Leads",
    value: "247",
    change: "+18%",
    trend: "up" as const,
    subtitle: "This month",
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    title: "Hot Leads",
    value: "38",
    change: "+24%",
    trend: "up" as const,
    subtitle: "Score 80+",
    icon: Flame,
    color: "text-red-400",
    bg: "bg-red-400/10",
  },
  {
    title: "Test Drives",
    value: "52",
    change: "+12%",
    trend: "up" as const,
    subtitle: "Booked this month",
    icon: Car,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    title: "Sales Closed",
    value: "19",
    change: "+8%",
    trend: "up" as const,
    subtitle: "R4.2M revenue",
    icon: DollarSign,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    title: "Avg Response",
    value: "28s",
    change: "-15%",
    trend: "up" as const,
    subtitle: "WhatsApp delivery",
    icon: Clock,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    title: "ROI",
    value: "4.2x",
    change: "+0.3x",
    trend: "up" as const,
    subtitle: "vs R15K spend",
    icon: TrendingUp,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
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

const signalIcon: Record<string, typeof Zap> = {
  promotion: Briefcase,
  new_baby: Baby,
  new_business: Zap,
  relocation: Home,
  graduation: GraduationCap,
};

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
    negotiating: "bg-amber-500/10 text-amber-400",
    sold: "bg-emerald-500/10 text-emerald-300",
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
      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${styles[status] || styles.new}`}
    >
      {labels[status] || status}
    </span>
  );
}

function formatRand(amount: number) {
  return `R${(amount / 1000).toFixed(0)}K`;
}

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <Card
            key={kpi.title}
            className="border-zinc-800/50 bg-zinc-900/50"
          >
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${kpi.bg}`}
                >
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
                <div
                  className={`flex items-center gap-0.5 text-xs font-medium ${
                    kpi.trend === "up" ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {kpi.trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {kpi.change}
                </div>
              </div>
              <div className="mt-3">
                <p className="font-mono text-2xl font-bold text-white">
                  {kpi.value}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">{kpi.subtitle}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Leads Table */}
        <div className="lg:col-span-2">
          <Card className="border-zinc-800/50 bg-zinc-900/50">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-white">Recent Leads</CardTitle>
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
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800/50 hover:bg-transparent">
                    <TableHead className="text-zinc-500">Name</TableHead>
                    <TableHead className="text-zinc-500">Score</TableHead>
                    <TableHead className="text-zinc-500">Budget</TableHead>
                    <TableHead className="text-zinc-500">Brand</TableHead>
                    <TableHead className="text-zinc-500">Timeline</TableHead>
                    <TableHead className="text-zinc-500">Status</TableHead>
                    <TableHead className="text-zinc-500">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentLeads.map((lead) => (
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
                      <TableCell>
                        {scoreBadge(
                          lead.score_tier || "cold",
                          lead.ai_score || 0
                        )}
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
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="text-zinc-500 hover:text-emerald-400"
                          >
                            <MessageCircle className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="text-zinc-500 hover:text-emerald-400"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Live Signals Feed */}
        <div>
          <Card className="border-zinc-800/50 bg-zinc-900/50">
            <CardHeader className="flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-white">Live Signals</CardTitle>
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-400 ring-emerald-500/20 hover:bg-emerald-500/10">
                {recentSignals.length} new
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSignals.map((signal) => {
                  const Icon =
                    signalIcon[signal.signal_type || ""] || Zap;
                  return (
                    <div
                      key={signal.id}
                      className="flex gap-3 rounded-lg border border-zinc-800/30 bg-zinc-900/30 p-3"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10">
                        <Icon className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-zinc-300 leading-snug">
                          {signal.title}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="font-mono text-xs text-emerald-400">
                            {Math.round(
                              (signal.buying_probability || 0) * 100
                            )}
                            %
                          </span>
                          <span className="text-[10px] text-zinc-600">
                            buy probability
                          </span>
                          <span className="ml-auto text-[10px] text-zinc-600">
                            {signal.created_at}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Leads by Source */}
        <Card className="border-zinc-800/50 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-white">Leads by Source</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Leads Trend */}
        <Card className="border-zinc-800/50 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-white">
              Leads Trend (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
