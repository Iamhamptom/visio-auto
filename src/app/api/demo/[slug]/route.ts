import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// SA first names for fake leads
const SA_NAMES = [
  "James W.", "Thabo M.", "Sarah K.", "Pieter V.", "Nomsa D.",
  "Johan B.", "Lerato N.", "Francois S.", "Zanele K.", "David L.",
];
const SIGNALS = [
  "Lease expiring, budget R400-600K",
  "Just promoted — upgrading vehicle",
  "Relocating to your area — needs transport",
  "Posted on social media about new car",
  "Insurance payout — looking to buy",
  "Growing family — needs bigger vehicle",
  "Business owner — fleet expansion",
  "Searched for your brand this week",
];
const AREAS = ["Sandton", "Midrand", "Centurion", "Fourways", "Randburg", "Bryanston", "Bedfordview", "Roodepoort"];

// ─── GET /api/demo/[slug] — Return dealer demo data ────
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = createServiceClient();

  // Try to find inventory for this dealer slug
  // Slug format: "mazda-fourways" from company "Mazda Fourways"
  const dealerName = slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  // Check va_inventory for this dealer's cars
  const { data: inventory } = await supabase
    .from("va_inventory")
    .select("brand, model, year, price, mileage, condition")
    .ilike("dealer_id", `%${slug}%`)
    .limit(6);

  // If no inventory in DB, generate realistic mock based on brand in slug
  let cars = inventory?.map((v) => ({
    brand: v.brand,
    model: v.model,
    year: v.year,
    price: v.price,
    mileage: v.mileage,
    condition: v.condition || "used",
  })) ?? [];

  if (cars.length === 0) {
    cars = generateMockCars(slug, dealerName);
  }

  // Generate fake leads for the blurred preview
  const signalsCount = Math.floor(Math.random() * 30) + 25;
  const leads = Array.from({ length: 8 }, (_, i) => ({
    name: SA_NAMES[i % SA_NAMES.length],
    area: AREAS[Math.floor(Math.random() * AREAS.length)],
    signal: SIGNALS[i % SIGNALS.length],
    score: Math.floor(Math.random() * 25) + 70,
    tier: (Math.random() > 0.4 ? "hot" : "warm") as "hot" | "warm",
  }));

  // Try to get contact name from workspace leads
  let contactName = "";
  const { data: lead } = await supabase
    .from("leads")
    .select("name, location")
    .ilike("company", `%${dealerName.replace(/ /g, "%")}%`)
    .limit(1)
    .single();

  if (lead) contactName = lead.name ?? "";

  // Determine area from slug or lead data
  const area = (lead?.location as string) || guessArea(slug);

  return NextResponse.json({
    dealer_name: dealerName,
    dealer_slug: slug,
    contact_name: contactName,
    area,
    cars,
    signals_count: signalsCount,
    leads,
  });
}

// ─── Mock car generator based on brand in slug ──────────
function generateMockCars(slug: string, name: string): { brand: string; model: string; year: number; price: number; mileage: number; condition: string }[] {
  const brandModels: Record<string, { model: string; price: number; mileage: number }[]> = {
    bmw: [
      { model: "320i M Sport", price: 650000, mileage: 18000 },
      { model: "X3 xDrive20d", price: 850000, mileage: 25000 },
      { model: "530e M Sport", price: 1100000, mileage: 12000 },
    ],
    mazda: [
      { model: "CX-5 2.0 Active", price: 520000, mileage: 22000 },
      { model: "3 1.5 Individual", price: 430000, mileage: 15000 },
      { model: "CX-30 2.0 Individual", price: 490000, mileage: 8000 },
    ],
    toyota: [
      { model: "Hilux 2.8 GD-6 Legend", price: 780000, mileage: 30000 },
      { model: "Fortuner 2.4 GD-6 4x4", price: 720000, mileage: 35000 },
      { model: "Corolla Cross 1.8 XS", price: 480000, mileage: 12000 },
    ],
    hyundai: [
      { model: "Tucson 2.0 Premium", price: 550000, mileage: 20000 },
      { model: "Creta 1.5 Executive", price: 420000, mileage: 10000 },
      { model: "i20 1.2 Fluid", price: 320000, mileage: 8000 },
    ],
    ford: [
      { model: "Ranger 2.0 Bi-Turbo Wildtrak", price: 820000, mileage: 28000 },
      { model: "Everest 2.0 Bi-Turbo XLT", price: 750000, mileage: 22000 },
      { model: "Puma 1.0 EcoBoost ST-Line", price: 480000, mileage: 15000 },
    ],
    nissan: [
      { model: "Navara 2.5 dCi LE", price: 680000, mileage: 25000 },
      { model: "Qashqai 1.5 dCi Acenta", price: 450000, mileage: 18000 },
      { model: "X-Trail 2.5 Tekna", price: 520000, mileage: 30000 },
    ],
    mercedes: [
      { model: "C200 AMG Line", price: 780000, mileage: 15000 },
      { model: "GLC 220d 4MATIC", price: 950000, mileage: 20000 },
      { model: "A200 AMG Line", price: 620000, mileage: 12000 },
    ],
    suzuki: [
      { model: "Jimny 1.5 GLX", price: 420000, mileage: 5000 },
      { model: "Vitara 1.4T GLX", price: 450000, mileage: 15000 },
      { model: "Swift 1.2 GL", price: 260000, mileage: 20000 },
    ],
    volkswagen: [
      { model: "Polo 1.0 TSI Life", price: 380000, mileage: 18000 },
      { model: "Tiguan 2.0 TDI Elegance", price: 720000, mileage: 22000 },
      { model: "Golf 8 GTI", price: 750000, mileage: 10000 },
    ],
    volvo: [
      { model: "XC60 B5 Inscription", price: 950000, mileage: 18000 },
      { model: "XC40 T4 R-Design", price: 680000, mileage: 22000 },
      { model: "S60 T5 Inscription", price: 720000, mileage: 15000 },
    ],
    "land-rover": [
      { model: "Defender 110 D300 X", price: 1800000, mileage: 12000 },
      { model: "Discovery Sport D200 R-Dynamic", price: 950000, mileage: 25000 },
      { model: "Range Rover Evoque D200", price: 1100000, mileage: 18000 },
    ],
    audi: [
      { model: "A3 Sportback 35 TFSI", price: 580000, mileage: 15000 },
      { model: "Q5 40 TDI quattro", price: 920000, mileage: 20000 },
      { model: "A4 40 TFSI S line", price: 720000, mileage: 18000 },
    ],
    subaru: [
      { model: "Forester 2.0i-S ES", price: 620000, mileage: 15000 },
      { model: "XV 2.0i-S ES", price: 550000, mileage: 20000 },
      { model: "Outback 2.5i-S ES", price: 680000, mileage: 12000 },
    ],
    honda: [
      { model: "HR-V 1.5 Elegance", price: 480000, mileage: 15000 },
      { model: "Civic RS", price: 620000, mileage: 8000 },
      { model: "Fit 1.5 Elegance", price: 350000, mileage: 20000 },
    ],
    isuzu: [
      { model: "D-MAX 3.0 TD LSE", price: 720000, mileage: 25000 },
      { model: "mu-X 3.0 TD LS", price: 680000, mileage: 30000 },
    ],
    mg: [
      { model: "ZS 1.5 Excite", price: 350000, mileage: 10000 },
      { model: "HS 1.5T Essence", price: 480000, mileage: 15000 },
    ],
  };

  // Find matching brand from slug
  const slugLower = slug.toLowerCase();
  let matchedBrand = "toyota"; // default
  for (const brand of Object.keys(brandModels)) {
    if (slugLower.includes(brand)) { matchedBrand = brand; break; }
  }

  // Check for multi-brand groups
  if (slugLower.includes("cmh") || slugLower.includes("smg") || slugLower.includes("hatfield") || slugLower.includes("westvaal")) {
    // Try to extract brand from the full slug
    for (const brand of Object.keys(brandModels)) {
      if (slugLower.includes(brand)) { matchedBrand = brand; break; }
    }
  }

  const models = brandModels[matchedBrand] || brandModels.toyota;
  const brandName = matchedBrand.charAt(0).toUpperCase() + matchedBrand.slice(1);

  return models.map((m) => ({
    brand: brandName === "Land-rover" ? "Land Rover" : brandName === "Mg" ? "MG" : brandName,
    model: m.model,
    year: 2024 + Math.floor(Math.random() * 2),
    price: m.price + Math.floor(Math.random() * 50000) - 25000,
    mileage: m.mileage + Math.floor(Math.random() * 10000),
    condition: Math.random() > 0.3 ? "used" : "demo",
  }));
}

function guessArea(slug: string): string {
  const areaMap: Record<string, string> = {
    sandton: "Sandton", fourways: "Fourways", hatfield: "Hatfield, Pretoria",
    menlyn: "Menlyn, Pretoria", glen: "The Glen, Johannesburg",
    umhlanga: "Umhlanga, Durban", bryanston: "Bryanston", century: "Century City, Cape Town",
    constantia: "Constantia, Cape Town", welkom: "Welkom, Free State",
    vereeniging: "Vereeniging, Gauteng", sinoville: "Sinoville, Pretoria",
    randburg: "Randburg", alberton: "Alberton", durban: "Durban",
    "cape-town": "Cape Town", paarl: "Paarl", hillcrest: "Hillcrest, KZN",
  };
  for (const [key, area] of Object.entries(areaMap)) {
    if (slug.includes(key)) return area;
  }
  return "Gauteng";
}
