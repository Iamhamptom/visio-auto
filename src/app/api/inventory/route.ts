import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// --- Mock inventory data ---

const mockInventory = [
  {
    id: "inv-001", dealer_id: "demo-dealer", vin: "AHTBB3FH20K123456",
    brand: "Toyota", model: "Hilux 2.8 GD-6 Legend", year: 2025, variant: "Legend 50",
    color: "Glacier White", mileage: 12, price: 749_900, condition: "new" as const,
    vehicle_type: "bakkie" as const, images: [], features: ["Leather seats", "360 Camera", "Diff lock", "18\" Alloys"],
    is_available: true, days_on_lot: 5, lead_match_count: 23,
  },
  {
    id: "inv-002", dealer_id: "demo-dealer", vin: "WVWZZZ6RZWY123456",
    brand: "VW", model: "Polo 1.0 TSI Life", year: 2024, variant: "Life",
    color: "Reflex Silver", mileage: 4_800, price: 339_900, condition: "demo" as const,
    vehicle_type: "hatch" as const, images: [], features: ["Cruise control", "Apple CarPlay", "Parking sensors"],
    is_available: true, days_on_lot: 12, lead_match_count: 18,
  },
  {
    id: "inv-003", dealer_id: "demo-dealer", vin: "WBAPH5C55BA123456",
    brand: "BMW", model: "X3 xDrive20d", year: 2023, variant: "M Sport",
    color: "Phytonic Blue", mileage: 32_000, price: 689_000, condition: "used" as const,
    vehicle_type: "suv" as const, images: [], features: ["M Sport package", "Panoramic roof", "Harman Kardon", "Head-up display"],
    is_available: true, days_on_lot: 22, lead_match_count: 15,
  },
  {
    id: "inv-004", dealer_id: "demo-dealer", vin: "MALC381AAKM123456",
    brand: "Hyundai", model: "Creta 1.5 Executive", year: 2025, variant: "Executive",
    color: "Phantom Black", mileage: 0, price: 429_900, condition: "new" as const,
    vehicle_type: "suv" as const, images: [], features: ["Wireless charging", "LED headlights", "Blind-spot monitor"],
    is_available: true, days_on_lot: 3, lead_match_count: 31,
  },
  {
    id: "inv-005", dealer_id: "demo-dealer", vin: "WDB9066331L123456",
    brand: "Mercedes", model: "C200 AMG Line", year: 2024, variant: "AMG Line",
    color: "Obsidian Black", mileage: 8_500, price: 879_000, condition: "demo" as const,
    vehicle_type: "sedan" as const, images: [], features: ["AMG Line", "MBUX", "Burmester sound", "Multibeam LED"],
    is_available: true, days_on_lot: 18, lead_match_count: 12,
  },
  {
    id: "inv-006", dealer_id: "demo-dealer", vin: "JTDKN3DU5A0123456",
    brand: "Toyota", model: "Fortuner 2.4 GD-6", year: 2025, variant: "4x4 AT",
    color: "Attitude Black", mileage: 0, price: 699_900, condition: "new" as const,
    vehicle_type: "suv" as const, images: [], features: ["4x4", "Automatic", "7 seats", "Terrain monitor"],
    is_available: true, days_on_lot: 8, lead_match_count: 27,
  },
  {
    id: "inv-007", dealer_id: "demo-dealer", vin: "WBA11AE010CD12345",
    brand: "BMW", model: "320d M Sport", year: 2022, variant: "M Sport",
    color: "Alpine White", mileage: 45_000, price: 549_000, condition: "certified_preowned" as const,
    vehicle_type: "sedan" as const, images: [], features: ["M Sport", "Live Cockpit Plus", "Adaptive suspension"],
    is_available: true, days_on_lot: 35, lead_match_count: 9,
  },
  {
    id: "inv-008", dealer_id: "demo-dealer", vin: "KMHDN45D12U123456",
    brand: "Hyundai", model: "Tucson 2.0 Premium", year: 2024, variant: "Premium",
    color: "Shimmering Silver", mileage: 15_000, price: 519_000, condition: "used" as const,
    vehicle_type: "suv" as const, images: [], features: ["Panoramic sunroof", "Ventilated seats", "Smart park assist"],
    is_available: true, days_on_lot: 14, lead_match_count: 20,
  },
  {
    id: "inv-009", dealer_id: "demo-dealer", vin: "WVWZZZ3CZWE123456",
    brand: "VW", model: "Tiguan 2.0 TSI R-Line", year: 2025, variant: "R-Line 4MOTION",
    color: "Oryx White Pearl", mileage: 0, price: 799_900, condition: "new" as const,
    vehicle_type: "suv" as const, images: [], features: ["R-Line", "4MOTION", "Digital Cockpit Pro", "IQ.LIGHT"],
    is_available: true, days_on_lot: 6, lead_match_count: 16,
  },
  {
    id: "inv-010", dealer_id: "demo-dealer", vin: "AHTBB3FH80K654321",
    brand: "Toyota", model: "Corolla Cross 1.8 XS HEV", year: 2025, variant: "Hybrid",
    color: "Celestite Grey", mileage: 0, price: 499_900, condition: "new" as const,
    vehicle_type: "suv" as const, images: [], features: ["Hybrid", "Toyota Safety Sense", "Wireless CarPlay", "Bi-tone roof"],
    is_available: true, days_on_lot: 2, lead_match_count: 34,
  },
  {
    id: "inv-011", dealer_id: "demo-dealer", vin: "WDC2539432F123456",
    brand: "Mercedes", model: "GLC 220d 4MATIC", year: 2023, variant: "AMG Line",
    color: "Selenite Grey", mileage: 28_000, price: 949_000, condition: "used" as const,
    vehicle_type: "suv" as const, images: [], features: ["AMG Line", "Air Body Control", "360 Camera", "MBUX"],
    is_available: true, days_on_lot: 28, lead_match_count: 8,
  },
  {
    id: "inv-012", dealer_id: "demo-dealer", vin: "WVWZZZ1JZYW123456",
    brand: "VW", model: "Golf 8 GTI", year: 2024, variant: "GTI",
    color: "Kings Red", mileage: 6_200, price: 649_000, condition: "demo" as const,
    vehicle_type: "hatch" as const, images: [], features: ["GTI badging", "Digital Cockpit", "DCC", "Akrapovic exhaust"],
    is_available: true, days_on_lot: 10, lead_match_count: 14,
  },
  {
    id: "inv-013", dealer_id: "demo-dealer", vin: "KMHSH81DBDU123456",
    brand: "Hyundai", model: "i20 1.2 Motion", year: 2025, variant: "Motion",
    color: "Polar White", mileage: 0, price: 289_900, condition: "new" as const,
    vehicle_type: "hatch" as const, images: [], features: ["8\" touchscreen", "Reverse camera", "Bluetooth"],
    is_available: true, days_on_lot: 1, lead_match_count: 22,
  },
  {
    id: "inv-014", dealer_id: "demo-dealer", vin: "WBA8E9C52GK123456",
    brand: "BMW", model: "X5 xDrive30d", year: 2023, variant: "M Sport",
    color: "Carbon Black", mileage: 41_000, price: 1_189_000, condition: "certified_preowned" as const,
    vehicle_type: "suv" as const, images: [], features: ["M Sport", "Air suspension", "4-zone climate", "Executive lounge"],
    is_available: true, days_on_lot: 42, lead_match_count: 5,
  },
  {
    id: "inv-015", dealer_id: "demo-dealer", vin: "AHTFB8GD7NK123456",
    brand: "Toyota", model: "RAV4 2.0 GX", year: 2024, variant: "GX CVT",
    color: "Emotional Red", mileage: 11_000, price: 489_000, condition: "used" as const,
    vehicle_type: "suv" as const, images: [], features: ["Toyota Safety Sense", "Apple CarPlay", "Adaptive cruise"],
    is_available: true, days_on_lot: 19, lead_match_count: 17,
  },
];

const addVehicleSchema = z.object({
  dealer_id: z.string().min(1),
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(2000).max(2030),
  variant: z.string().optional(),
  color: z.string().optional(),
  mileage: z.number().int().min(0),
  price: z.number().positive(),
  condition: z.enum(["new", "demo", "used", "certified_preowned"]),
  vehicle_type: z.enum(["sedan", "suv", "bakkie", "hatch", "coupe", "van"]).optional(),
  vin: z.string().optional(),
  features: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dealerId = searchParams.get("dealer_id") || "demo-dealer";
  const brand = searchParams.get("brand");
  const condition = searchParams.get("condition");
  const minPrice = searchParams.get("min_price") ? Number(searchParams.get("min_price")) : null;
  const maxPrice = searchParams.get("max_price") ? Number(searchParams.get("max_price")) : null;
  const vehicleType = searchParams.get("type");
  const sortBy = searchParams.get("sort_by") || "days_on_lot";

  let filtered = mockInventory.filter((v) => v.dealer_id === dealerId && v.is_available);

  if (brand) filtered = filtered.filter((v) => v.brand.toLowerCase() === brand.toLowerCase());
  if (condition) filtered = filtered.filter((v) => v.condition === condition);
  if (vehicleType) filtered = filtered.filter((v) => v.vehicle_type === vehicleType);
  if (minPrice !== null) filtered = filtered.filter((v) => v.price >= minPrice);
  if (maxPrice !== null) filtered = filtered.filter((v) => v.price <= maxPrice);

  if (sortBy === "price_asc") filtered.sort((a, b) => a.price - b.price);
  else if (sortBy === "price_desc") filtered.sort((a, b) => b.price - a.price);
  else if (sortBy === "days_on_lot") filtered.sort((a, b) => a.days_on_lot - b.days_on_lot);
  else if (sortBy === "date_added") filtered.sort((a, b) => a.days_on_lot - b.days_on_lot);
  else if (sortBy === "matches") filtered.sort((a, b) => b.lead_match_count - a.lead_match_count);

  const stats = {
    total: filtered.length,
    avg_price: Math.round(filtered.reduce((s, v) => s + v.price, 0) / (filtered.length || 1)),
    avg_days_on_lot: Math.round(filtered.reduce((s, v) => s + v.days_on_lot, 0) / (filtered.length || 1)),
    fast_movers: filtered.filter((v) => v.days_on_lot <= 7).length,
    slow_movers: filtered.filter((v) => v.days_on_lot > 30).length,
  };

  return NextResponse.json({ vehicles: filtered, stats });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = addVehicleSchema.parse(body);

    const newVehicle = {
      id: `inv-${Date.now()}`,
      ...parsed,
      images: [],
      features: parsed.features || [],
      is_available: true,
      days_on_lot: 0,
      lead_match_count: 0,
    };

    return NextResponse.json(newVehicle, { status: 201 });
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
