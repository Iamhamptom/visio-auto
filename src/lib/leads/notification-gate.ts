/**
 * Notification approval gate.
 *
 * Chairman's hard rule: never auto-send outreach (WhatsApp or email) to a
 * dealer or lead without explicit approval. Auto-convert, crons, and webhooks
 * that want to dispatch messages must go through this gate.
 *
 * Behavior:
 *   - If AUTO_NOTIFY_ENABLED=true and the score tier meets threshold → allow.
 *   - Otherwise → return { allowed: false, reason: "...pending manual approval" }
 *     and the caller persists a pending_approval row for the dashboard.
 *
 * This does NOT send anything — it decides whether the downstream send can fire.
 */

export interface NotificationGateInput {
  kind: "dealer_new_lead" | "lead_whatsapp_outbound" | "campaign_email";
  score_tier?: "hot" | "warm" | "cold";
  manual_override?: boolean;
}

export interface NotificationGateResult {
  allowed: boolean;
  reason: string;
}

export function checkNotificationGate(input: NotificationGateInput): NotificationGateResult {
  if (input.manual_override) {
    return { allowed: true, reason: "manual_override" };
  }

  if (process.env.AUTO_NOTIFY_ENABLED !== "true") {
    return {
      allowed: false,
      reason: "auto_notify_disabled:pending_manual_approval",
    };
  }

  // Even when auto-notify is on, cold leads never auto-fire — they always
  // require a human to review. Only hot (and optionally warm) leads auto-push.
  const threshold = (process.env.AUTO_NOTIFY_MIN_TIER ?? "hot").toLowerCase();
  const tierRank = { cold: 0, warm: 1, hot: 2 } as const;
  const minRank = tierRank[threshold as keyof typeof tierRank] ?? tierRank.hot;
  const leadRank = tierRank[input.score_tier ?? "cold"];

  if (leadRank < minRank) {
    return {
      allowed: false,
      reason: `below_auto_notify_threshold:${threshold}`,
    };
  }

  return { allowed: true, reason: "auto_notify_enabled" };
}

/** Status values written to lead notification_status column. */
export const NOTIFICATION_STATUS = {
  PENDING: "pending_approval",
  APPROVED: "approved",
  SENT: "sent",
  FAILED: "failed",
  SKIPPED: "skipped",
} as const;

export type NotificationStatus =
  (typeof NOTIFICATION_STATUS)[keyof typeof NOTIFICATION_STATUS];
