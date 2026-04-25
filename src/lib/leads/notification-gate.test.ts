import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { checkNotificationGate, NOTIFICATION_STATUS } from "./notification-gate";

const ORIGINAL = process.env;

describe("checkNotificationGate", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL };
  });
  afterEach(() => {
    process.env = ORIGINAL;
  });

  it("blocks by default when AUTO_NOTIFY_ENABLED is unset", () => {
    delete process.env.AUTO_NOTIFY_ENABLED;
    const r = checkNotificationGate({ kind: "dealer_new_lead", score_tier: "hot" });
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain("auto_notify_disabled");
  });

  it("blocks when AUTO_NOTIFY_ENABLED=false", () => {
    process.env.AUTO_NOTIFY_ENABLED = "false";
    const r = checkNotificationGate({ kind: "dealer_new_lead", score_tier: "hot" });
    expect(r.allowed).toBe(false);
  });

  it("allows manual override regardless of env", () => {
    delete process.env.AUTO_NOTIFY_ENABLED;
    const r = checkNotificationGate({ kind: "dealer_new_lead", manual_override: true });
    expect(r.allowed).toBe(true);
    expect(r.reason).toBe("manual_override");
  });

  it("allows hot tier when enabled", () => {
    process.env.AUTO_NOTIFY_ENABLED = "true";
    const r = checkNotificationGate({ kind: "dealer_new_lead", score_tier: "hot" });
    expect(r.allowed).toBe(true);
  });

  it("blocks cold tier even when enabled", () => {
    process.env.AUTO_NOTIFY_ENABLED = "true";
    const r = checkNotificationGate({ kind: "dealer_new_lead", score_tier: "cold" });
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain("threshold");
  });

  it("respects AUTO_NOTIFY_MIN_TIER override", () => {
    process.env.AUTO_NOTIFY_ENABLED = "true";
    process.env.AUTO_NOTIFY_MIN_TIER = "warm";
    const r = checkNotificationGate({ kind: "dealer_new_lead", score_tier: "warm" });
    expect(r.allowed).toBe(true);
  });
});

describe("NOTIFICATION_STATUS", () => {
  it("exposes the expected enum values", () => {
    expect(NOTIFICATION_STATUS.PENDING).toBe("pending_approval");
    expect(NOTIFICATION_STATUS.SENT).toBe("sent");
  });
});
