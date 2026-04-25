"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Loader2 } from "lucide-react";

interface Service {
  name: string;
  url: string;
  status: "ok" | "degraded" | "down" | "skip";
  latency_ms: number | null;
  detail?: string;
}

interface StatusResponse {
  overall_status: "ok" | "degraded" | "down";
  products: Service[];
  external: { supabase: Service; yoco: Service; resend: Service };
  checked_at: string;
  total_duration_ms: number;
}

export default function StatusPage() {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/status", { cache: "no-store" });
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Status fetch failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020c07] text-white/80">
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-4xl px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white/80"
          >
            <ArrowLeft className="h-3 w-3" /> Visio Auto
          </Link>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white/80"
          >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            Refresh
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400/60 mb-3">System status</p>
          <h1 className="text-4xl font-extralight tracking-tight text-white">
            {!data && !error && <Loader2 className="h-5 w-5 animate-spin inline mr-2 text-white/40" />}
            {data?.overall_status === "ok" && (
              <span className="text-emerald-400">All systems operational</span>
            )}
            {data?.overall_status === "degraded" && (
              <span className="text-amber-400">Some systems degraded</span>
            )}
            {data?.overall_status === "down" && (
              <span className="text-red-400">Major outage</span>
            )}
          </h1>
          {data && (
            <p className="mt-2 text-xs text-white/40 font-mono">
              Updated {new Date(data.checked_at).toLocaleTimeString("en-ZA")} · checked in {data.total_duration_ms}ms
            </p>
          )}
        </div>

        {error && <p className="text-sm text-red-400 mb-6">Status fetch failed: {error}</p>}

        {data && (
          <>
            <Section title="Products">
              {data.products.map((s) => (
                <ServiceRow key={s.name} service={s} />
              ))}
            </Section>

            <Section title="External dependencies" className="mt-12">
              <ServiceRow service={data.external.supabase} />
              <ServiceRow service={data.external.yoco} />
              <ServiceRow service={data.external.resend} />
            </Section>
          </>
        )}

        <p className="mt-16 text-xs text-white/30">
          Auto-refreshes every 60s. Issues? Email{" "}
          <a href="mailto:david@visiocorp.co" className="text-emerald-400 hover:text-emerald-300">
            david@visiocorp.co
          </a>{" "}
          — a human responds within an hour during business days.
        </p>
      </main>
    </div>
  );
}

function Section({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-3">{title}</h2>
      <div className="border border-white/[0.06] bg-white/[0.02] divide-y divide-white/[0.04]">{children}</div>
    </div>
  );
}

function ServiceRow({ service }: { service: Service }) {
  const Icon = {
    ok: CheckCircle2,
    degraded: AlertTriangle,
    down: XCircle,
    skip: AlertTriangle,
  }[service.status];

  const color = {
    ok: "text-emerald-400",
    degraded: "text-amber-400",
    down: "text-red-400",
    skip: "text-zinc-500",
  }[service.status];

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Icon className={`h-4 w-4 shrink-0 ${color}`} />
        <div className="min-w-0">
          <p className="text-sm text-white">{service.name}</p>
          <a
            href={service.url}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] text-white/30 hover:text-white/50 font-mono truncate block"
          >
            {service.url}
          </a>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-xs font-mono uppercase tracking-wider ${color}`}>{service.status}</p>
        {service.latency_ms !== null && (
          <p className="text-[10px] text-white/30 font-mono">{service.latency_ms}ms</p>
        )}
        {service.detail && (
          <p className="text-[10px] text-white/40 mt-0.5 truncate max-w-[160px]">{service.detail}</p>
        )}
      </div>
    </div>
  );
}
