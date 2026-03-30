"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  DollarSign,
  Car,
  User,
  CreditCard,
  Clock,
  Star,
  Send,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// --- Mock lead detail data ---

const leadsMap: Record<
  string,
  {
    id: string;
    name: string;
    phone: string;
    email: string;
    whatsapp: string;
    area: string;
    city: string;
    province: string;
    budget_min: number;
    budget_max: number;
    preferred_brand: string;
    preferred_model: string;
    preferred_type: string;
    new_or_used: string;
    has_trade_in: boolean;
    trade_in_brand: string;
    trade_in_model: string;
    trade_in_year: number;
    timeline: string;
    finance_status: string;
    ai_score: number;
    score_tier: string;
    source: string;
    source_detail: string;
    language: string;
    status: string;
    created_at: string;
  }
> = {
  l1: {
    id: "l1",
    name: "Thabo Molefe",
    phone: "+27 82 345 6789",
    email: "thabo.molefe@discovery.co.za",
    whatsapp: "+27 82 345 6789",
    area: "Sandton",
    city: "Johannesburg",
    province: "Gauteng",
    budget_min: 500000,
    budget_max: 650000,
    preferred_brand: "BMW",
    preferred_model: "3 Series",
    preferred_type: "sedan",
    new_or_used: "new",
    has_trade_in: true,
    trade_in_brand: "VW",
    trade_in_model: "Polo",
    trade_in_year: 2022,
    timeline: "this_week",
    finance_status: "pre_approved",
    ai_score: 92,
    score_tier: "hot",
    source: "LinkedIn Signal",
    source_detail: "Promoted to Senior Manager at Discovery Health",
    language: "en",
    status: "qualified",
    created_at: "2026-03-29",
  },
  l4: {
    id: "l4",
    name: "Lerato Dlamini",
    phone: "+27 76 567 8901",
    email: "lerato@dlaminigroup.co.za",
    whatsapp: "+27 76 567 8901",
    area: "Sandton",
    city: "Johannesburg",
    province: "Gauteng",
    budget_min: 700000,
    budget_max: 920000,
    preferred_brand: "Mercedes",
    preferred_model: "GLC",
    preferred_type: "suv",
    new_or_used: "new",
    has_trade_in: false,
    trade_in_brand: "",
    trade_in_model: "",
    trade_in_year: 0,
    timeline: "this_week",
    finance_status: "cash",
    ai_score: 94,
    score_tier: "hot",
    source: "Referral",
    source_detail: "Referred by Johan at Sandton Motor Group",
    language: "en",
    status: "negotiating",
    created_at: "2026-03-27",
  },
};

// Default fallback lead for any ID not in the map
const defaultLead = leadsMap.l1;

const whatsappMessages = [
  {
    sender: "ai",
    message:
      "Hi Thabo! I'm the AI assistant at Sandton Motor Group. I noticed you might be looking for a new BMW. We have some excellent options in your budget range. Would you like to hear more?",
    time: "10:32",
  },
  {
    sender: "lead",
    message:
      "Hey, yes I'm looking at the new 3 Series. My budget is around R600K. Do you have any in stock?",
    time: "10:35",
  },
  {
    sender: "ai",
    message:
      "Great taste! We currently have 3 BMW 320i models available. I can see you have a VW Polo trade-in — we can offer competitive trade-in values. Would you like to book a test drive this week?",
    time: "10:36",
  },
  {
    sender: "lead",
    message: "Yes definitely, I'm free on Saturday morning. Is 10am ok?",
    time: "10:38",
  },
  {
    sender: "ai",
    message:
      "Saturday at 10am is perfect! I've booked you in with our sales consultant Mpho. He'll have the car ready for you. See you at our Sandton showroom. Is there anything else I can help with?",
    time: "10:39",
  },
  {
    sender: "lead",
    message:
      "No that's perfect, thanks! Looking forward to it.",
    time: "10:41",
  },
];

const matchedVehicles = [
  {
    id: "v1",
    brand: "BMW",
    model: "320i M Sport",
    year: 2026,
    color: "Mineral White",
    price: 615000,
    mileage: 0,
    condition: "new",
    vin: "WBA8E3C56NF123456",
    features: ["M Sport Package", "Sunroof", "Harman Kardon", "Adaptive Cruise"],
    match_score: 96,
  },
  {
    id: "v2",
    brand: "BMW",
    model: "320d",
    year: 2025,
    color: "Black Sapphire",
    price: 580000,
    mileage: 8500,
    condition: "demo",
    vin: "WBA8E3C56NF654321",
    features: ["Luxury Line", "Heated Seats", "Digital Cockpit", "Park Assist"],
    match_score: 89,
  },
  {
    id: "v3",
    brand: "BMW",
    model: "330i",
    year: 2025,
    color: "Portimao Blue",
    price: 650000,
    mileage: 12000,
    condition: "certified_preowned",
    vin: "WBA8E3C56NF789012",
    features: [
      "M Sport",
      "Head-Up Display",
      "360 Camera",
      "Wireless Charging",
    ],
    match_score: 84,
  },
];

function formatRand(amount: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function scoreBadge(tier: string, score: number) {
  const styles: Record<string, string> = {
    hot: "bg-red-500/10 text-red-400 ring-red-500/20",
    warm: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
    cold: "bg-blue-500/10 text-blue-400 ring-blue-500/20",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-semibold ring-1 ring-inset ${styles[tier] || styles.cold}`}
    >
      {score}
      <span className="text-xs uppercase">{tier}</span>
    </span>
  );
}

function statusLabel(status: string) {
  const labels: Record<string, { text: string; color: string }> = {
    new: { text: "New Lead", color: "bg-zinc-500/10 text-zinc-400" },
    contacted: { text: "Contacted", color: "bg-blue-500/10 text-blue-400" },
    qualified: { text: "Qualified", color: "bg-emerald-500/10 text-emerald-400" },
    test_drive_booked: { text: "Test Drive Booked", color: "bg-purple-500/10 text-purple-400" },
    negotiating: { text: "Negotiating", color: "bg-amber-500/10 text-amber-400" },
    sold: { text: "Sold", color: "bg-emerald-600/10 text-emerald-300" },
  };
  const l = labels[status] || labels.new;
  return (
    <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${l.color}`}>
      {l.text}
    </span>
  );
}

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [lead, setLead] = useState(leadsMap[id] || defaultLead);
  const [vehicles, setVehicles] = useState(matchedVehicles);
  const [loading, setLoading] = useState(true);
  const [waMessage, setWaMessage] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    // Fetch lead detail
    fetch(`/api/leads/${id}`)
      .then((r) => r.json())
      .then((json) => {
        const row = json.data ?? json.lead ?? json;
        if (row && row.id) {
          setLead((prev: typeof lead) => ({ ...prev, ...row }));
        }
      })
      .catch(() => {/* keep mock */});

    // Fetch matched vehicles
    fetch("/api/inventory/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_id: id }),
    })
      .then((r) => r.json())
      .then((json) => {
        const rows = json.data ?? json.vehicles ?? [];
        if (rows.length > 0) setVehicles(rows);
      })
      .catch(() => {/* keep mock */})
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="space-y-6">
      {/* Back + Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/leads">
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-zinc-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-white">{lead.name}</h1>
            <p className="text-sm text-zinc-500">
              Lead ID: {lead.id} &middot; Created {lead.created_at}
            </p>
          </div>
          <div className="ml-2">{scoreBadge(lead.score_tier, lead.ai_score)}</div>
          <div className="ml-1">{statusLabel(lead.status)}</div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            onClick={() => window.open(`tel:${lead.phone}`)}
          >
            <Phone className="h-3.5 w-3.5" />
            Contact
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            disabled={actionLoading === "test_drive"}
            onClick={async () => {
              setActionLoading("test_drive");
              try {
                await fetch(`/api/leads/${lead.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: "test_drive_booked", test_drive_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() }),
                });
                setLead((prev) => ({ ...prev, status: "test_drive_booked" }));
              } catch { /* keep current state */ }
              setActionLoading(null);
            }}
          >
            <Car className="h-3.5 w-3.5" />
            Book Test Drive
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            disabled={actionLoading === "assign"}
            onClick={async () => {
              setActionLoading("assign");
              try {
                const res = await fetch("/api/dealers");
                const data = await res.json();
                const dealer = data.dealers?.[0];
                if (dealer) {
                  await fetch(`/api/leads/${lead.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ assigned_dealer_id: dealer.id }),
                  });
                }
              } catch { /* keep current state */ }
              setActionLoading(null);
            }}
          >
            <User className="h-3.5 w-3.5" />
            Assign to Dealer
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-emerald-600 text-white hover:bg-emerald-500"
            disabled={actionLoading === "sold"}
            onClick={async () => {
              setActionLoading("sold");
              try {
                await fetch(`/api/leads/${lead.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: "sold", sold_at: new Date().toISOString() }),
                });
                setLead((prev) => ({ ...prev, status: "sold" }));
              } catch { /* keep current state */ }
              setActionLoading(null);
            }}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Mark as Sold
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Lead Info */}
        <Card className="border-zinc-800/50 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-white">Lead Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <InfoRow icon={User} label="Name" value={lead.name} />
              <InfoRow icon={Phone} label="Phone" value={lead.phone} mono />
              <InfoRow
                icon={MessageCircle}
                label="WhatsApp"
                value={lead.whatsapp}
                mono
              />
              <InfoRow
                icon={Send}
                label="Email"
                value={lead.email}
              />
              <InfoRow
                icon={MapPin}
                label="Location"
                value={`${lead.area}, ${lead.city}, ${lead.province}`}
              />

              <div className="border-t border-zinc-800/50 pt-4" />

              <InfoRow
                icon={DollarSign}
                label="Budget"
                value={`${formatRand(lead.budget_min)} - ${formatRand(lead.budget_max)}`}
                mono
              />
              <InfoRow icon={Car} label="Brand" value={lead.preferred_brand} />
              <InfoRow icon={Car} label="Model" value={lead.preferred_model} />
              <InfoRow
                icon={Car}
                label="Type"
                value={`${lead.preferred_type} (${lead.new_or_used})`}
              />
              <InfoRow
                icon={Calendar}
                label="Timeline"
                value={lead.timeline.replace(/_/g, " ")}
                highlight={lead.timeline === "this_week"}
              />
              <InfoRow
                icon={CreditCard}
                label="Finance"
                value={lead.finance_status.replace(/_/g, " ")}
                highlight={lead.finance_status === "pre_approved" || lead.finance_status === "cash"}
              />

              {lead.has_trade_in && (
                <>
                  <div className="border-t border-zinc-800/50 pt-4" />
                  <InfoRow
                    icon={Car}
                    label="Trade-In"
                    value={`${lead.trade_in_year} ${lead.trade_in_brand} ${lead.trade_in_model}`}
                  />
                </>
              )}

              <div className="border-t border-zinc-800/50 pt-4" />

              <InfoRow icon={AlertCircle} label="Source" value={lead.source} />
              <InfoRow
                icon={Star}
                label="Detail"
                value={lead.source_detail}
              />
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Conversation */}
        <Card className="border-zinc-800/50 bg-zinc-900/50">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <MessageCircle className="h-4 w-4 text-emerald-400" />
              WhatsApp Conversation
            </CardTitle>
            <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10">
              Live
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {whatsappMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === "lead" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-2.5 ${
                      msg.sender === "lead"
                        ? "bg-emerald-600/20 text-emerald-100"
                        : "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                    <p
                      className={`mt-1 text-right text-[10px] ${
                        msg.sender === "lead"
                          ? "text-emerald-400/60"
                          : "text-zinc-600"
                      }`}
                    >
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="mt-4 flex gap-2 border-t border-zinc-800/50 pt-4">
              <input
                type="text"
                placeholder="Type a message..."
                value={waMessage}
                onChange={(e) => setWaMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && waMessage.trim()) {
                    fetch("/api/whatsapp/send", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ phone: lead.phone, message: waMessage }),
                    }).catch(() => {});
                    setWaMessage("");
                  }
                }}
                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-emerald-500/50"
              />
              <Button
                size="sm"
                className="bg-emerald-600 text-white hover:bg-emerald-500"
                onClick={async () => {
                  if (!waMessage.trim()) return;
                  try {
                    await fetch("/api/whatsapp/send", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ phone: lead.phone, message: waMessage }),
                    });
                  } catch { /* silently fail */ }
                  setWaMessage("");
                }}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Matched Vehicles */}
      <Card className="border-zinc-800/50 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-white">
            Matched Vehicles ({vehicles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className="rounded-xl border border-zinc-800/50 bg-zinc-950/50 p-4"
              >
                {/* Vehicle header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-white">
                      {v.year} {v.brand} {v.model}
                    </p>
                    <p className="text-xs text-zinc-500">{v.color}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                    {v.match_score}% match
                  </span>
                </div>

                {/* Price & details */}
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Price</span>
                    <span className="font-mono text-sm font-semibold text-white">
                      {formatRand(v.price)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Mileage</span>
                    <span className="font-mono text-sm text-zinc-300">
                      {v.mileage.toLocaleString()} km
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Condition</span>
                    <span className="text-sm capitalize text-zinc-300">
                      {v.condition.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">VIN</span>
                    <span className="font-mono text-[11px] text-zinc-500">
                      {v.vin}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {v.features.map((f) => (
                    <span
                      key={f}
                      className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  mono,
  highlight,
}: {
  icon: typeof User;
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 shrink-0 text-zinc-600" />
      <span className="w-20 shrink-0 text-xs text-zinc-500">{label}</span>
      <span
        className={`text-sm ${
          highlight
            ? "font-medium text-emerald-400"
            : mono
              ? "font-mono text-zinc-300"
              : "text-zinc-300"
        } ${!mono && !highlight ? "capitalize" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
