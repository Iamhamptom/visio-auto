/**
 * Credit-bureau integration abstraction.
 *
 * SA bureau market: TransUnion, XDS, Compuscan, Experian. We expose a single
 * interface so the affordability route can call `checkBureau()` regardless of
 * which provider is wired. Without API keys, returns null — the caller falls
 * back to a model-only assessment and clearly labels it as such.
 */

export interface BureauCheckInput {
  id_number: string; // SA ID (13 digits)
  full_name?: string;
}

export interface BureauCheckResult {
  provider: string;
  score: number;
  score_band: "very_low" | "low" | "fair" | "good" | "excellent";
  default_count: number;
  judgment_count: number;
  enquiries_last_90d: number;
  available: boolean;
}

export async function checkBureau(
  input: BureauCheckInput
): Promise<BureauCheckResult | null> {
  // TransUnion XDS
  if (process.env.TRANSUNION_XDS_API_KEY && process.env.TRANSUNION_XDS_URL) {
    return await callTransUnion(input);
  }
  // Compuscan
  if (process.env.COMPUSCAN_API_KEY) {
    return await callCompuscan(input);
  }
  // Experian
  if (process.env.EXPERIAN_SA_API_KEY) {
    return await callExperian(input);
  }
  return null;
}

async function callTransUnion(input: BureauCheckInput): Promise<BureauCheckResult | null> {
  try {
    const res = await fetch(`${process.env.TRANSUNION_XDS_URL}/credit-report`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.TRANSUNION_XDS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id_number: input.id_number }),
    });
    if (!res.ok) {
      console.error("[bureau:tu] http error:", res.status);
      return null;
    }
    const data = (await res.json()) as Record<string, unknown>;
    return mapBureauResponse("TransUnion XDS", data);
  } catch (err) {
    console.error("[bureau:tu] error:", err);
    return null;
  }
}

async function callCompuscan(input: BureauCheckInput): Promise<BureauCheckResult | null> {
  try {
    const res = await fetch("https://api.compuscan.co.za/v1/credit-report", {
      method: "POST",
      headers: {
        "X-API-Key": process.env.COMPUSCAN_API_KEY ?? "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idNumber: input.id_number }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    return mapBureauResponse("Compuscan", data);
  } catch {
    return null;
  }
}

async function callExperian(input: BureauCheckInput): Promise<BureauCheckResult | null> {
  try {
    const res = await fetch("https://api.experian.co.za/v1/consumer-credit", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.EXPERIAN_SA_API_KEY ?? ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id_number: input.id_number }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    return mapBureauResponse("Experian SA", data);
  } catch {
    return null;
  }
}

function mapBureauResponse(provider: string, data: Record<string, unknown>): BureauCheckResult {
  const score = Number(data.score ?? data.creditScore ?? 0);
  let band: BureauCheckResult["score_band"] = "very_low";
  if (score >= 730) band = "excellent";
  else if (score >= 670) band = "good";
  else if (score >= 600) band = "fair";
  else if (score >= 550) band = "low";

  return {
    provider,
    score,
    score_band: band,
    default_count: Number(data.defaults ?? data.defaultCount ?? 0),
    judgment_count: Number(data.judgments ?? 0),
    enquiries_last_90d: Number(data.enquiries90d ?? 0),
    available: true,
  };
}
