import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Sample inventory — only used when Supabase is unreachable OR when the
// requested dealer_id is literally "demo-dealer" (for the public demo funnel).
// Flagged in the response so the UI can badge it as sample data.
// ---------------------------------------------------------------------------

const SAMPLE_INVENTORY = [
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

async function getSupabase() {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    return await createClient();
  } catch {
    return null;
  }
}

function computeStats(rows: Array<{ price: number; days_on_lot: number }>) {
  const total = rows.length;
  const avg_price = total ? Math.round(rows.reduce((s, v) => s + v.price, 0) / total) : 0;
  const avg_days_on_lot = total ? Math.round(rows.reduce((s, v) => s + v.days_on_lot, 0) / total) : 0;
  return {
    total,
    avg_price,
    avg_days_on_lot,
    fast_movers: rows.filter((v) => v.days_on_lot <= 7).length,
    slow_movers: rows.filter((v) => v.days_on_lot > 30).length,
  };
}

// ---------------------------------------------------------------------------
// GET /api/inventory
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dealerId = searchParams.get("dealer_id") || "demo-dealer";
  const brand = searchParams.get("brand");
  const condition = searchParams.get("condition");
  const minPrice = searchParams.get("min_price") ? Number(searchParams.get("min_price")) : null;
  const maxPrice = searchParams.get("max_price") ? Number(searchParams.get("max_price")) : null;
  const vehicleType = searchParams.get("type");
  const sortBy = searchParams.get("sort_by") || "days_on_lot";

  const supabase = await getSupabase();

  if (supabase && dealerId !== "demo-dealer") {
    let query = supabase
      .from("va_inventory")
      .select("*")
      .eq("dealer_id", dealerId)
      .eq("is_available", true)
      .limit(500);

    if (brand) query = query.ilike("brand", brand);
    if (condition) query = query.eq("condition", condition);
    if (vehicleType) query = query.eq("vehicle_type", vehicleType);
    if (minPrice !== null) query = query.gte("price", minPrice);
    if (maxPrice !== null) query = query.lte("price", maxPrice);

    const { data, error } = await query;
    if (!error && data) {
      const sorted = [...data];
      if (sortBy === "price_asc") sorted.sort((a, b) => a.price - b.price);
      else if (sortBy === "price_desc") sorted.sort((a, b) => b.price - a.price);
      else if (sortBy === "matches") sorted.sort((a, b) => (b.lead_match_count ?? 0) - (a.lead_match_count ?? 0));
      else sorted.sort((a, b) => (a.days_on_lot ?? 0) - (b.days_on_lot ?? 0));

      return NextResponse.json({ vehicles: sorted, stats: computeStats(sorted) });
    }
  }

  // Sample fallback (public demo OR DB unreachable)
  let filtered = SAMPLE_INVENTORY.filter((v) => v.dealer_id === dealerId && v.is_available);
  if (brand) filtered = filtered.filter((v) => v.brand.toLowerCase() === brand.toLowerCase());
  if (condition) filtered = filtered.filter((v) => v.condition === condition);
  if (vehicleType) filtered = filtered.filter((v) => v.vehicle_type === vehicleType);
  if (minPrice !== null) filtered = filtered.filter((v) => v.price >= minPrice);
  if (maxPrice !== null) filtered = filtered.filter((v) => v.price <= maxPrice);

  if (sortBy === "price_asc") filtered.sort((a, b) => a.price - b.price);
  else if (sortBy === "price_desc") filtered.sort((a, b) => b.price - a.price);
  else if (sortBy === "matches") filtered.sort((a, b) => b.lead_match_count - a.lead_match_count);
  else filtered.sort((a, b) => a.days_on_lot - b.days_on_lot);

  return NextResponse.json({
    vehicles: filtered,
    stats: computeStats(filtered),
    source: "sample_inventory",
  });
}

// ---------------------------------------------------------------------------
// POST /api/inventory — Add a vehicle
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = addVehicleSchema.parse(body);

    const newVehicle = {
      ...parsed,
      images: [],
      features: parsed.features ?? [],
      is_available: true,
      days_on_lot: 0,
      lead_match_count: 0,
      created_at: new Date().toISOString(),
    };

    const supabase = await getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database unavailable" },
        { status: 503 }
      );
    }

    const { data, error } = await supabase
      .from("va_inventory")
      .insert(newVehicle)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Vehicle with this VIN already exists", vin: parsed.vin },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
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
