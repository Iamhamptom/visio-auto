"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  Clock,
  DollarSign,
  Target,
  Zap,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

// ─── KPI Data ───────────────────────────────────────────────
const kpis = [
  {
    label: "Total Leads",
    value: "847",
    change: "+12.3%",
    trend: "up" as const,
    icon: Users,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    label: "Conversion Rate",
    value: "14.2%",
    change: "+2.1%",
    trend: "up" as const,
    icon: Target,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    label: "Avg Response Time",
    value: "42s",
    change: "-8s",
    trend: "up" as const,
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    label: "Revenue Generated",
    value: "R18.4M",
    change: "+18.6%",
    trend: "up" as const,
    icon: DollarSign,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    label: "ROI",
    value: "312%",
    change: "+24%",
    trend: "up" as const,
    icon: TrendingUp,
    color: "text-violet-400",
    bg: "bg-violet-400/10",
  },
  {
    label: "Cost Per Lead",
    value: "R285",
    change: "-R32",
    trend: "up" as const,
    icon: Zap,
    color: "text-rose-400",
    bg: "bg-rose-400/10",
  },
];

// ─── Leads Over Time (30 days) ──────────────────────────────
const leadsOverTime = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  const day = d.toLocaleDateString("en-ZA", { day: "2-digit", month: "short" });
  return {
    date: day,
    signal_engine: Math.floor(8 + Math.sin(i / 3) * 4 + Math.random() * 5),
    meta_ad: Math.floor(5 + Math.cos(i / 4) * 3 + Math.random() * 4),
    google_ad: Math.floor(4 + Math.sin(i / 5) * 2 + Math.random() * 3),
    whatsapp: Math.floor(3 + Math.random() * 4),
    organic: Math.floor(1 + Math.random() * 3),
  };
});

const leadsChartConfig: ChartConfig = {
  signal_engine: { label: "Signal Engine", color: "#10b981" },
  meta_ad: { label: "Meta Ads", color: "#3b82f6" },
  google_ad: { label: "Google Ads", color: "#f59e0b" },
  whatsapp: { label: "WhatsApp", color: "#22d3ee" },
  organic: { label: "Organic", color: "#a78bfa" },
};

// ─── Lead Funnel ────────────────────────────────────────────
const funnelData = [
  { stage: "New", count: 847, rate: 100, stepRate: null },
  { stage: "Contacted", count: 623, rate: 73.6, stepRate: 73.6 },
  { stage: "Qualified", count: 412, rate: 48.6, stepRate: 66.1 },
  { stage: "Test Drive", count: 198, rate: 23.4, stepRate: 48.1 },
  { stage: "Sold", count: 120, rate: 14.2, stepRate: 60.6 },
];

const funnelConfig: ChartConfig = {
  count: { label: "Leads", color: "#10b981" },
};

// ─── Score Distribution ─────────────────────────────────────
const scoreDistribution = [
  { range: "0-20", count: 42, fill: "#ef4444" },
  { range: "20-40", count: 98, fill: "#f97316" },
  { range: "40-60", count: 215, fill: "#eab308" },
  { range: "60-80", count: 312, fill: "#22c55e" },
  { range: "80-100", count: 180, fill: "#10b981" },
];

const scoreConfig: ChartConfig = {
  count: { label: "Leads", color: "#10b981" },
};

// ─── Best Sources ───────────────────────────────────────────
const sourcesData = [
  { source: "Signal Engine", leads: 342, rate: 17.0 },
  { source: "Meta Ads", leads: 218, rate: 12.8 },
  { source: "WhatsApp", leads: 87, rate: 12.6 },
  { source: "Google Ads", leads: 156, rate: 12.2 },
  { source: "Organic", leads: 44, rate: 9.1 },
];

const sourcesConfig: ChartConfig = {
  rate: { label: "Conversion %", color: "#10b981" },
};

// ─── Top Areas ──────────────────────────────────────────────
const areasData = [
  { area: "Sandton", leads: 186 },
  { area: "Bryanston", leads: 124 },
  { area: "Centurion", leads: 112 },
  { area: "Midrand", leads: 98 },
  { area: "Fourways", leads: 89 },
  { area: "Menlyn", leads: 78 },
  { area: "Bedfordview", leads: 62 },
];

const areasConfig: ChartConfig = {
  leads: { label: "Leads", color: "#10b981" },
};

// ─── Brand Demand ───────────────────────────────────────────
const brandDemand = [
  { brand: "Toyota", pct: 28, fill: "#10b981" },
  { brand: "BMW", pct: 18, fill: "#3b82f6" },
  { brand: "VW", pct: 15, fill: "#f59e0b" },
  { brand: "Mercedes", pct: 12, fill: "#a78bfa" },
  { brand: "Hyundai", pct: 8, fill: "#22d3ee" },
  { brand: "Other", pct: 19, fill: "#6b7280" },
];

// ─── Monthly Performance ────────────────────────────────────
const monthlyPerformance = [
  { month: "Oct 2025", leads: 128, testDrives: 31, sales: 17, revenue: 2_380_000, roi: 248 },
  { month: "Nov 2025", leads: 142, testDrives: 36, sales: 20, revenue: 2_810_000, roi: 267 },
  { month: "Dec 2025", leads: 119, testDrives: 28, sales: 15, revenue: 2_150_000, roi: 231 },
  { month: "Jan 2026", leads: 156, testDrives: 42, sales: 24, revenue: 3_420_000, roi: 295 },
  { month: "Feb 2026", leads: 168, testDrives: 45, sales: 26, revenue: 3_780_000, roi: 308 },
  { month: "Mar 2026", leads: 184, testDrives: 52, sales: 30, revenue: 4_310_000, roi: 342 },
];

function formatRand(amount: number): string {
  if (amount >= 1_000_000) return `R${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `R${(amount / 1_000).toFixed(0)}K`;
  return `R${amount}`;
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const [analyticsKpis, setAnalyticsKpis] = useState(kpis);
  const [analyticsLeadsOverTime, setAnalyticsLeadsOverTime] = useState(leadsOverTime);
  const [analyticsFunnel, setAnalyticsFunnel] = useState(funnelData);
  const [analyticsScoreDist, setAnalyticsScoreDist] = useState(scoreDistribution);
  const [analyticsSources, setAnalyticsSources] = useState(sourcesData);
  const [analyticsAreas, setAnalyticsAreas] = useState(areasData);
  const [analyticsBrands, setAnalyticsBrands] = useState(brandDemand);
  const [analyticsMonthly, setAnalyticsMonthly] = useState(monthlyPerformance);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/analytics?period=${period}`)
      .then((r) => r.json())
      .then((json) => {
        const d = json.data ?? json;
        if (d.kpis?.length) setAnalyticsKpis(d.kpis);
        if (d.leads_over_time?.length) setAnalyticsLeadsOverTime(d.leads_over_time);
        if (d.funnel?.length) setAnalyticsFunnel(d.funnel);
        if (d.score_distribution?.length) setAnalyticsScoreDist(d.score_distribution);
        if (d.sources?.length) setAnalyticsSources(d.sources);
        if (d.areas?.length) setAnalyticsAreas(d.areas);
        if (d.brand_demand?.length) setAnalyticsBrands(d.brand_demand);
        if (d.monthly_performance?.length) setAnalyticsMonthly(d.monthly_performance);
      })
      .catch(() => {/* keep mock */})
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-zinc-400">
            Performance insights for Sandton Motor Group
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-zinc-800 bg-zinc-900/50 p-0.5">
            {(["7d", "30d", "90d"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  period === p
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "90 Days"}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            onClick={() => window.open('/api/leads/export?format=csv', '_blank')}
          >
            <Download className="mr-2 h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {analyticsKpis.map((kpi) => (
          <Card
            key={kpi.label}
            className="border-zinc-800/50 bg-zinc-900/50"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className={cn("rounded-lg p-2", kpi.bg)}>
                  <kpi.icon className={cn("h-4 w-4", kpi.color)} />
                </div>
                <div className="flex items-center gap-0.5 text-xs">
                  {kpi.trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-400" />
                  )}
                  <span
                    className={
                      kpi.trend === "up"
                        ? "text-emerald-400"
                        : "text-red-400"
                    }
                  >
                    {kpi.change}
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-white">{kpi.value}</p>
                <p className="text-xs text-zinc-500">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart 1: Leads Over Time */}
      <Card className="border-zinc-800/50 bg-zinc-900/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-300">
            Leads Over Time
          </CardTitle>
          <p className="text-xs text-zinc-500">
            Daily lead volume by source — last 30 days
          </p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={leadsChartConfig} className="h-[300px] w-full">
            <LineChart data={analyticsLeadsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#71717a", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fill: "#71717a", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="signal_engine"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="meta_ad"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="google_ad"
                stroke="#f59e0b"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="whatsapp"
                stroke="#22d3ee"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="organic"
                stroke="#a78bfa"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
          <div className="mt-3 flex flex-wrap gap-4">
            {Object.entries(leadsChartConfig).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-1.5 text-xs text-zinc-400">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: cfg.color }}
                />
                {cfg.label as string}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Row: Funnel + Score Distribution */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Chart 2: Lead Funnel */}
        <Card className="border-zinc-800/50 bg-zinc-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Lead Funnel
            </CardTitle>
            <p className="text-xs text-zinc-500">
              Conversion through each pipeline stage
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={funnelConfig} className="h-[280px] w-full">
              <BarChart
                data={analyticsFunnel}
                layout="vertical"
                margin={{ left: 10, right: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: "#71717a", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="stage"
                  tick={{ fill: "#a1a1aa", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} barSize={28} />
              </BarChart>
            </ChartContainer>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {analyticsFunnel.map(
                (stage) =>
                  stage.stepRate !== null && (
                    <div key={stage.stage} className="text-xs text-zinc-500">
                      <span className="text-zinc-400">{stage.stage}:</span>{" "}
                      <span className="font-mono text-emerald-400">
                        {stage.stepRate}%
                      </span>{" "}
                      from previous
                    </div>
                  )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chart 3: Score Distribution */}
        <Card className="border-zinc-800/50 bg-zinc-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Score Distribution
            </CardTitle>
            <p className="text-xs text-zinc-500">
              AI qualification score breakdown
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={scoreConfig} className="h-[280px] w-full">
              <BarChart data={analyticsScoreDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="range"
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: "#71717a", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                  {analyticsScoreDist.map((entry) => (
                    <Cell key={entry.range} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
            <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
              <span>Cold leads</span>
              <span>
                Peak:{" "}
                <span className="font-mono text-emerald-400">312 leads</span> at
                60-80 score
              </span>
              <span>Hot leads</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row: Sources + Areas + Brand Demand */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Chart 4: Best Sources */}
        <Card className="border-zinc-800/50 bg-zinc-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Best Performing Sources
            </CardTitle>
            <p className="text-xs text-zinc-500">Conversion rate by channel</p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={sourcesConfig} className="h-[240px] w-full">
              <BarChart data={analyticsSources}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="source"
                  tick={{ fill: "#71717a", fontSize: 9 }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  tick={{ fill: "#71717a", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  unit="%"
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="rate" fill="#10b981" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Chart 5: Top Areas */}
        <Card className="border-zinc-800/50 bg-zinc-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Top Areas
            </CardTitle>
            <p className="text-xs text-zinc-500">Lead volume by suburb</p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={areasConfig} className="h-[240px] w-full">
              <BarChart
                data={analyticsAreas}
                layout="vertical"
                margin={{ left: 0, right: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: "#71717a", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="area"
                  tick={{ fill: "#a1a1aa", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={85}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="leads" fill="#10b981" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Chart 6: Brand Demand */}
        <Card className="border-zinc-800/50 bg-zinc-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">
              Brand Demand
            </CardTitle>
            <p className="text-xs text-zinc-500">Share of buyer interest</p>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsBrands}
                    dataKey="pct"
                    nameKey="brand"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    strokeWidth={2}
                    stroke="#18181b"
                  >
                    {analyticsBrands.map((entry) => (
                      <Cell key={entry.brand} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Share"]}
                    contentStyle={{
                      background: "#18181b",
                      border: "1px solid #27272a",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    itemStyle={{ color: "#e4e4e7" }}
                    labelStyle={{ color: "#a1a1aa" }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => (
                      <span className="text-xs text-zinc-400">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Performance Table */}
      <Card className="border-zinc-800/50 bg-zinc-900/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium text-zinc-300">
                Monthly Performance
              </CardTitle>
              <p className="text-xs text-zinc-500">
                Last 6 months — leads, test drives, sales, revenue, ROI
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            >
              Trending Up
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800/50 hover:bg-transparent">
                <TableHead className="text-zinc-400">Month</TableHead>
                <TableHead className="text-right text-zinc-400">Leads</TableHead>
                <TableHead className="text-right text-zinc-400">
                  Test Drives
                </TableHead>
                <TableHead className="text-right text-zinc-400">Sales</TableHead>
                <TableHead className="text-right text-zinc-400">
                  Revenue
                </TableHead>
                <TableHead className="text-right text-zinc-400">ROI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analyticsMonthly.map((row, i) => {
                const prevLeads = i > 0 ? analyticsMonthly[i - 1].leads : row.leads;
                const leadsTrend = row.leads >= prevLeads;
                return (
                  <TableRow
                    key={row.month}
                    className="border-zinc-800/30 hover:bg-zinc-800/30"
                  >
                    <TableCell className="font-medium text-zinc-200">
                      {row.month}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-zinc-200">{row.leads}</span>
                        {leadsTrend ? (
                          <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 text-red-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-zinc-300">
                      {row.testDrives}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-mono text-emerald-400">
                        {row.sales}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-zinc-200">
                      {formatRand(row.revenue)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-mono",
                          row.roi >= 300
                            ? "border-emerald-500/30 text-emerald-400"
                            : row.roi >= 250
                              ? "border-blue-500/30 text-blue-400"
                              : "border-zinc-700 text-zinc-400"
                        )}
                      >
                        {row.roi}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {/* Totals */}
          <div className="mt-4 flex flex-wrap items-center gap-6 border-t border-zinc-800/50 pt-4">
            <div className="text-xs text-zinc-500">
              Total Leads:{" "}
              <span className="font-mono text-zinc-200">
                {analyticsMonthly.reduce((s, r) => s + r.leads, 0)}
              </span>
            </div>
            <div className="text-xs text-zinc-500">
              Total Sales:{" "}
              <span className="font-mono text-emerald-400">
                {analyticsMonthly.reduce((s, r) => s + r.sales, 0)}
              </span>
            </div>
            <div className="text-xs text-zinc-500">
              Total Revenue:{" "}
              <span className="font-mono text-zinc-200">
                {formatRand(
                  analyticsMonthly.reduce((s, r) => s + r.revenue, 0)
                )}
              </span>
            </div>
            <div className="text-xs text-zinc-500">
              Avg ROI:{" "}
              <span className="font-mono text-emerald-400">
                {Math.round(
                  analyticsMonthly.reduce((s, r) => s + r.roi, 0) /
                    analyticsMonthly.length
                )}
                %
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
