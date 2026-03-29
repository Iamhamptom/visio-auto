import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateVehicleSchema = z.object({
  brand: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  year: z.number().int().min(2000).max(2030).optional(),
  variant: z.string().optional(),
  color: z.string().optional(),
  mileage: z.number().int().min(0).optional(),
  price: z.number().positive().optional(),
  condition: z.enum(["new", "demo", "used", "certified_preowned"]).optional(),
  vehicle_type: z.enum(["sedan", "suv", "bakkie", "hatch", "coupe", "van"]).optional(),
  is_available: z.boolean().optional(),
  features: z.array(z.string()).optional(),
});

// Mock single vehicle lookup
function getMockVehicle(id: string) {
  return {
    id,
    dealer_id: "demo-dealer",
    vin: "AHTBB3FH20K123456",
    brand: "Toyota",
    model: "Hilux 2.8 GD-6 Legend",
    year: 2025,
    variant: "Legend 50",
    color: "Glacier White",
    mileage: 12,
    price: 749_900,
    condition: "new" as const,
    vehicle_type: "bakkie" as const,
    images: [],
    features: ["Leather seats", "360 Camera", "Diff lock", "18\" Alloys"],
    is_available: true,
    days_on_lot: 5,
    lead_match_count: 23,
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const vehicle = getMockVehicle(id);
  if (!vehicle) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }
  return NextResponse.json(vehicle);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = updateVehicleSchema.parse(body);

    const vehicle = getMockVehicle(id);
    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    const updated = { ...vehicle, ...parsed };
    return NextResponse.json(updated);
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const vehicle = getMockVehicle(id);
  if (!vehicle) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, id, is_available: false });
}
