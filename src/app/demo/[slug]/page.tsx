"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car, Search, Lock, Zap, CheckCircle2, ArrowRight,
  MapPin, TrendingUp, Shield, Loader2, Crown, Sparkles,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────
interface CarItem {
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage?: number;
  condition: string;
  image?: string;
}

interface FakeLead {
  name: string;
  area: string;
  signal: string;
  score: number;
  tier: "hot" | "warm";
}

interface DemoData {
  dealer_name: string;
  dealer_slug: string;
  contact_name: string;
  area: string;
  cars: CarItem[];
  signals_count: number;
  leads: FakeLead[];
}

type Screen = "cars" | "scanning" | "leads" | "pricing" | "confirmed";

const PACKAGES = [
  { id: "starter", name: "Starter", price: 5000, leads: 25, perLead: 200, popular: false },
  { id: "growth", name: "Growth", price: 10000, leads: 75, perLead: 133, popular: true },
  { id: "pro", name: "Pro", price: 20000, leads: 200, perLead: 100, popular: false },
];

// ─── Fake signal messages for animation ─────────────────
const SIGNAL_MESSAGES = [
  { icon: "📊", text: "Lease expiring in 14 days", area: "Sandton" },
  { icon: "💼", text: "Just promoted to Senior Director", area: "Midrand" },
  { icon: "🏠", text: "Relocated from Cape Town", area: "Centurion" },
  { icon: "📱", text: "Posted 'looking for new car' on Facebook", area: "Fourways" },
  { icon: "💰", text: "Insurance payout processed", area: "Randburg" },
  { icon: "🎓", text: "Recently graduated MBA", area: "Bryanston" },
  { icon: "👶", text: "Growing family — needs bigger vehicle", area: "Roodepoort" },
  { icon: "🔔", text: "Searched '2025 SUV prices' this week", area: "Bedfordview" },
];

// ─── Component ──────────────────────────────────────────
export default function DemoFunnelPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState("");
  const [data, setData] = useState<DemoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<Screen>("cars");
  const [scanCount, setScanCount] = useState(0);
  const [visibleSignals, setVisibleSignals] = useState(0);
  const [selectedPkg, setSelectedPkg] = useState("growth");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { params.then((p) => setSlug(p.slug)); }, [params]);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/demo/${slug}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  // Scanning animation
  useEffect(() => {
    if (screen !== "scanning") return;
    const signalInterval = setInterval(() => {
      setVisibleSignals((v) => {
        if (v >= SIGNAL_MESSAGES.length) { clearInterval(signalInterval); return v; }
        return v + 1;
      });
    }, 600);
    const countInterval = setInterval(() => {
      setScanCount((c) => {
        if (c >= (data?.signals_count ?? 47)) { clearInterval(countInterval); return c; }
        return c + Math.floor(Math.random() * 4) + 1;
      });
    }, 200);
    const autoAdvance = setTimeout(() => setScreen("leads"), 6000);
    return () => { clearInterval(signalInterval); clearInterval(countInterval); clearTimeout(autoAdvance); };
  }, [screen, data]);

  async function handleOrder() {
    if (!data) return;
    setSubmitting(true);
    const pkg = PACKAGES.find((p) => p.id === selectedPkg)!;
    try {
      const res = await fetch(`/api/demo/${slug}/enrich`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package: pkg.id,
          amount: pkg.price * 100, // cents for Yoco
          leads_count: pkg.leads,
          cars: data.cars.slice(0, 3),
        }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.redirectUrl) {
          window.location.href = result.redirectUrl;
          return;
        }
        setScreen("confirmed");
      }
    } catch { /* fall through */ }
    setSubmitting(false);
  }

  // ─── Loading ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">Loading your demo...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.cars?.length) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Car className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Demo not found</h1>
          <p className="text-sm text-zinc-500 mb-6">We couldn&apos;t find inventory for this dealership yet. Contact us to get set up.</p>
          <a href="https://wa.me/27662346203?text=Hi%20Tony%2C%20I%20want%20to%20see%20the%20AI%20leads%20demo" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500">
            WhatsApp Us
          </a>
        </div>
      </div>
    );
  }

  const firstName = data.contact_name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Nav */}
      <nav className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500">
              <Car className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold">Visio Auto</span>
          </div>
          <span className="text-xs text-zinc-500">AI-Powered Lead Intelligence</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">

          {/* ═══ SCREEN 1: Your Cars ═══ */}
          {screen === "cars" && (
            <motion.div key="cars" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-10">
                <p className="text-xs text-emerald-400 uppercase tracking-widest mb-3">Personalized for {data.dealer_name}</p>
                <h1 className="text-3xl font-bold mb-3">
                  We found these on your lot, {firstName}.
                </h1>
                <p className="text-zinc-400 text-sm">Let our AI find the buyers.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
                {data.cars.slice(0, 6).map((car, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Car className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-zinc-500 uppercase tracking-wider">{car.condition}</span>
                    </div>
                    <h3 className="font-semibold text-white mb-1">
                      {car.year} {car.brand} {car.model}
                    </h3>
                    <p className="text-lg font-mono font-bold text-emerald-400">
                      R{car.price.toLocaleString()}
                    </p>
                    {car.mileage && (
                      <p className="text-xs text-zinc-500 mt-1">{car.mileage.toLocaleString()} km</p>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="text-center">
                <button
                  onClick={() => { setScreen("scanning"); setScanCount(0); setVisibleSignals(0); }}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-colors text-sm"
                >
                  <Search className="w-4 h-4" />
                  See who&apos;s looking for these →
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══ SCREEN 2: AI Scanning ═══ */}
          {screen === "scanning" && (
            <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold mb-2">Scanning {data.area || "your area"}...</h2>
                <p className="text-zinc-400 text-sm">Our AI is detecting buyer signals in real-time</p>
              </div>

              {/* Pulse animation */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center animate-pulse">
                      <Zap className="w-8 h-8 text-emerald-400" />
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-ping" />
                </div>
              </div>

              {/* Counter */}
              <div className="text-center mb-8">
                <span className="text-5xl font-mono font-bold text-emerald-400">{Math.min(scanCount, data.signals_count)}</span>
                <p className="text-sm text-zinc-500 mt-1">potential buyers detected</p>
              </div>

              {/* Signal feed */}
              <div className="max-w-md mx-auto space-y-2">
                {SIGNAL_MESSAGES.slice(0, visibleSignals).map((sig, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800/50"
                  >
                    <span className="text-lg">{sig.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white truncate">{sig.text}</p>
                      <p className="text-[10px] text-zinc-500">{sig.area}</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ═══ SCREEN 3: Blurred Leads ═══ */}
          {screen === "leads" && (
            <motion.div key="leads" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">
                  {data.signals_count} buyers found for {data.dealer_name}
                </h2>
                <p className="text-zinc-400 text-sm">Unlock full contact details to start closing deals</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 mb-8">
                {data.leads.map((lead, i) => (
                  <div key={i} className="relative rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 overflow-hidden">
                    {/* Blur overlay */}
                    <div className="absolute inset-0 backdrop-blur-sm bg-zinc-950/40 z-10 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-zinc-500" />
                    </div>
                    {/* Content (partially visible through blur) */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-white text-sm">{lead.name}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-zinc-500" />
                          <span className="text-xs text-zinc-400">{lead.area}</span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-2">{lead.signal}</p>
                      </div>
                      <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        lead.tier === "hot" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
                      }`}>
                        {lead.tier === "hot" ? "HOT" : "WARM"} {lead.score}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <button
                  onClick={() => setScreen("pricing")}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-colors text-sm"
                >
                  <Zap className="w-4 h-4" />
                  ENRICH — Unlock Full Leads
                </button>
                <p className="text-[11px] text-zinc-600 mt-3">Full name, phone, email, budget, timeline — delivered in 48hrs</p>
              </div>
            </motion.div>
          )}

          {/* ═══ SCREEN 4: Pricing ═══ */}
          {screen === "pricing" && (
            <motion.div key="pricing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Choose your lead package</h2>
                <p className="text-zinc-400 text-sm">
                  For {data.cars[0]?.brand} buyers in {data.area || "your area"}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 mb-8">
                {PACKAGES.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPkg(pkg.id)}
                    className={`relative rounded-xl border p-6 text-left transition-all ${
                      selectedPkg === pkg.id
                        ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/50"
                        : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                        <span className="px-3 py-0.5 rounded-full bg-emerald-600 text-[10px] font-bold text-white uppercase tracking-wider">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <h3 className="font-semibold text-white mb-1">{pkg.name}</h3>
                    <div className="mb-3">
                      <span className="text-2xl font-mono font-bold text-white">R{pkg.price.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-emerald-400 mb-3">{pkg.leads} enriched leads</p>
                    <p className="text-[11px] text-zinc-500">R{pkg.perLead}/lead</p>
                    {selectedPkg === pkg.id && (
                      <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-emerald-500" />
                    )}
                  </button>
                ))}
              </div>

              <div className="max-w-md mx-auto space-y-2 mb-8">
                {[
                  "Full name, phone, email, WhatsApp for every lead",
                  "AI-scored with budget, timeline, and brand preference",
                  "Delivered via WhatsApp + email within 48 hours",
                  "Matched specifically to YOUR inventory",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-zinc-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="text-center">
                <button
                  onClick={handleOrder}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-10 py-3.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-colors text-sm disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4" />
                  )}
                  {submitting ? "Processing..." : `Get ${PACKAGES.find(p => p.id === selectedPkg)!.leads} Leads — R${PACKAGES.find(p => p.id === selectedPkg)!.price.toLocaleString()}`}
                </button>
                <p className="text-[11px] text-zinc-600 mt-3">Secure payment via Yoco</p>
              </div>
            </motion.div>
          )}

          {/* ═══ SCREEN 5: Confirmed ═══ */}
          {screen === "confirmed" && (
            <motion.div key="confirmed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="text-center py-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6"
                >
                  <Sparkles className="w-10 h-10 text-emerald-400" />
                </motion.div>

                <h2 className="text-2xl font-bold mb-2">DEEP RESEARCH MODE — ON</h2>
                <p className="text-zinc-400 text-sm max-w-md mx-auto mb-10">
                  Our AI is now finding real buyers for your exact vehicles. You&apos;ll receive your leads via WhatsApp + email within 48 hours.
                </p>

                {/* Cars being researched */}
                <div className="grid gap-3 sm:grid-cols-3 max-w-lg mx-auto mb-10">
                  {data.cars.slice(0, 3).map((car, i) => (
                    <div key={i} className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
                      <p className="text-xs font-semibold text-white">{car.year} {car.brand} {car.model}</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                        <span className="text-[10px] text-emerald-400">Enriching buyers...</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 max-w-sm mx-auto text-left">
                  {[
                    "Order confirmed — your leads are being sourced",
                    "AI matching buyers to your specific inventory",
                    "WhatsApp delivery within 48 hours",
                    "Full support — reply to your confirmation email anytime",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-zinc-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-10">
                  <a
                    href="https://wa.me/27662346203?text=Hi%20Tony%2C%20I%20just%20placed%20a%20lead%20order%20for%20my%20dealership"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#25D366] text-white text-sm font-semibold hover:opacity-90"
                  >
                    <Crown className="w-4 h-4" />
                    WhatsApp Tony for priority delivery
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
