"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EntitlementResponse {
  email: string;
  entitlement_count: number;
  has: Record<string, boolean>;
  tiers: Record<string, string | null>;
}

const PRODUCTS: { key: string; label: string; url: string }[] = [
  { key: "leads", label: "Visio Auto — Leads", url: "/dashboard/leads" },
  { key: "approve", label: "Visio Approve", url: "https://visio-approve.vercel.app" },
  { key: "inspect", label: "Visio Inspect", url: "https://visio-inspect.vercel.app" },
  { key: "bdc", label: "Visio BDC", url: "https://visio-bdc.vercel.app" },
  { key: "intent", label: "Visio Intent", url: "https://visio-intent.vercel.app" },
  { key: "open-finance", label: "Visio Open Finance", url: "https://visio-open-finance.vercel.app" },
  { key: "trust", label: "Visio Trust", url: "https://visio-trust.vercel.app" },
];

export function EntitlementsCard({ email }: { email?: string | null }) {
  const [resolvedEmail, setResolvedEmail] = useState<string | null>(email ?? null);
  const [data, setData] = useState<EntitlementResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email && typeof window !== "undefined") {
      const stored = localStorage.getItem("visio_auto_dealer_email");
      if (stored) setResolvedEmail(stored);
    }
  }, [email]);

  useEffect(() => {
    if (!resolvedEmail) return;
    setLoading(true);
    setError(null);
    fetch(`/api/commerce/entitlements/${encodeURIComponent(resolvedEmail)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`Lookup failed (${r.status})`);
        return r.json() as Promise<EntitlementResponse>;
      })
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [resolvedEmail]);

  if (!resolvedEmail) {
    return (
      <Card className="border-zinc-800/50 bg-zinc-900/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-white">Your plan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-zinc-500">
            Sign in with your dealership email to see active products and quotas.
          </p>
          <EmailPrompt onSet={(e) => {
            localStorage.setItem("visio_auto_dealer_email", e);
            setResolvedEmail(e);
          }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-zinc-800/50 bg-zinc-900/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-white flex items-center justify-between">
          <span>Your plan</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            {resolvedEmail}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center gap-2 text-xs text-zinc-500 py-4">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading entitlements…
          </div>
        )}
        {error && (
          <p className="text-xs text-red-400 py-4">Could not load — {error}.</p>
        )}
        {!loading && !error && data && (
          <>
            <div className="space-y-2">
              {PRODUCTS.map((p) => {
                const has = data.has[p.key];
                const tier = data.tiers[p.key];
                return (
                  <div key={p.key} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                    <div className="flex items-center gap-2">
                      {has ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-zinc-600" />
                      )}
                      <span className={`text-xs ${has ? "text-zinc-200" : "text-zinc-500"}`}>
                        {p.label}
                      </span>
                      {tier && (
                        <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400/60">
                          {tier}
                        </span>
                      )}
                    </div>
                    {has && (
                      <Link
                        href={p.url}
                        className="text-xs text-emerald-400/70 hover:text-emerald-400 inline-flex items-center gap-1"
                      >
                        Open <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
            {data.entitlement_count === 0 && (
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <p className="text-xs text-zinc-500 mb-2">No active products yet.</p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300"
                >
                  See plans <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function EmailPrompt({ onSet }: { onSet: (email: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.includes("@")) onSet(value.trim().toLowerCase());
      }}
      className="mt-4 flex gap-2"
    >
      <input
        type="email"
        placeholder="dealer@example.co.za"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 h-8 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-emerald-500/50"
      />
      <button
        type="submit"
        className="h-8 px-3 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
      >
        Check
      </button>
    </form>
  );
}
