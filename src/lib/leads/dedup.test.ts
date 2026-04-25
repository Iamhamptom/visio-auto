import { describe, it, expect } from "vitest";
import { normalisePhone, mergeLeadInput } from "./dedup";
import type { Lead } from "@/lib/types";

describe("normalisePhone", () => {
  it("normalises +27 spaced", () => {
    expect(normalisePhone("+27 82 345 6789")).toBe("+27823456789");
  });
  it("normalises leading 0", () => {
    expect(normalisePhone("082 345 6789")).toBe("+27823456789");
  });
  it("normalises 9 digits without country", () => {
    expect(normalisePhone("823456789")).toBe("+27823456789");
  });
  it("preserves already-normalised", () => {
    expect(normalisePhone("+27823456789")).toBe("+27823456789");
  });
});

describe("mergeLeadInput", () => {
  const base: Lead = {
    id: "l-1",
    name: "Thabo M",
    phone: "+27821111111",
    email: null,
    whatsapp: "+27821111111",
    area: "Sandton",
    city: "Johannesburg",
    province: "Gauteng",
    budget_min: null,
    budget_max: null,
    preferred_brand: null,
    preferred_model: null,
    preferred_type: null,
    new_or_used: "any",
    has_trade_in: false,
    trade_in_brand: null,
    trade_in_model: null,
    trade_in_year: null,
    timeline: "just_browsing",
    finance_status: "unknown",
    ai_score: 30,
    score_tier: "cold",
    source: "get_quote_form",
    source_detail: null,
    language: "en",
    assigned_dealer_id: null,
    matched_vin: null,
    matched_vehicle: null,
    status: "new",
    contacted_at: null,
    test_drive_at: null,
    sold_at: null,
    sale_amount: null,
    created_at: "2026-04-01T00:00:00Z",
  };

  it("fills blank fields from fresh", () => {
    const merged = mergeLeadInput(base, {
      email: "thabo@example.com",
      preferred_brand: "BMW",
      ai_score: 70,
      score_tier: "warm",
    });
    expect(merged.email).toBe("thabo@example.com");
    expect(merged.preferred_brand).toBe("BMW");
  });

  it("always updates score and tier", () => {
    const merged = mergeLeadInput(
      { ...base, ai_score: 30, score_tier: "cold" },
      { ai_score: 80, score_tier: "hot" }
    );
    expect(merged.ai_score).toBe(80);
    expect(merged.score_tier).toBe("hot");
  });

  it("re-opt-in clears prior opt-out", () => {
    const merged = mergeLeadInput(base, {
      consent_version: "v1",
      consent_at: "2026-04-25T00:00:00Z",
      consent_ip: "1.2.3.4",
    });
    expect(merged.consent_version).toBe("v1");
    expect(merged.opted_out_at).toBeNull();
    expect(merged.popia_lawful_basis).toBe("consent");
  });
});
