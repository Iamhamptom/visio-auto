"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import {
  Zap,
  Brain,
  Car,
  MessageCircle,
  CheckCircle2,
  ArrowRight,
  Shield,
  Globe,
  Clock,
  BarChart3,
  Star,
  Phone,
  Users,
  Building2,
  Target,
  TrendingUp,
  Radio,
  FileText,
  Sparkles,
  Crown,
  Gem,
  ChevronRight,
  BadgeCheck,
  Activity,
  Eye,
  Search,
  Briefcase,
  DollarSign,
  Wallet,
  Truck,
  Baby,
  Plane,
  Home,
  GraduationCap,
  Heart,
  Banknote,
  UserPlus,
  AlertTriangle,
  Award,
  RefreshCw,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ---------------------------------------------------------------------------
// Signal types (23 buying triggers)
// ---------------------------------------------------------------------------
const signals = [
  { name: "Job Promotion", icon: TrendingUp, category: "Career" },
  { name: "New Employment", icon: Briefcase, category: "Career" },
  { name: "CIPC Registration", icon: Building2, category: "Business" },
  { name: "Funding Round", icon: DollarSign, category: "Business" },
  { name: "Salary Increase", icon: Wallet, category: "Financial" },
  { name: "Property Purchase", icon: Home, category: "Financial" },
  { name: "Lease Expiration", icon: RefreshCw, category: "Vehicle" },
  { name: "Insurance Write-Off", icon: AlertTriangle, category: "Vehicle" },
  { name: "Mileage Threshold", icon: Activity, category: "Vehicle" },
  { name: "Service History Gap", icon: Clock, category: "Vehicle" },
  { name: "Trade-In Search", icon: Search, category: "Intent" },
  { name: "Dealer Visit Intent", icon: Eye, category: "Intent" },
  { name: "Finance Pre-Approval", icon: Banknote, category: "Financial" },
  { name: "Relocation Signal", icon: Truck, category: "Life Event" },
  { name: "New Baby/Family Growth", icon: Baby, category: "Life Event" },
  { name: "Expat Arrival", icon: Plane, category: "Life Event" },
  { name: "Marriage/Partnership", icon: Heart, category: "Life Event" },
  { name: "Graduation/Qualification", icon: GraduationCap, category: "Life Event" },
  { name: "Social Media Intent", icon: Radio, category: "Digital" },
  { name: "Facebook Group Activity", icon: Users, category: "Digital" },
  { name: "Price Comparison Search", icon: Search, category: "Digital" },
  { name: "C-Suite Appointment", icon: Crown, category: "Business" },
  { name: "Fleet Contract Expiry", icon: FileText, category: "Business" },
];

// ---------------------------------------------------------------------------
// 10 Things Nobody Else Offers
// ---------------------------------------------------------------------------
const tenThings = [
  {
    num: "01",
    title: "Signal Intelligence",
    sub: "23 buying triggers detected",
    desc: "We monitor job portals, CIPC, property registrations, social media, and insurance databases to detect imminent car buyers before they start shopping.",
    icon: Zap,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    num: "02",
    title: "30-Second WhatsApp Response",
    sub: "6 SA languages",
    desc: "Qualified leads arrive on your sales team's WhatsApp in under 30 seconds with full context, budget estimate, and suggested vehicle matches. English, Afrikaans, Zulu, Xhosa, Sotho, Tswana.",
    icon: MessageCircle,
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  {
    num: "03",
    title: "VIN-Specific Matching",
    sub: "Your exact stock matched to buyers",
    desc: "We sync your inventory daily. When a buyer's budget, brand preference, and needs align with a specific car on your floor, we match them to that VIN.",
    icon: Car,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    num: "04",
    title: "AI Voice Calling",
    sub: "Retell AI in Zulu/Afrikaans/English",
    desc: "Our AI agent calls leads to qualify them: budget, timeline, trade-in, financing needs. Human-level conversation in 3 languages.",
    icon: Phone,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    num: "05",
    title: "Automated Follow-Ups",
    sub: "Day 1/3/7/14/30 — no lead forgotten",
    desc: "78% of buyers purchase from the first responder. Our 5-touch sequence ensures you're always first, even at 2am on a Sunday.",
    icon: RefreshCw,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    num: "06",
    title: "AI Lead Enrichment",
    sub: "Company, budget, decision makers",
    desc: "Every lead is enriched with company name, job title, estimated income bracket, LinkedIn profile, and decision-maker status before you see it.",
    icon: Brain,
    color: "text-rose-400",
    bg: "bg-rose-400/10",
  },
  {
    num: "07",
    title: "Bloomberg Market Terminal",
    sub: "Real-time SA car market data",
    desc: "Live market intelligence: average prices by model, days-on-lot trends, regional demand heatmaps, competitor pricing, and seasonal patterns.",
    icon: BarChart3,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
  },
  {
    num: "08",
    title: "Marketplace Distribution",
    sub: "1 lead to up to 5 dealers",
    desc: "Unmatched leads are offered to up to 5 dealers in the area. First to respond wins the introduction. Speed wins.",
    icon: Globe,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
  {
    num: "09",
    title: "Monthly ROI Reports",
    sub: "AI executive summary proving your return",
    desc: "An AI-generated report every month: leads received, leads converted, revenue attributed, cost per acquisition, and recommendations.",
    icon: FileText,
    color: "text-teal-400",
    bg: "bg-teal-400/10",
  },
  {
    num: "10",
    title: "Self-Serve Portal",
    sub: "See your leads, update status, export",
    desc: "Your own dashboard at /client/[your-id]. See every lead, their score, matched vehicles, follow-up history, and conversion status. Export to CSV anytime.",
    icon: Target,
    color: "text-indigo-400",
    bg: "bg-indigo-400/10",
  },
];

// ---------------------------------------------------------------------------
// Tier pricing
// ---------------------------------------------------------------------------
const tiers = [
  {
    name: "Free Trial",
    slug: "free",
    price: "R0",
    period: "",
    leads: "5 leads",
    description: "See the platform in action. No credit card.",
    features: [
      "5 AI-qualified leads",
      "Basic dashboard access",
      "Lead scoring preview",
      "Signal samples from your area",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: false,
    amountCents: 0,
  },
  {
    name: "Starter",
    slug: "starter",
    price: "R5,000",
    period: "/month",
    leads: "25 leads/month",
    description: "For independent dealers getting started.",
    features: [
      "25 AI-qualified leads",
      "WhatsApp delivery",
      "Lead scoring + enrichment",
      "Basic dashboard",
      "Dealer brief per lead",
      "Email support",
    ],
    cta: "Get Started",
    popular: false,
    amountCents: 500000,
  },
  {
    name: "Growth",
    slug: "growth",
    price: "R15,000",
    period: "/month",
    leads: "100 leads/month",
    description: "The sweet spot. Most dealerships choose this.",
    features: [
      "100 AI-qualified leads",
      "WhatsApp + CRM integration",
      "AI Voice calling (Retell)",
      "Marketplace distribution",
      "Full enrichment + briefs",
      "VIN matching",
      "Analytics dashboard",
      "Priority support",
    ],
    cta: "Get Started",
    popular: true,
    amountCents: 1500000,
  },
  {
    name: "Pro",
    slug: "pro",
    price: "R50,000",
    period: "/month",
    leads: "500 leads/month",
    description: "For dealer groups and multi-branch operations.",
    features: [
      "500 AI-qualified leads",
      "Multi-location support",
      "Bloomberg Market Terminal",
      "Custom AI scoring models",
      "API access",
      "Social Radar monitoring",
      "Monthly ROI reports",
      "Dedicated account manager",
    ],
    cta: "Get Started",
    popular: false,
    amountCents: 5000000,
  },
  {
    name: "Enterprise",
    slug: "enterprise",
    price: "R150,000+",
    period: "/month",
    leads: "Unlimited leads",
    description: "For OEMs and national dealer networks.",
    features: [
      "Unlimited AI leads",
      "White-label platform",
      "National coverage",
      "Custom signal development",
      "Fleet + corporate leads",
      "SLA guarantee",
      "On-site training",
      "24/7 dedicated support",
    ],
    cta: "Talk to Us",
    popular: false,
    amountCents: 15000000,
  },
];

// ---------------------------------------------------------------------------
// ROI Calculator helper
// ---------------------------------------------------------------------------
const leadOptions = [25, 50, 100, 200, 300, 500];
const avgPriceOptions = [
  { label: "R200K (Used)", value: 200000 },
  { label: "R350K (Volume)", value: 350000 },
  { label: "R600K (Mid-Premium)", value: 600000 },
  { label: "R800K (Premium)", value: 800000 },
  { label: "R1.5M (Luxury)", value: 1500000 },
  { label: "R2M+ (Exotic)", value: 2000000 },
];
const closeRateOptions = [
  { label: "5%", value: 0.05 },
  { label: "8%", value: 0.08 },
  { label: "10%", value: 0.1 },
  { label: "15%", value: 0.15 },
  { label: "20%", value: 0.2 },
];

function formatZAR(n: number) {
  return "R" + n.toLocaleString("en-ZA");
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------
export default function WhyVisioAutoPage() {
  // ROI calculator state
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [leads, setLeads] = useState(100);
  const [avgPrice, setAvgPrice] = useState(350000);
  const [closeRate, setCloseRate] = useState(0.1);

  const sales = Math.round(leads * closeRate);
  const revenue = sales * avgPrice;
  // Estimate their tier cost
  const tierCost =
    leads <= 25
      ? 5000
      : leads <= 100
        ? 15000
        : leads <= 500
          ? 50000
          : 150000;
  const roi = tierCost > 0 ? Math.round(revenue / tierCost) : 0;
  const costPerSale = sales > 0 ? Math.round(tierCost / sales) : 0;

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* ---------------------------------------------------------------- */}
      {/* NAV */}
      {/* ---------------------------------------------------------------- */}
      <nav className="fixed top-0 z-50 w-full border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
              <Car className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">
              Visio Auto
            </span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#solution"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              Solution
            </a>
            <a
              href="#dealers"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              For Dealers
            </a>
            <a
              href="#pricing"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              Pricing
            </a>
            <a
              href="#roi"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              ROI Calculator
            </a>
            <Link href="/get-started">
              <Button
                size="sm"
                className="bg-emerald-600 text-white hover:bg-emerald-500"
              >
                Start Free Trial
              </Button>
            </Link>
          </div>
          <button
            className="md:hidden text-zinc-400 hover:text-white"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Toggle menu"
          >
            {mobileNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {mobileNavOpen && (
          <div className="md:hidden border-t border-zinc-800/50 bg-zinc-950/98 px-6 py-4 space-y-3">
            <a href="#solution" className="block text-sm text-zinc-300 hover:text-white" onClick={() => setMobileNavOpen(false)}>Solution</a>
            <a href="#dealers" className="block text-sm text-zinc-300 hover:text-white" onClick={() => setMobileNavOpen(false)}>For Dealers</a>
            <a href="#pricing" className="block text-sm text-zinc-300 hover:text-white" onClick={() => setMobileNavOpen(false)}>Pricing</a>
            <a href="#roi" className="block text-sm text-zinc-300 hover:text-white" onClick={() => setMobileNavOpen(false)}>ROI Calculator</a>
            <Link href="/get-started" onClick={() => setMobileNavOpen(false)}>
              <Button size="sm" className="w-full mt-2 bg-emerald-600 text-white hover:bg-emerald-500">
                Start Free Trial
              </Button>
            </Link>
          </div>
        )}
      </nav>

      {/* ---------------------------------------------------------------- */}
      {/* HERO */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden pt-32 pb-24">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-emerald-500/5 blur-[140px]" />

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <Badge className="mb-6 border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10">
            <Sparkles className="mr-1.5 h-3 w-3" />
            South Africa&apos;s First AI Dealership Intelligence Platform
          </Badge>

          <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            We Find Car Buyers{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              Before They Walk Into Any Dealership
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-zinc-400 md:text-xl">
            AI-qualified, scored, and delivered to your WhatsApp in{" "}
            <span className="font-semibold text-white">30 seconds</span>.
            23 buying triggers. 6 SA languages. VIN-specific matching to
            your exact stock.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/get-started">
              <Button
                size="lg"
                className="h-13 gap-2 bg-emerald-600 px-8 text-base text-white hover:bg-emerald-500"
              >
                Start Your Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#solution">
              <Button
                variant="outline"
                size="lg"
                className="h-13 border-zinc-700 px-8 text-base text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                See How It Works
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Dealerships Identified", value: "329+", icon: Car },
              { label: "Buying Signals", value: "23", icon: Zap },
              { label: "SA Languages", value: "6", icon: Globe },
              { label: "Response Time", value: "30s", icon: Clock },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1 rounded-xl border border-zinc-800/50 bg-zinc-900/50 px-4 py-5"
              >
                <stat.icon className="mb-1 h-5 w-5 text-emerald-400" />
                <span className="font-mono text-2xl font-bold text-white">
                  {stat.value}
                </span>
                <span className="text-xs text-zinc-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* THE PROBLEM */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-t border-zinc-800/50 bg-zinc-900/30 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <Badge className="mb-4 border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/10">
              The Problem
            </Badge>
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Dealerships are bleeding money on outdated lead gen
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {[
              {
                stat: "R5K-R50K/mo",
                title: "AutoTrader Listings",
                desc: "Passive listings that attract tire-kickers. You pay to be seen, not to sell. No intelligence, no qualification, no urgency detection.",
              },
              {
                stat: "R30-R80/click",
                title: "Google Ads",
                desc: "1.5% average conversion rate. R2,000-R5,000 per lead that actually walks in. And they're comparing you with 5 other dealers.",
              },
              {
                stat: "4+ hours",
                title: "Average Response Time",
                desc: "78% of car buyers purchase from the FIRST dealership that responds. If you take 4 hours, you've already lost the sale.",
              },
              {
                stat: "Zero",
                title: "Intelligence",
                desc: "You don't know WHO is buying until they walk in. No budget data, no timeline, no trade-in signals, no decision-maker info. You're selling blind.",
              },
            ].map((item) => (
              <Card
                key={item.title}
                className="border-zinc-800/50 bg-zinc-900/50"
              >
                <CardContent className="pt-6">
                  <div className="mb-3 font-mono text-2xl font-bold text-red-400">
                    {item.stat}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-400">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 10 THINGS NOBODY ELSE OFFERS */}
      {/* ---------------------------------------------------------------- */}
      <section id="solution" className="border-t border-zinc-800/50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <Badge className="mb-4 border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10">
              Our Solution
            </Badge>
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              10 Things Nobody Else Offers
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
              Not a listing platform. Not a CRM. An AI intelligence system
              that finds buyers before they start shopping and delivers them
              to your WhatsApp.
            </p>
          </div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {tenThings.slice(0, 5).map((item) => (
              <Card
                key={item.num}
                className="border-zinc-800/50 bg-zinc-900/50 transition-colors hover:border-emerald-500/30"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.bg}`}
                    >
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <span className="font-mono text-xs text-zinc-600">
                      {item.num}
                    </span>
                  </div>
                  <CardTitle className="mt-2 text-base text-white">
                    {item.title}
                  </CardTitle>
                  <p className="text-xs font-medium text-emerald-400">
                    {item.sub}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-xs leading-relaxed text-zinc-400">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {tenThings.slice(5, 10).map((item) => (
              <Card
                key={item.num}
                className="border-zinc-800/50 bg-zinc-900/50 transition-colors hover:border-emerald-500/30"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.bg}`}
                    >
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <span className="font-mono text-xs text-zinc-600">
                      {item.num}
                    </span>
                  </div>
                  <CardTitle className="mt-2 text-base text-white">
                    {item.title}
                  </CardTitle>
                  <p className="text-xs font-medium text-emerald-400">
                    {item.sub}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-xs leading-relaxed text-zinc-400">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* FOR DEALERS — Tabbed segments */}
      {/* ---------------------------------------------------------------- */}
      <section
        id="dealers"
        className="border-t border-zinc-800/50 bg-zinc-900/30 py-24"
      >
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <Badge className="mb-4 border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-800">
              For Every Dealer Type
            </Badge>
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Built for how YOU sell cars
            </h2>
          </div>

          <Tabs defaultValue="volume" className="mt-12">
            <TabsList className="mx-auto grid w-full max-w-2xl grid-cols-4 bg-zinc-900 border border-zinc-800">
              <TabsTrigger value="volume" className="text-xs sm:text-sm data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                Volume
              </TabsTrigger>
              <TabsTrigger value="premium" className="text-xs sm:text-sm data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                Premium
              </TabsTrigger>
              <TabsTrigger value="luxury" className="text-xs sm:text-sm data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                Luxury
              </TabsTrigger>
              <TabsTrigger value="used" className="text-xs sm:text-sm data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                Used Cars
              </TabsTrigger>
            </TabsList>

            {/* Volume Dealers */}
            <TabsContent value="volume">
              <Card className="mt-6 border-zinc-800/50 bg-zinc-900/50">
                <CardContent className="pt-8">
                  <div className="flex flex-col gap-8 lg:flex-row">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-emerald-400" />
                        <h3 className="text-xl font-bold text-white">
                          Toyota, VW, Hyundai, Suzuki, Kia
                        </h3>
                      </div>
                      <p className="mb-6 text-zinc-400">
                        High volume, fast turnaround. You need speed and scale.
                      </p>
                      <ul className="space-y-3">
                        {[
                          "WhatsApp delivery in all 6 SA languages — reach Soweto, Pretoria, Durban simultaneously",
                          "VIN matching — our AI matches leads to specific cars on your floor",
                          "Automated Day 1/3/7 follow-ups keep your pipeline warm",
                          "Inventory sync — we know what you have before the buyer asks",
                        ].map((f) => (
                          <li
                            key={f}
                            className="flex items-start gap-2 text-sm text-zinc-300"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex-shrink-0 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 lg:w-72">
                      <p className="text-xs font-medium uppercase tracking-wider text-emerald-400">
                        The Math
                      </p>
                      <div className="mt-3 space-y-2 font-mono text-sm">
                        <p className="text-zinc-300">
                          100 leads x 10% close rate
                        </p>
                        <p className="text-zinc-300">
                          x R350K avg vehicle price
                        </p>
                        <div className="border-t border-emerald-500/20 pt-2">
                          <p className="text-2xl font-bold text-emerald-400">
                            = R3.5M in sales
                          </p>
                          <p className="text-zinc-500">
                            Your investment: R15K/mo
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 rounded-lg bg-zinc-900/80 p-3">
                        <p className="text-xs text-zinc-400">
                          <span className="font-semibold text-white">
                            Case:{" "}
                          </span>
                          A Hyundai dealer in Sandton received 12 hot leads in
                          week 1. 3 converted to test drives. 1 sold a Creta
                          for R429K.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Premium Dealers */}
            <TabsContent value="premium">
              <Card className="mt-6 border-zinc-800/50 bg-zinc-900/50">
                <CardContent className="pt-8">
                  <div className="flex flex-col gap-8 lg:flex-row">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Star className="h-5 w-5 text-blue-400" />
                        <h3 className="text-xl font-bold text-white">
                          BMW, Mercedes-Benz, Audi, Land Rover, Porsche
                        </h3>
                      </div>
                      <p className="mb-6 text-zinc-400">
                        Your buyers are executives, professionals, and
                        entrepreneurs. Quality over quantity.
                      </p>
                      <ul className="space-y-3">
                        {[
                          "Full lead enrichment — company name, job title, estimated income, LinkedIn profile",
                          "AI voice qualification in English — confirms budget, timeline, and trade-in",
                          "Bloomberg Market Terminal — know the competitive landscape before the customer walks in",
                          "Detailed dealer briefs with buyer persona, suggested vehicles, and talking points",
                        ].map((f) => (
                          <li
                            key={f}
                            className="flex items-start gap-2 text-sm text-zinc-300"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex-shrink-0 rounded-xl border border-blue-500/20 bg-blue-500/5 p-6 lg:w-72">
                      <p className="text-xs font-medium uppercase tracking-wider text-blue-400">
                        The Math
                      </p>
                      <div className="mt-3 space-y-2 font-mono text-sm">
                        <p className="text-zinc-300">
                          50 leads x 15% close rate
                        </p>
                        <p className="text-zinc-300">
                          x R800K avg vehicle price
                        </p>
                        <div className="border-t border-blue-500/20 pt-2">
                          <p className="text-2xl font-bold text-blue-400">
                            = R6M in sales
                          </p>
                          <p className="text-zinc-500">
                            Your investment: R50K/mo
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 rounded-lg bg-zinc-900/80 p-3">
                        <p className="text-xs text-zinc-400">
                          <span className="font-semibold text-white">
                            Case:{" "}
                          </span>
                          An Audi dealer in Bryanston got a signal: VP promoted
                          at Accenture, R1.2M budget. AI called in English,
                          booked test drive. Q5 sold within a week.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Luxury/Exotic */}
            <TabsContent value="luxury">
              <Card className="mt-6 border-zinc-800/50 bg-zinc-900/50">
                <CardContent className="pt-8">
                  <div className="flex flex-col gap-8 lg:flex-row">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Crown className="h-5 w-5 text-amber-400" />
                        <h3 className="text-xl font-bold text-white">
                          Pharoah, Daytona, Prestige Marques
                        </h3>
                      </div>
                      <p className="mb-6 text-zinc-400">
                        High-net-worth individuals. R2M+ transactions. Every
                        detail matters.
                      </p>
                      <ul className="space-y-3">
                        {[
                          "HNW signals — funding rounds, C-suite appointments, expat arrivals, property purchases",
                          "Personalized concierge approach — AI-crafted outreach matching buyer's profile and lifestyle",
                          "Detailed dealer brief with buyer persona, net worth indicators, and vehicle preferences",
                          "1-on-1 account management — we treat your leads like private banking clients",
                        ].map((f) => (
                          <li
                            key={f}
                            className="flex items-start gap-2 text-sm text-zinc-300"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex-shrink-0 rounded-xl border border-amber-500/20 bg-amber-500/5 p-6 lg:w-72">
                      <p className="text-xs font-medium uppercase tracking-wider text-amber-400">
                        The Math
                      </p>
                      <div className="mt-3 space-y-2 font-mono text-sm">
                        <p className="text-zinc-300">
                          10 HNW leads x 30% close
                        </p>
                        <p className="text-zinc-300">
                          x R2M avg vehicle price
                        </p>
                        <div className="border-t border-amber-500/20 pt-2">
                          <p className="text-2xl font-bold text-amber-400">
                            = R6M in sales
                          </p>
                          <p className="text-zinc-500">
                            Your investment: R150K/mo
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 rounded-lg bg-zinc-900/80 p-3">
                        <p className="text-xs text-zinc-400">
                          <span className="font-semibold text-white">
                            Case:{" "}
                          </span>
                          Pharoah Auto received a signal: UK expat relocating to
                          Sandton, R2M+ budget. AI qualification call in
                          English. Porsche Cayenne S sold.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Used Car Dealers */}
            <TabsContent value="used">
              <Card className="mt-6 border-zinc-800/50 bg-zinc-900/50">
                <CardContent className="pt-8">
                  <div className="flex flex-col gap-8 lg:flex-row">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Gem className="h-5 w-5 text-violet-400" />
                        <h3 className="text-xl font-bold text-white">
                          Independent & Used Car Dealers
                        </h3>
                      </div>
                      <p className="mb-6 text-zinc-400">
                        High volume, budget-conscious buyers. Speed and value
                        win.
                      </p>
                      <ul className="space-y-3">
                        {[
                          "Write-off detection — buyers whose cars were written off need a replacement NOW",
                          "Lease expiration signals — catch them before they walk into a franchise",
                          "Facebook group monitoring — active buyers in SA car groups, Marketplace, and forums",
                          "Budget buyer matching — pair your R150-300K stock with the right income profiles",
                        ].map((f) => (
                          <li
                            key={f}
                            className="flex items-start gap-2 text-sm text-zinc-300"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex-shrink-0 rounded-xl border border-violet-500/20 bg-violet-500/5 p-6 lg:w-72">
                      <p className="text-xs font-medium uppercase tracking-wider text-violet-400">
                        The Math
                      </p>
                      <div className="mt-3 space-y-2 font-mono text-sm">
                        <p className="text-zinc-300">
                          200 leads x 8% close rate
                        </p>
                        <p className="text-zinc-300">
                          x R250K avg vehicle price
                        </p>
                        <div className="border-t border-violet-500/20 pt-2">
                          <p className="text-2xl font-bold text-violet-400">
                            = R4M in sales
                          </p>
                          <p className="text-zinc-500">
                            Your investment: R15K/mo
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 rounded-lg bg-zinc-900/80 p-3">
                        <p className="text-xs text-zinc-400">
                          <span className="font-semibold text-white">
                            Case:{" "}
                          </span>
                          We detect write-offs, lease expirations, and
                          budget-conscious buyers actively searching Facebook
                          groups. These are hot buyers with urgency.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* SIGNAL TYPES GRID */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-t border-zinc-800/50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <Badge className="mb-4 border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10">
              Signal Intelligence
            </Badge>
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              23 Buying Signals We Track
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-zinc-400">
              Every signal represents a life event that predicts a car
              purchase within 30-90 days.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {signals.map((sig) => (
              <div
                key={sig.name}
                className="group flex flex-col items-center gap-2 rounded-xl border border-zinc-800/50 bg-zinc-900/50 px-3 py-4 transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/5"
              >
                <sig.icon className="h-5 w-5 text-zinc-500 transition-colors group-hover:text-emerald-400" />
                <span className="text-center text-xs font-medium text-zinc-300">
                  {sig.name}
                </span>
                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">
                  {sig.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* MARKET TERMINAL PREVIEW */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-t border-zinc-800/50 bg-zinc-900/30 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <Badge className="mb-4 border-cyan-500/20 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/10">
              <BarChart3 className="mr-1.5 h-3 w-3" />
              Market Terminal
            </Badge>
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Your Bloomberg for the SA Car Market
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-zinc-400">
              Real-time market intelligence that gives you an unfair
              advantage.
            </p>
          </div>

          {/* Mock terminal */}
          <div className="mt-12 overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-950">
            <div className="flex items-center gap-2 border-b border-zinc-800/50 bg-zinc-900/50 px-4 py-2.5">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="ml-2 font-mono text-xs text-zinc-500">
                Visio Auto Market Terminal v2.0
              </span>
            </div>
            <div className="grid grid-cols-3 gap-px bg-zinc-800/50 p-px">
              {[
                {
                  label: "Toyota Hilux",
                  price: "R612,400",
                  change: "+2.3%",
                  vol: "1,240 units",
                  up: true,
                },
                {
                  label: "VW Polo",
                  price: "R389,900",
                  change: "-0.8%",
                  vol: "2,100 units",
                  up: false,
                },
                {
                  label: "Ford Ranger",
                  price: "R598,000",
                  change: "+4.1%",
                  vol: "890 units",
                  up: true,
                },
                {
                  label: "BMW 3 Series",
                  price: "R849,000",
                  change: "+1.2%",
                  vol: "540 units",
                  up: true,
                },
                {
                  label: "Hyundai Creta",
                  price: "R429,900",
                  change: "+3.7%",
                  vol: "780 units",
                  up: true,
                },
                {
                  label: "Mercedes C-Class",
                  price: "R912,000",
                  change: "-1.5%",
                  vol: "320 units",
                  up: false,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="bg-zinc-950 p-4"
                >
                  <p className="font-mono text-xs text-zinc-500">
                    {row.label}
                  </p>
                  <p className="mt-1 font-mono text-lg font-bold text-white">
                    {row.price}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`font-mono text-xs font-medium ${row.up ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {row.change}
                    </span>
                    <span className="text-xs text-zinc-600">{row.vol}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-zinc-800/50 px-4 py-2">
              <p className="font-mono text-[10px] text-zinc-600">
                Data refreshed every 15 min | Sources: TransUnion Auto, WesBank,
                Lightstone | Pro + Enterprise plans
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* PRICING */}
      {/* ---------------------------------------------------------------- */}
      <section id="pricing" className="border-t border-zinc-800/50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <Badge className="mb-4 border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-800">
              Pricing
            </Badge>
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-zinc-400">
              No setup fees. No lock-in contracts. Cancel anytime. Every paid
              plan includes our 4x ROI guarantee.
            </p>
          </div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {tiers.map((tier) => (
              <Card
                key={tier.slug}
                className={`relative flex flex-col border-zinc-800/50 bg-zinc-900/50 ${
                  tier.popular
                    ? "ring-2 ring-emerald-500/50 shadow-[0_0_40px_-12px_rgba(16,185,129,0.3)]"
                    : ""
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-3">
                  <CardTitle className="text-white">{tier.name}</CardTitle>
                  <CardDescription className="text-zinc-500">
                    {tier.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-1">
                    <span className="font-mono text-3xl font-bold text-white">
                      {tier.price}
                    </span>
                    {tier.period && (
                      <span className="text-sm text-zinc-500">
                        {tier.period}
                      </span>
                    )}
                  </div>
                  <p className="mb-5 text-xs text-emerald-400">{tier.leads}</p>
                  <ul className="space-y-2">
                    {tier.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-xs"
                      >
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        <span className="text-zinc-300">{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link
                    href={
                      tier.slug === "enterprise"
                        ? "/get-quote"
                        : `/get-started?tier=${tier.slug}`
                    }
                    className="w-full"
                  >
                    <Button
                      className={`w-full ${
                        tier.popular
                          ? "bg-emerald-600 text-white hover:bg-emerald-500"
                          : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                      }`}
                    >
                      {tier.cta}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* ROI CALCULATOR */}
      {/* ---------------------------------------------------------------- */}
      <section
        id="roi"
        className="border-t border-zinc-800/50 bg-zinc-900/30 py-24"
      >
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <Badge className="mb-4 border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10">
              <TrendingUp className="mr-1.5 h-3 w-3" />
              ROI Calculator
            </Badge>
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Calculate your return
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-zinc-400">
              See exactly what Visio Auto can deliver for your dealership.
            </p>
          </div>

          <Card className="mt-12 border-zinc-800/50 bg-zinc-950">
            <CardContent className="pt-8">
              <div className="grid gap-8 lg:grid-cols-2">
                {/* Inputs */}
                <div className="space-y-6">
                  {/* Leads per month */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      Leads per month
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {leadOptions.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setLeads(opt)}
                          className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                            leads === opt
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                              : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Average vehicle price */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      Average vehicle price
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {avgPriceOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setAvgPrice(opt.value)}
                          className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                            avgPrice === opt.value
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                              : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Close rate */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      Your close rate
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {closeRateOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setCloseRate(opt.value)}
                          className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                            closeRate === opt.value
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                              : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Results */}
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-emerald-400">
                    Your Projected Results
                  </p>

                  <div className="mt-6 space-y-4">
                    <div>
                      <p className="text-sm text-zinc-400">
                        Estimated monthly sales
                      </p>
                      <p className="font-mono text-3xl font-bold text-white">
                        {sales} vehicles
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">
                        Projected monthly revenue
                      </p>
                      <p className="font-mono text-3xl font-bold text-emerald-400">
                        {formatZAR(revenue)}
                      </p>
                    </div>
                    <div className="border-t border-emerald-500/20 pt-4">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-xs text-zinc-500">
                            Your investment
                          </p>
                          <p className="font-mono text-lg font-semibold text-white">
                            {formatZAR(tierCost)}/mo
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">ROI</p>
                          <p className="font-mono text-lg font-semibold text-emerald-400">
                            {roi}x
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">
                            Cost per sale
                          </p>
                          <p className="font-mono text-lg font-semibold text-white">
                            {formatZAR(costPerSale)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link href="/get-started" className="mt-6 block">
                    <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-500">
                      Get Started Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* SOCIAL PROOF */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-t border-zinc-800/50 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <Badge className="mb-4 border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-800">
              Trusted By
            </Badge>
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              South Africa trusts Visio
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                quote:
                  "We closed 12 deals in our first month. The AI scoring is incredibly accurate — we know who's ready to buy before they walk in.",
                name: "Johan van der Merwe",
                role: "Dealer Principal, Sandton Motor Group",
                stars: 5,
              },
              {
                quote:
                  "Leads arrive on WhatsApp before we even finish our morning coffee. The VIN matching means we're showing the right car from minute one.",
                name: "Priya Naidoo",
                role: "Sales Manager, AutoBay Menlyn",
                stars: 5,
              },
              {
                quote:
                  "4.2x ROI in 90 days. We've tripled our sales team's conversion rate. The market terminal alone is worth the subscription.",
                name: "Thabo Mokoena",
                role: "CEO, Mzansi Motors",
                stars: 5,
              },
            ].map((t) => (
              <Card
                key={t.name}
                className="border-zinc-800/50 bg-zinc-900/50"
              >
                <CardContent className="pt-6">
                  <div className="mb-3 flex gap-0.5">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-300">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-4 border-t border-zinc-800 pt-4">
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-zinc-500">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-zinc-500">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-400" />
              <span className="text-sm">Powered by VisioCorp AI</span>
            </div>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              <span className="text-sm">
                Same team: Tony Duardo, Tyla, Uncle Waffles, Ciza
              </span>
            </div>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-400" />
              <span className="text-sm">POPIA Compliant</span>
            </div>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-emerald-400" />
              <span className="text-sm">SA-Built, SA-Hosted</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* FINAL CTA */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-t border-zinc-800/50 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-zinc-900 to-zinc-950 p-12">
            <Shield className="mx-auto mb-4 h-12 w-12 text-emerald-400" />
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Start Your Free Trial
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-zinc-400">
              See signals in your area within 24 hours. 5 free leads. No credit
              card required. Cancel anytime.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/get-started">
                <Button
                  size="lg"
                  className="h-13 gap-2 bg-emerald-600 px-10 text-base text-white hover:bg-emerald-500"
                >
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/get-quote">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-13 border-zinc-700 px-8 text-base text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  Talk to Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* FOOTER */}
      {/* ---------------------------------------------------------------- */}
      <footer className="border-t border-zinc-800/50 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500">
                <Car className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium text-zinc-400">
                Visio Auto
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-600">
              <Link
                href="/"
                className="transition-colors hover:text-zinc-400"
              >
                Home
              </Link>
              <Link
                href="/why-visio-auto"
                className="transition-colors hover:text-zinc-400"
              >
                Why Visio Auto
              </Link>
              <Link
                href="/get-started"
                className="transition-colors hover:text-zinc-400"
              >
                Get Started
              </Link>
              <Link
                href="/dashboard"
                className="transition-colors hover:text-zinc-400"
              >
                Dashboard
              </Link>
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-600">
              <div className="flex items-center gap-1">
                <BadgeCheck className="h-3 w-3 text-emerald-500" />
                <span>POPIA Compliant</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-emerald-500" />
                <span>SA-Built</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-emerald-500" />
                <span>24/7 Automated</span>
              </div>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-700">
            <span>Powered by</span>
            <span className="font-medium text-zinc-500">VisioCorp AI</span>
            <span className="text-zinc-800">|</span>
            <span className="font-medium text-zinc-500">Tony Duardo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
