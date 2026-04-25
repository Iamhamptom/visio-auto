"use client";

import { useState } from "react";
import { Calculator, AlertCircle, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PopiaConsent } from "@/components/forms/PopiaConsent";

interface Result {
  net_income_monthly: number;
  expense_norm_used: number;
  discretionary_income: number;
  affordable_installment: number;
  affordable_vehicle_price: number;
  dti_ratio: number;
  recommendation: "approve_likely" | "borderline" | "decline_likely";
  reasons: string[];
  bureau: { provider: string; score: number; score_band: string } | null;
  bureau_attempted: boolean;
  assumptions: {
    interest_rate_pct: number;
    term_months: number;
    sources: string[];
  };
}

const RAND = (n: number) => `R${Math.round(n).toLocaleString("en-ZA")}`;

const RECO = {
  approve_likely: {
    label: "Likely to approve",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    icon: CheckCircle2,
  },
  borderline: {
    label: "Borderline — proceed carefully",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
    icon: AlertTriangle,
  },
  decline_likely: {
    label: "Likely to decline — pivot the buyer",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
    icon: AlertCircle,
  },
};

export default function AffordabilityPage() {
  const [form, setForm] = useState({
    gross_income_monthly: "",
    declared_expenses_monthly: "",
    declared_debts_monthly: "",
    deposit: "",
    interest_rate: "11",
    term_months: "72",
    id_number: "",
  });
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      setError("POPIA consent required.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload = {
        gross_income_monthly: Number(form.gross_income_monthly),
        declared_expenses_monthly: form.declared_expenses_monthly
          ? Number(form.declared_expenses_monthly)
          : undefined,
        declared_debts_monthly: form.declared_debts_monthly
          ? Number(form.declared_debts_monthly)
          : undefined,
        deposit: form.deposit ? Number(form.deposit) : undefined,
        interest_rate: Number(form.interest_rate),
        term_months: Number(form.term_months),
        id_number: form.id_number || undefined,
        consent: true,
      };
      const res = await fetch("/api/affordability/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? `Check failed (${res.status})`);
      }
      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check failed");
    } finally {
      setLoading(false);
    }
  }

  const reco = result ? RECO[result.recommendation] : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
          <Calculator className="h-5 w-5 text-emerald-400" /> Pre-decline checker
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          70% of SA vehicle finance applications are declined. Catch the wrong fit before the F&amp;I queue, and pivot the buyer to an affordable model on the spot.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <Card className="border-zinc-800/50 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-sm text-white">Buyer income + commitments</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label htmlFor="gross">Gross income / month *</Label>
                <Input
                  id="gross"
                  type="number"
                  required
                  value={form.gross_income_monthly}
                  onChange={(e) => setForm({ ...form, gross_income_monthly: e.target.value })}
                  placeholder="35000"
                  className="bg-zinc-950 border-zinc-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="expenses">Declared expenses / mo</Label>
                  <Input
                    id="expenses"
                    type="number"
                    value={form.declared_expenses_monthly}
                    onChange={(e) => setForm({ ...form, declared_expenses_monthly: e.target.value })}
                    placeholder="8000"
                    className="bg-zinc-950 border-zinc-800"
                  />
                </div>
                <div>
                  <Label htmlFor="debts">Existing debt / mo</Label>
                  <Input
                    id="debts"
                    type="number"
                    value={form.declared_debts_monthly}
                    onChange={(e) => setForm({ ...form, declared_debts_monthly: e.target.value })}
                    placeholder="2500"
                    className="bg-zinc-950 border-zinc-800"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="deposit">Deposit</Label>
                  <Input
                    id="deposit"
                    type="number"
                    value={form.deposit}
                    onChange={(e) => setForm({ ...form, deposit: e.target.value })}
                    placeholder="50000"
                    className="bg-zinc-950 border-zinc-800"
                  />
                </div>
                <div>
                  <Label htmlFor="rate">Rate %</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.25"
                    value={form.interest_rate}
                    onChange={(e) => setForm({ ...form, interest_rate: e.target.value })}
                    className="bg-zinc-950 border-zinc-800"
                  />
                </div>
                <div>
                  <Label htmlFor="term">Term (mo)</Label>
                  <Input
                    id="term"
                    type="number"
                    value={form.term_months}
                    onChange={(e) => setForm({ ...form, term_months: e.target.value })}
                    className="bg-zinc-950 border-zinc-800"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="id">SA ID (optional, for bureau check)</Label>
                <Input
                  id="id"
                  type="text"
                  pattern="\d{13}"
                  value={form.id_number}
                  onChange={(e) => setForm({ ...form, id_number: e.target.value })}
                  placeholder="13 digits"
                  className="bg-zinc-950 border-zinc-800 font-mono"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Without an ID we run a model-only check. With it we add a bureau lookup if a provider is configured.
                </p>
              </div>

              <PopiaConsent checked={consent} onChange={setConsent} />

              {error && <p className="text-xs text-red-400">{error}</p>}

              <Button
                type="submit"
                disabled={loading || !consent || !form.gross_income_monthly}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Running check…
                  </>
                ) : (
                  "Check affordability"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result */}
        {result && reco && (
          <Card className={`border ${reco.bg}`}>
            <CardHeader>
              <CardTitle className={`text-sm flex items-center gap-2 ${reco.color}`}>
                <reco.icon className="h-4 w-4" /> {reco.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Stat label="Affordable installment" value={RAND(result.affordable_installment)} highlight />
                <Stat label="Affordable price" value={RAND(result.affordable_vehicle_price)} highlight />
                <Stat label="Discretionary income" value={RAND(result.discretionary_income)} />
                <Stat label="DTI ratio" value={`${(result.dti_ratio * 100).toFixed(0)}%`} />
                <Stat label="Net income" value={RAND(result.net_income_monthly)} />
                <Stat label="NCA expense norm" value={RAND(result.expense_norm_used)} />
              </div>

              {result.bureau ? (
                <div className="border-t border-white/[0.06] pt-3">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Bureau</p>
                  <p className="text-sm text-white">
                    {result.bureau.provider} · score {result.bureau.score} ·{" "}
                    <span className="text-emerald-400">{result.bureau.score_band}</span>
                  </p>
                </div>
              ) : (
                <p className="text-xs text-zinc-500">
                  {result.bureau_attempted
                    ? "Bureau provider not configured — model-only result."
                    : "Bureau check skipped (no SA ID provided)."}
                </p>
              )}

              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Reasoning</p>
                <ul className="space-y-1 text-xs text-zinc-300">
                  {result.reasons.map((r, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-emerald-500/40 mt-0.5">→</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-[10px] text-zinc-600 font-mono leading-relaxed">
                Sources: {result.assumptions.sources.join(" · ")}. Term {result.assumptions.term_months}mo @ {result.assumptions.interest_rate_pct}%.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">{label}</p>
      <p className={`text-lg ${highlight ? "text-emerald-400 font-semibold" : "text-white"}`}>{value}</p>
    </div>
  );
}
