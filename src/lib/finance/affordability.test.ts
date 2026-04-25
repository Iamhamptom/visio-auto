import { describe, it, expect } from "vitest";
import { checkAffordability, ncaExpenseNorm, estimateMonthlyTaxAndUIF, SA_PRIME_RATE_2026_04 } from "./affordability";

describe("ncaExpenseNorm", () => {
  it("uses lowest band for very low income", () => {
    expect(ncaExpenseNorm(500)).toBe(0);
  });
  it("uses standard band mid-tier", () => {
    expect(ncaExpenseNorm(20_000)).toBeGreaterThan(0);
  });
  it("caps at top band", () => {
    expect(ncaExpenseNorm(100_000)).toBe(2_855);
  });
});

describe("estimateMonthlyTaxAndUIF", () => {
  it("returns 0-ish for income below threshold", () => {
    expect(estimateMonthlyTaxAndUIF(5_000)).toBeLessThan(500);
  });
  it("scales to higher tax for higher income", () => {
    const low = estimateMonthlyTaxAndUIF(20_000);
    const high = estimateMonthlyTaxAndUIF(80_000);
    expect(high).toBeGreaterThan(low);
  });
});

describe("checkAffordability", () => {
  it("declines very low income", () => {
    const r = checkAffordability({ gross_income_monthly: 4_000 });
    expect(r.recommendation).toBe("decline_likely");
  });

  it("approves comfortable income with no debt", () => {
    const r = checkAffordability({
      gross_income_monthly: 60_000,
      declared_debts_monthly: 0,
    });
    expect(r.recommendation).toBe("approve_likely");
    expect(r.affordable_vehicle_price).toBeGreaterThan(0);
  });

  it("flags borderline at high DTI", () => {
    const r = checkAffordability({
      gross_income_monthly: 40_000,
      declared_debts_monthly: 12_000,
    });
    expect(["borderline", "decline_likely"]).toContain(r.recommendation);
  });

  it("uses SA prime as default rate", () => {
    const r = checkAffordability({ gross_income_monthly: 50_000 });
    expect(r.assumptions.interest_rate_pct).toBe(SA_PRIME_RATE_2026_04);
  });

  it("includes deposit in affordable price", () => {
    const a = checkAffordability({ gross_income_monthly: 30_000 });
    const b = checkAffordability({ gross_income_monthly: 30_000, deposit: 100_000 });
    expect(b.affordable_vehicle_price).toBeGreaterThan(a.affordable_vehicle_price);
  });
});
