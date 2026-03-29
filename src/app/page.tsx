"use client";

import Link from "next/link";
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

const stats = [
  { label: "Dealerships", value: "329+", icon: Car },
  { label: "Signals Tracked", value: "15", icon: Zap },
  { label: "Languages", value: "6", icon: Globe },
  { label: "Response Time", value: "30s", icon: Clock },
];

const steps = [
  {
    step: "01",
    title: "Signal Detection",
    description:
      "Our AI monitors 15 life-event signals across social media, CIPC, property registrations, and job portals to detect imminent car buyers.",
    icon: Zap,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    step: "02",
    title: "AI Qualification",
    description:
      "Each prospect is scored 0-100 using budget estimation, timeline analysis, brand affinity, and finance readiness. Only qualified leads pass through.",
    icon: Brain,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    step: "03",
    title: "VIN Matching",
    description:
      "Leads are matched to specific vehicles in your inventory by brand, model, budget, and preferences. The right car for the right buyer.",
    icon: Car,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    step: "04",
    title: "WhatsApp Delivery",
    description:
      "Qualified leads are delivered to your sales team on WhatsApp within 60 seconds, with full context, matched vehicles, and suggested responses.",
    icon: MessageCircle,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
];

const tiers = [
  {
    name: "Starter",
    price: "R5,000",
    period: "/month",
    leads: "25 leads/month",
    description: "For independent dealers getting started with AI leads.",
    features: [
      "25 AI-qualified leads",
      "WhatsApp delivery",
      "Lead scoring",
      "Basic dashboard",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Growth",
    price: "R15,000",
    period: "/month",
    leads: "100 leads/month",
    description: "The sweet spot. Most dealerships choose this.",
    features: [
      "100 AI-qualified leads",
      "WhatsApp + CRM integration",
      "15 signal types tracked",
      "VIN matching",
      "Inventory sync",
      "Analytics dashboard",
      "Priority support",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Pro",
    price: "R50,000",
    period: "/month",
    leads: "500 leads/month",
    description: "For dealer groups scaling across regions.",
    features: [
      "500 AI-qualified leads",
      "Multi-branch support",
      "Social radar monitoring",
      "Market intelligence",
      "Custom AI scoring",
      "API access",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    popular: false,
  },
  {
    name: "Enterprise",
    price: "R150,000+",
    period: "/month",
    leads: "Unlimited leads",
    description: "For OEMs and national dealer networks.",
    features: [
      "Unlimited leads",
      "White-label platform",
      "National coverage",
      "Custom signal development",
      "Fleet & corporate leads",
      "SLA guarantee",
      "On-site training",
      "24/7 support",
    ],
    cta: "Talk to Us",
    popular: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
              <Car className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">Visio Auto</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#how-it-works" className="text-sm text-zinc-400 hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Pricing
            </a>
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                Dashboard
              </Button>
            </Link>
            <Link href="/get-quote">
              <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-500">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20">
        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-emerald-500/5 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <Badge className="mb-6 border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10">
            <Zap className="mr-1 h-3 w-3" />
            Now tracking 15 buying signals across South Africa
          </Badge>

          <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-[1.1] tracking-tight text-white md:text-7xl">
            AI-Powered Leads for{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              SA Car Dealerships
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 md:text-xl">
            We deliver AI-qualified car buyers to your WhatsApp in under 60
            seconds.{" "}
            <span className="text-white font-medium">
              R15,000/month. 100 leads. 4x ROI guaranteed.
            </span>
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/get-quote">
              <Button size="lg" className="h-12 gap-2 bg-emerald-600 px-8 text-base text-white hover:bg-emerald-500">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="h-12 border-zinc-700 px-8 text-base text-zinc-300 hover:bg-zinc-800 hover:text-white">
              Watch Demo
            </Button>
          </div>

          {/* Stats bar */}
          <div className="mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1 rounded-xl border border-zinc-800/50 bg-zinc-900/50 px-4 py-5 backdrop-blur-sm"
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

      {/* How It Works */}
      <section id="how-it-works" className="border-t border-zinc-800/50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <Badge className="mb-4 border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-800">
              How It Works
            </Badge>
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              From signal to sale in 4 steps
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-zinc-400">
              Our AI pipeline detects life events that predict car purchases,
              qualifies the buyer, matches them to your inventory, and delivers
              the lead instantly.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <Card
                key={step.step}
                className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm"
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${step.bg}`}
                    >
                      <step.icon className={`h-5 w-5 ${step.color}`} />
                    </div>
                    <span className="font-mono text-xs text-zinc-600">
                      {step.step}
                    </span>
                  </div>
                  <CardTitle className="mt-2 text-white">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-zinc-400">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-t border-zinc-800/50 bg-zinc-900/30 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                quote:
                  "We closed 12 deals in our first month. The AI scoring is incredibly accurate.",
                name: "Johan van der Merwe",
                role: "DP, Sandton Motor Group",
                stars: 5,
              },
              {
                quote:
                  "Leads arrive on WhatsApp before we even finish our morning coffee. Game changer.",
                name: "Priya Naidoo",
                role: "Sales Manager, AutoBay Menlyn",
                stars: 5,
              },
              {
                quote:
                  "4.2x ROI in 90 days. We've tripled our sales team's conversion rate.",
                name: "Thabo Mokoena",
                role: "CEO, Mzansi Motors",
                stars: 5,
              },
            ].map((t) => (
              <Card
                key={t.name}
                className="border-zinc-800/50 bg-zinc-900/50"
              >
                <CardContent className="pt-2">
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
        </div>
      </section>

      {/* Pricing */}
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
              No setup fees. No lock-in contracts. Cancel anytime. Every plan
              includes our 4x ROI guarantee.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {tiers.map((tier) => (
              <Card
                key={tier.name}
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
                <CardHeader>
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
                    <span className="text-sm text-zinc-500">{tier.period}</span>
                  </div>
                  <p className="mb-6 text-xs text-emerald-400">{tier.leads}</p>
                  <ul className="space-y-2.5">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <span className="text-zinc-300">{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`w-full ${
                      tier.popular
                        ? "bg-emerald-600 text-white hover:bg-emerald-500"
                        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    }`}
                  >
                    {tier.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-800/50 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="rounded-2xl border border-zinc-800/50 bg-gradient-to-b from-zinc-900 to-zinc-950 p-12">
            <Shield className="mx-auto mb-4 h-10 w-10 text-emerald-400" />
            <h2 className="text-3xl font-bold text-white">
              Ready to fill your showroom?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-zinc-400">
              Join 329+ South African dealerships using AI to find their next
              buyer. Start your free trial today — no credit card required.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/get-quote">
                <Button size="lg" className="h-12 gap-2 bg-emerald-600 px-8 text-base text-white hover:bg-emerald-500">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500">
                <Car className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium text-zinc-400">
                Visio Auto
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <span>Powered by</span>
              <span className="font-medium text-zinc-400">VisioCorp AI</span>
              <span className="text-zinc-700">+</span>
              <span className="font-medium text-zinc-400">Tony Duardo</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-zinc-600">
              <BarChart3 className="h-3 w-3" />
              <span>South Africa&apos;s #1 AI Auto Lead Platform</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
