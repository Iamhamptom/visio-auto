import type { Lead } from "@/lib/types";

/**
 * Find an existing lead with the same phone or email within the dedup window.
 * Returns null if not found.
 */
export async function findExistingLead(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  match: { phone?: string | null; email?: string | null },
  windowDays = 30
): Promise<Lead | null> {
  const cutoff = new Date(Date.now() - windowDays * 86400_000).toISOString();

  // Build OR query — phone OR email match within window.
  const filters: string[] = [];
  if (match.phone) filters.push(`phone.eq.${normalisePhone(match.phone)}`);
  if (match.email) filters.push(`email.eq.${match.email.toLowerCase()}`);

  if (filters.length === 0) return null;

  const { data, error } = await supabase
    .from("va_leads")
    .select("*")
    .or(filters.join(","))
    .gte("created_at", cutoff)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as Lead;
}

/**
 * Merge new submission into existing lead row. Newer wins for status/scoring,
 * empty fields on existing get filled from new submission, but contacted_at /
 * test_drive_at / sold_at are preserved.
 */
export function mergeLeadInput<T extends Record<string, unknown>>(
  existing: Lead,
  fresh: T
): Record<string, unknown> {
  const merged: Record<string, unknown> = {};

  // Fill blanks from fresh submission, keep existing values where present.
  for (const [k, v] of Object.entries(fresh)) {
    const existingVal = (existing as unknown as Record<string, unknown>)[k];
    if (existingVal == null || existingVal === "") {
      merged[k] = v;
    }
  }

  // Always update score + tier (recalculated)
  if ("ai_score" in fresh) merged.ai_score = fresh.ai_score;
  if ("score_tier" in fresh) merged.score_tier = fresh.score_tier;

  // Always update consent — if they re-submitted with consent, capture it.
  if ("consent_version" in fresh && fresh.consent_version) {
    merged.consent_version = fresh.consent_version;
    merged.consent_at = fresh.consent_at;
    merged.consent_ip = fresh.consent_ip;
    merged.popia_lawful_basis = "consent";
    // Re-opting in clears prior opt-out.
    merged.opted_out_at = null;
  }

  // Track OEM source if newly detected.
  if (fresh.oem_pass_through === true) {
    merged.oem_pass_through = true;
    merged.oem_brand_detected = fresh.oem_brand_detected;
    merged.oem_referrer_url = fresh.oem_referrer_url;
  }

  return merged;
}

/**
 * Normalise SA phone number to a comparable form.
 * "+27 82 345 6789" / "082 345 6789" / "0823456789" → "+27823456789"
 */
export function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("27") && digits.length === 11) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 10) return `+27${digits.slice(1)}`;
  if (digits.length === 9) return `+27${digits}`;
  return raw.startsWith("+") ? raw : digits;
}
