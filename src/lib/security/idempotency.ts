/**
 * Idempotency helpers for webhook handlers.
 *
 * Backed by a Supabase table `va_webhook_events` with a UNIQUE constraint on
 * (provider, event_id). First insert wins; subsequent retries return false
 * (already_processed) and the handler short-circuits with 200.
 */

export interface IdempotencyOptions {
  provider: "yoco" | "whatsapp" | "retell" | "vprai" | "resend";
  eventId: string;
  payload?: unknown;
}

export interface IdempotencyResult {
  isFirstSeen: boolean;
  storedAt: string | null;
}

async function getServiceClient() {
  try {
    const mod = await import("@/lib/supabase/service");
    return mod.createServiceClient();
  } catch {
    return null;
  }
}

/**
 * Try to claim this webhook event. Returns isFirstSeen=true exactly once
 * across all retries; subsequent calls return false.
 */
export async function claimWebhookEvent(
  opts: IdempotencyOptions
): Promise<IdempotencyResult> {
  const supabase = await getServiceClient();
  if (!supabase) {
    // Fail open in dev — without DB we can't dedupe, but that's ok for local.
    return { isFirstSeen: true, storedAt: null };
  }

  const { data, error } = await supabase
    .from("va_webhook_events")
    .insert({
      provider: opts.provider,
      event_id: opts.eventId,
      payload: opts.payload ?? null,
    })
    .select("created_at")
    .single();

  // 23505 = unique violation → already seen.
  if (error?.code === "23505") {
    return { isFirstSeen: false, storedAt: null };
  }

  if (error) {
    console.error("[idempotency] insert failed:", error.message);
    // Fail open rather than block legitimate webhooks if logging breaks.
    return { isFirstSeen: true, storedAt: null };
  }

  return { isFirstSeen: true, storedAt: data?.created_at ?? null };
}
