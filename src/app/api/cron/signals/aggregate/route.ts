import { NextRequest, NextResponse } from "next/server";
import { orchestrateCollection } from "@/lib/signals/sources/orchestrator";

export const maxDuration = 60;

/**
 * Cron: multi-source signal aggregation.
 * Runs the AutoTrader + Cars.co.za + Facebook + (future) Gumtree collectors
 * in parallel, dedupes, and persists. Schedule via vercel.json: every 6h.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await orchestrateCollection({
      since: new Date(Date.now() - 6 * 3600_000),
      limit: 50,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Aggregation failed" },
      { status: 500 }
    );
  }
}
