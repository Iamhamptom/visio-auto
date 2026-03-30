"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Car,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Sparkles,
  Crown,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---------------------------------------------------------------------------
// Tier definitions
// ---------------------------------------------------------------------------
const tiers = [
  {
    slug: "free",
    name: "Free Trial",
    price: "R0",
    period: "",
    leads: "5 leads",
    description: "See Visio Auto in action. No credit card needed.",
    highlight: false,
  },
  {
    slug: "starter",
    name: "Starter",
    price: "R5,000",
    period: "/mo",
    leads: "25 leads/month",
    description: "For independent dealers getting started with AI leads.",
    highlight: false,
  },
  {
    slug: "growth",
    name: "Growth",
    price: "R15,000",
    period: "/mo",
    leads: "100 leads/month",
    description: "Most popular. Speed, volume, and intelligence.",
    highlight: true,
  },
  {
    slug: "pro",
    name: "Pro",
    price: "R50,000",
    period: "/mo",
    leads: "500 leads/month",
    description: "Multi-branch, API access, Market Terminal.",
    highlight: false,
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    price: "R150,000+",
    period: "/mo",
    leads: "Unlimited",
    description: "White-label, national coverage, custom AI.",
    highlight: false,
  },
];

const brandOptions = [
  "Toyota",
  "Volkswagen",
  "Hyundai",
  "Ford",
  "Suzuki",
  "Kia",
  "Nissan",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Land Rover",
  "Porsche",
  "Volvo",
  "Jeep",
  "Mazda",
  "Isuzu",
  "Haval",
  "Chery",
  "Used / Multi-Brand",
  "Other",
];

const areaOptions = [
  "Sandton",
  "Johannesburg CBD",
  "Pretoria / Centurion",
  "Midrand",
  "Roodepoort / West Rand",
  "East Rand / Boksburg",
  "Durban / Umhlanga",
  "Cape Town / Southern Suburbs",
  "Cape Town / Northern Suburbs",
  "Stellenbosch / Winelands",
  "Bloemfontein",
  "Port Elizabeth / Gqeberha",
  "Polokwane",
  "Nelspruit / Mbombela",
  "Other",
];

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------
function GetStartedContent() {
  const searchParams = useSearchParams();
  const preselectedTier = searchParams.get("tier") || "";
  const paymentStatus = searchParams.get("payment");
  const paymentDealerId = searchParams.get("dealer");

  const [step, setStep] = useState(paymentStatus === "success" ? 4 : 1);
  const [selectedTier, setSelectedTier] = useState(preselectedTier || "growth");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [form, setForm] = useState({
    dealership_name: "",
    principal_name: "",
    email: "",
    phone: "",
    brands_sold: "",
    area: "",
  });

  const [dealerId, setDealerId] = useState(paymentDealerId || "");

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Step 2 -> Create dealer + go to step 3 (or step 4 for free)
  async function handleSubmitDetails() {
    setError("");

    if (
      !form.dealership_name ||
      !form.principal_name ||
      !form.email ||
      !form.phone
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/dealers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.dealership_name,
          principal_name: form.principal_name,
          email: form.email,
          phone: form.phone,
          brands_sold: form.brands_sold,
          area: form.area,
          tier: selectedTier,
          status: selectedTier === "free" ? "active" : "pending_payment",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as Record<string, string>).error || "Failed to create dealer"
        );
      }

      const data = (await res.json()) as { id?: string; dealer?: { id: string } };
      const newDealerId = data.id || data.dealer?.id || "";
      setDealerId(newDealerId);

      if (selectedTier === "free") {
        // Skip payment for free tier
        setStep(4);
      } else {
        setStep(3);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Step 3 -> Initiate Yoco payment
  async function handlePayment() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/payments/yoco", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealer_id: dealerId,
          tier: selectedTier,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as Record<string, string>).error || "Payment initiation failed"
        );
      }

      const data = (await res.json()) as { redirectUrl: string };
      // Redirect to Yoco checkout
      window.location.href = data.redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Nav */}
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
          <Link href="/why-visio-auto">
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Why Visio Auto
            </Button>
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 pt-28 pb-20">
        {/* Progress Steps */}
        <div className="mb-12 flex items-center justify-center gap-2">
          {[
            { n: 1, label: "Select Plan" },
            { n: 2, label: "Your Details" },
            { n: 3, label: "Payment" },
            { n: 4, label: "Welcome" },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  step >= s.n
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {step > s.n ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  s.n
                )}
              </div>
              <span
                className={`hidden text-xs sm:block ${
                  step >= s.n ? "text-zinc-300" : "text-zinc-600"
                }`}
              >
                {s.label}
              </span>
              {i < 3 && (
                <div
                  className={`h-px w-8 sm:w-12 ${
                    step > s.n ? "bg-emerald-500" : "bg-zinc-800"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* ---- STEP 1: Select Tier ---- */}
        {step === 1 && (
          <div>
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-white">
                Choose your plan
              </h1>
              <p className="mt-2 text-zinc-400">
                Start free or pick the plan that matches your dealership size.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tiers.filter((t) => t.slug !== "enterprise").map((tier) => (
                <Card
                  key={tier.slug}
                  onClick={() => setSelectedTier(tier.slug)}
                  className={`cursor-pointer border-zinc-800/50 bg-zinc-900/50 transition-all ${
                    selectedTier === tier.slug
                      ? "ring-2 ring-emerald-500 shadow-[0_0_30px_-10px_rgba(16,185,129,0.3)]"
                      : "hover:border-zinc-700"
                  }`}
                >
                  {tier.highlight && (
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
                  <CardContent>
                    <div className="mb-1">
                      <span className="font-mono text-2xl font-bold text-white">
                        {tier.price}
                      </span>
                      {tier.period && (
                        <span className="text-sm text-zinc-500">
                          {tier.period}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-emerald-400">{tier.leads}</p>
                    {selectedTier === tier.slug && (
                      <div className="mt-3 flex items-center gap-1 text-xs text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Selected
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 text-center text-sm text-zinc-500">
              Need Enterprise (unlimited leads, white-label)?{" "}
              <Link
                href="/get-quote"
                className="text-emerald-400 hover:underline"
              >
                Talk to our sales team
              </Link>
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                onClick={() => setStep(2)}
                size="lg"
                className="h-12 gap-2 bg-emerald-600 px-10 text-white hover:bg-emerald-500"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ---- STEP 2: Dealership Details ---- */}
        {step === 2 && (
          <div>
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-white">
                Tell us about your dealership
              </h1>
              <p className="mt-2 text-zinc-400">
                We use this to match the right leads to your inventory and area.
              </p>
            </div>

            <Card className="mx-auto max-w-lg border-zinc-800/50 bg-zinc-900/50">
              <CardContent className="pt-6">
                <div className="space-y-5">
                  <div>
                    <Label className="text-zinc-300">
                      <Building2 className="mr-1.5 inline h-3.5 w-3.5" />
                      Dealership Name *
                    </Label>
                    <Input
                      className="mt-1.5 border-zinc-800 bg-zinc-950 text-white"
                      placeholder="e.g. Sandton Motor Group"
                      value={form.dealership_name}
                      onChange={(e) =>
                        updateForm("dealership_name", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label className="text-zinc-300">
                      <User className="mr-1.5 inline h-3.5 w-3.5" />
                      Principal / Owner Name *
                    </Label>
                    <Input
                      className="mt-1.5 border-zinc-800 bg-zinc-950 text-white"
                      placeholder="e.g. Johan van der Merwe"
                      value={form.principal_name}
                      onChange={(e) =>
                        updateForm("principal_name", e.target.value)
                      }
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-zinc-300">
                        <Mail className="mr-1.5 inline h-3.5 w-3.5" />
                        Email *
                      </Label>
                      <Input
                        type="email"
                        className="mt-1.5 border-zinc-800 bg-zinc-950 text-white"
                        placeholder="johan@dealership.co.za"
                        value={form.email}
                        onChange={(e) => updateForm("email", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-300">
                        <Phone className="mr-1.5 inline h-3.5 w-3.5" />
                        Phone *
                      </Label>
                      <Input
                        type="tel"
                        className="mt-1.5 border-zinc-800 bg-zinc-950 text-white"
                        placeholder="082 123 4567"
                        value={form.phone}
                        onChange={(e) => updateForm("phone", e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-zinc-300">
                      <Car className="mr-1.5 inline h-3.5 w-3.5" />
                      Brands Sold
                    </Label>
                    <Select
                      value={form.brands_sold}
                      onValueChange={(v) => updateForm("brands_sold", v ?? "")}
                    >
                      <SelectTrigger className="mt-1.5 border-zinc-800 bg-zinc-950 text-white">
                        <SelectValue placeholder="Select primary brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brandOptions.map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-zinc-300">
                      <MapPin className="mr-1.5 inline h-3.5 w-3.5" />
                      Area / Region
                    </Label>
                    <Select
                      value={form.area}
                      onValueChange={(v) => updateForm("area", v ?? "")}
                    >
                      <SelectTrigger className="mt-1.5 border-zinc-800 bg-zinc-950 text-white">
                        <SelectValue placeholder="Select your area" />
                      </SelectTrigger>
                      <SelectContent>
                        {areaOptions.map((a) => (
                          <SelectItem key={a} value={a}>
                            {a}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {error && (
                    <p className="text-sm text-red-400">{error}</p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                      onClick={() => setStep(1)}
                    >
                      <ArrowLeft className="mr-1 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      className="flex-1 bg-emerald-600 text-white hover:bg-emerald-500"
                      onClick={handleSubmitDetails}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {selectedTier === "free"
                        ? "Create Free Account"
                        : "Continue to Payment"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ---- STEP 3: Payment ---- */}
        {step === 3 && (
          <div>
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-white">
                Complete your payment
              </h1>
              <p className="mt-2 text-zinc-400">
                Secure payment via Yoco. You&apos;ll be redirected to complete
                checkout.
              </p>
            </div>

            <Card className="mx-auto max-w-md border-zinc-800/50 bg-zinc-900/50">
              <CardContent className="pt-6">
                <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {tiers.find((t) => t.slug === selectedTier)?.name} Plan
                      </p>
                      <p className="text-xs text-zinc-500">
                        {tiers.find((t) => t.slug === selectedTier)?.leads}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xl font-bold text-white">
                        {tiers.find((t) => t.slug === selectedTier)?.price}
                      </p>
                      <p className="text-xs text-zinc-500">per month</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6 space-y-2 text-xs text-zinc-400">
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Cancel anytime — no lock-in contracts
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    4x ROI guarantee or your money back
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Secure payment via Yoco (SA payment gateway)
                  </p>
                </div>

                {error && (
                  <p className="mb-4 text-sm text-red-400">{error}</p>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    onClick={() => setStep(2)}
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    className="flex-1 bg-emerald-600 text-white hover:bg-emerald-500"
                    onClick={handlePayment}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="mr-2 h-4 w-4" />
                    )}
                    Pay with Yoco
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ---- STEP 4: Welcome / Success ---- */}
        {step === 4 && (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
              <Sparkles className="h-10 w-10 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              Welcome to Visio Auto!
            </h1>
            <p className="mx-auto mt-4 max-w-md text-zinc-400">
              Your dealership is set up and{" "}
              {selectedTier === "free"
                ? "your free trial is active"
                : "your subscription is being activated"}
              . You&apos;ll receive a WhatsApp confirmation within the next few
              minutes.
            </p>

            <Card className="mx-auto mt-8 max-w-md border-emerald-500/20 bg-emerald-500/5">
              <CardContent className="pt-6">
                <h3 className="mb-4 font-semibold text-white">
                  What happens next:
                </h3>
                <ul className="space-y-3 text-left text-sm text-zinc-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    Our AI starts scanning signals in your area immediately
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    You&apos;ll receive your first leads within 24 hours
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    WhatsApp setup instructions sent to{" "}
                    {form.phone || "your phone"}
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    Dashboard access is ready now
                  </li>
                </ul>
              </CardContent>
            </Card>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              {dealerId && (
                <Link href={`/client/${dealerId}`}>
                  <Button
                    size="lg"
                    className="h-12 gap-2 bg-emerald-600 px-8 text-white hover:bg-emerald-500"
                  >
                    <Crown className="h-4 w-4" />
                    Open Your Dashboard
                  </Button>
                </Link>
              )}
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 border-zinc-700 px-8 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GetStartedPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">Loading...</div>}>
      <GetStartedContent />
    </Suspense>
  );
}
