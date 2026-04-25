import { NextResponse } from "next/server";

/**
 * Cross-suite status aggregator.
 * Probes each sibling's /api/health and the shared dependencies.
 */

interface ServiceStatus {
  name: string;
  url: string;
  status: "ok" | "degraded" | "down" | "skip";
  latency_ms: number | null;
  detail?: string;
}

const SUITE = [
  { name: "Visio Auto", url: "https://auto.visiocorp.co" },
  { name: "Visio Trade", url: "https://visio-trade.vercel.app" },
  { name: "Visio Approve", url: "https://visio-approve.vercel.app" },
  { name: "Visio Inspect", url: "https://visio-inspect.vercel.app" },
  { name: "Visio Open Finance", url: "https://visio-open-finance.vercel.app" },
  { name: "Visio Trust", url: "https://visio-trust.vercel.app" },
  { name: "Visio Intent", url: "https://visio-intent.vercel.app" },
  { name: "Visio BDC", url: "https://visio-bdc.vercel.app" },
];

async function probe(name: string, url: string, path = "/api/health"): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    const res = await fetch(`${url}${path}`, { signal: AbortSignal.timeout(5000) });
    const latency = Date.now() - start;
    if (res.ok) return { name, url, status: "ok", latency_ms: latency };
    if (res.status >= 500) return { name, url, status: "down", latency_ms: latency, detail: `HTTP ${res.status}` };
    return { name, url, status: "degraded", latency_ms: latency, detail: `HTTP ${res.status}` };
  } catch (err) {
    return {
      name,
      url,
      status: "down",
      latency_ms: null,
      detail: err instanceof Error ? err.message : "unknown",
    };
  }
}

async function probeRoot(name: string, url: string): Promise<ServiceStatus> {
  // Some products don't have /api/health yet — fall back to root.
  return probe(name, url, "/");
}

export async function GET() {
  const start = Date.now();

  const products = await Promise.all(
    SUITE.map(async (s) => {
      const healthy = await probe(s.name, s.url);
      if (healthy.status === "down") {
        // Fallback: root probe
        const root = await probeRoot(s.name, s.url);
        if (root.status === "ok") return { ...root, detail: "no /api/health, root reachable" };
      }
      return healthy;
    })
  );

  // External deps probe
  const supabase = await probe("Supabase", "https://xquzbgaenmohruluyhgv.supabase.co", "/rest/v1/");
  const yoco = await probe("Yoco API", "https://payments.yoco.com", "/api/checkouts/health-check");
  const resend = await probe("Resend API", "https://api.resend.com", "/");

  const all = [...products, supabase, yoco, resend];
  const overall: "ok" | "degraded" | "down" =
    all.every((s) => s.status === "ok") ? "ok"
      : all.some((s) => s.status === "down") ? "down"
      : "degraded";

  return NextResponse.json(
    {
      overall_status: overall,
      products,
      external: { supabase, yoco, resend },
      checked_at: new Date().toISOString(),
      total_duration_ms: Date.now() - start,
    },
    {
      status: overall === "down" ? 503 : 200,
      headers: { "Cache-Control": "public, max-age=60, s-maxage=60" },
    }
  );
}
