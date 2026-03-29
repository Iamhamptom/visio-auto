import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const matchSchema = z.object({
  budget_min: z.number().positive().optional(),
  budget_max: z.number().positive().optional(),
  preferred_brand: z.string().optional(),
  preferred_type: z.enum(["sedan", "suv", "bakkie", "hatch", "coupe", "van", "any"]).optional(),
  condition: z.enum(["new", "used", "demo", "certified_preowned", "any"]).optional(),
  dealer_id: z.string().optional(),
});

// Simplified mock inventory for matching
const inventory = [
  { id: "inv-001", brand: "Toyota", model: "Hilux 2.8 GD-6 Legend", year: 2025, price: 749_900, condition: "new", vehicle_type: "bakkie", days_on_lot: 5 },
  { id: "inv-002", brand: "VW", model: "Polo 1.0 TSI Life", year: 2024, price: 339_900, condition: "demo", vehicle_type: "hatch", days_on_lot: 12 },
  { id: "inv-003", brand: "BMW", model: "X3 xDrive20d", year: 2023, price: 689_000, condition: "used", vehicle_type: "suv", days_on_lot: 22 },
  { id: "inv-004", brand: "Hyundai", model: "Creta 1.5 Executive", year: 2025, price: 429_900, condition: "new", vehicle_type: "suv", days_on_lot: 3 },
  { id: "inv-005", brand: "Mercedes", model: "C200 AMG Line", year: 2024, price: 879_000, condition: "demo", vehicle_type: "sedan", days_on_lot: 18 },
  { id: "inv-006", brand: "Toyota", model: "Fortuner 2.4 GD-6", year: 2025, price: 699_900, condition: "new", vehicle_type: "suv", days_on_lot: 8 },
  { id: "inv-007", brand: "BMW", model: "320d M Sport", year: 2022, price: 549_000, condition: "certified_preowned", vehicle_type: "sedan", days_on_lot: 35 },
  { id: "inv-008", brand: "Hyundai", model: "Tucson 2.0 Premium", year: 2024, price: 519_000, condition: "used", vehicle_type: "suv", days_on_lot: 14 },
  { id: "inv-009", brand: "VW", model: "Tiguan 2.0 TSI R-Line", year: 2025, price: 799_900, condition: "new", vehicle_type: "suv", days_on_lot: 6 },
  { id: "inv-010", brand: "Toyota", model: "Corolla Cross 1.8 XS HEV", year: 2025, price: 499_900, condition: "new", vehicle_type: "suv", days_on_lot: 2 },
  { id: "inv-011", brand: "Mercedes", model: "GLC 220d 4MATIC", year: 2023, price: 949_000, condition: "used", vehicle_type: "suv", days_on_lot: 28 },
  { id: "inv-012", brand: "VW", model: "Golf 8 GTI", year: 2024, price: 649_000, condition: "demo", vehicle_type: "hatch", days_on_lot: 10 },
  { id: "inv-013", brand: "Hyundai", model: "i20 1.2 Motion", year: 2025, price: 289_900, condition: "new", vehicle_type: "hatch", days_on_lot: 1 },
  { id: "inv-014", brand: "BMW", model: "X5 xDrive30d", year: 2023, price: 1_189_000, condition: "certified_preowned", vehicle_type: "suv", days_on_lot: 42 },
  { id: "inv-015", brand: "Toyota", model: "RAV4 2.0 GX", year: 2024, price: 489_000, condition: "used", vehicle_type: "suv", days_on_lot: 19 },
];

function scoreMatch(
  vehicle: (typeof inventory)[number],
  prefs: z.infer<typeof matchSchema>
): number {
  let score = 50; // base score

  // Brand match: +30 for exact
  if (prefs.preferred_brand) {
    if (vehicle.brand.toLowerCase() === prefs.preferred_brand.toLowerCase()) {
      score += 30;
    }
  }

  // Type match: +20 for exact
  if (prefs.preferred_type && prefs.preferred_type !== "any") {
    if (vehicle.vehicle_type === prefs.preferred_type) {
      score += 20;
    }
  }

  // Budget match: +25 if within range, partial if close
  const inBudget =
    (!prefs.budget_min || vehicle.price >= prefs.budget_min) &&
    (!prefs.budget_max || vehicle.price <= prefs.budget_max);

  if (inBudget) {
    score += 25;
  } else if (prefs.budget_max) {
    const overBy = (vehicle.price - prefs.budget_max) / prefs.budget_max;
    if (overBy < 0.1) score += 15; // within 10% over
    else if (overBy < 0.2) score += 5; // within 20% over
  }

  // Condition preference
  if (prefs.condition && prefs.condition !== "any") {
    if (vehicle.condition === prefs.condition) score += 10;
  }

  // Newer is better (slight bonus)
  if (vehicle.year >= 2025) score += 5;

  // Fresher stock (less time on lot = more desirable)
  if (vehicle.days_on_lot <= 7) score += 5;

  return Math.min(score, 100);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prefs = matchSchema.parse(body);

    const scored = inventory
      .map((v) => ({
        ...v,
        relevance_score: scoreMatch(v, prefs),
      }))
      .filter((v) => v.relevance_score >= 50)
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, 5);

    return NextResponse.json({
      matches: scored,
      total_inventory: inventory.length,
      preferences: prefs,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
