"use client";

import { useState, useEffect } from "react";
import {
  Package,
  LayoutGrid,
  List,
  Plus,
  Search,
  Car,
  Clock,
  Users,
  TrendingDown,
  TrendingUp,
  DollarSign,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────

type Condition = "new" | "demo" | "used" | "certified_preowned";
type VehicleType = "sedan" | "suv" | "bakkie" | "hatch" | "coupe" | "van";

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  variant: string;
  color: string;
  mileage: number;
  price: number;
  condition: Condition;
  vehicle_type: VehicleType;
  features: string[];
  days_on_lot: number;
  lead_match_count: number;
}

// ─── Mock Data ──────────────────────────────────────────────

const vehicles: Vehicle[] = [
  {
    id: "inv-001", brand: "Toyota", model: "Hilux 2.8 GD-6 Legend", year: 2025,
    variant: "Legend 50", color: "Glacier White", mileage: 12, price: 749_900,
    condition: "new", vehicle_type: "bakkie", features: ["Leather seats", "360 Camera", "Diff lock"],
    days_on_lot: 5, lead_match_count: 23,
  },
  {
    id: "inv-002", brand: "VW", model: "Polo 1.0 TSI Life", year: 2024,
    variant: "Life", color: "Reflex Silver", mileage: 4_800, price: 339_900,
    condition: "demo", vehicle_type: "hatch", features: ["Cruise control", "Apple CarPlay"],
    days_on_lot: 12, lead_match_count: 18,
  },
  {
    id: "inv-003", brand: "BMW", model: "X3 xDrive20d", year: 2023,
    variant: "M Sport", color: "Phytonic Blue", mileage: 32_000, price: 689_000,
    condition: "used", vehicle_type: "suv", features: ["M Sport package", "Panoramic roof", "Head-up display"],
    days_on_lot: 22, lead_match_count: 15,
  },
  {
    id: "inv-004", brand: "Hyundai", model: "Creta 1.5 Executive", year: 2025,
    variant: "Executive", color: "Phantom Black", mileage: 0, price: 429_900,
    condition: "new", vehicle_type: "suv", features: ["Wireless charging", "LED headlights"],
    days_on_lot: 3, lead_match_count: 31,
  },
  {
    id: "inv-005", brand: "Mercedes", model: "C200 AMG Line", year: 2024,
    variant: "AMG Line", color: "Obsidian Black", mileage: 8_500, price: 879_000,
    condition: "demo", vehicle_type: "sedan", features: ["AMG Line", "MBUX", "Burmester sound"],
    days_on_lot: 18, lead_match_count: 12,
  },
  {
    id: "inv-006", brand: "Toyota", model: "Fortuner 2.4 GD-6", year: 2025,
    variant: "4x4 AT", color: "Attitude Black", mileage: 0, price: 699_900,
    condition: "new", vehicle_type: "suv", features: ["4x4", "Automatic", "7 seats"],
    days_on_lot: 8, lead_match_count: 27,
  },
  {
    id: "inv-007", brand: "BMW", model: "320d M Sport", year: 2022,
    variant: "M Sport", color: "Alpine White", mileage: 45_000, price: 549_000,
    condition: "certified_preowned", vehicle_type: "sedan", features: ["M Sport", "Live Cockpit Plus"],
    days_on_lot: 35, lead_match_count: 9,
  },
  {
    id: "inv-008", brand: "Hyundai", model: "Tucson 2.0 Premium", year: 2024,
    variant: "Premium", color: "Shimmering Silver", mileage: 15_000, price: 519_000,
    condition: "used", vehicle_type: "suv", features: ["Panoramic sunroof", "Ventilated seats"],
    days_on_lot: 14, lead_match_count: 20,
  },
  {
    id: "inv-009", brand: "VW", model: "Tiguan 2.0 TSI R-Line", year: 2025,
    variant: "R-Line 4MOTION", color: "Oryx White Pearl", mileage: 0, price: 799_900,
    condition: "new", vehicle_type: "suv", features: ["R-Line", "4MOTION", "IQ.LIGHT"],
    days_on_lot: 6, lead_match_count: 16,
  },
  {
    id: "inv-010", brand: "Toyota", model: "Corolla Cross 1.8 XS HEV", year: 2025,
    variant: "Hybrid", color: "Celestite Grey", mileage: 0, price: 499_900,
    condition: "new", vehicle_type: "suv", features: ["Hybrid", "Toyota Safety Sense"],
    days_on_lot: 2, lead_match_count: 34,
  },
  {
    id: "inv-011", brand: "Mercedes", model: "GLC 220d 4MATIC", year: 2023,
    variant: "AMG Line", color: "Selenite Grey", mileage: 28_000, price: 949_000,
    condition: "used", vehicle_type: "suv", features: ["AMG Line", "360 Camera", "MBUX"],
    days_on_lot: 28, lead_match_count: 8,
  },
  {
    id: "inv-012", brand: "VW", model: "Golf 8 GTI", year: 2024,
    variant: "GTI", color: "Kings Red", mileage: 6_200, price: 649_000,
    condition: "demo", vehicle_type: "hatch", features: ["GTI badging", "DCC", "Akrapovic exhaust"],
    days_on_lot: 10, lead_match_count: 14,
  },
  {
    id: "inv-013", brand: "Hyundai", model: "i20 1.2 Motion", year: 2025,
    variant: "Motion", color: "Polar White", mileage: 0, price: 289_900,
    condition: "new", vehicle_type: "hatch", features: ["8\" touchscreen", "Reverse camera"],
    days_on_lot: 1, lead_match_count: 22,
  },
  {
    id: "inv-014", brand: "BMW", model: "X5 xDrive30d", year: 2023,
    variant: "M Sport", color: "Carbon Black", mileage: 41_000, price: 1_189_000,
    condition: "certified_preowned", vehicle_type: "suv", features: ["M Sport", "Air suspension", "Executive lounge"],
    days_on_lot: 42, lead_match_count: 5,
  },
  {
    id: "inv-015", brand: "Toyota", model: "RAV4 2.0 GX", year: 2024,
    variant: "GX CVT", color: "Emotional Red", mileage: 11_000, price: 489_000,
    condition: "used", vehicle_type: "suv", features: ["Toyota Safety Sense", "Apple CarPlay"],
    days_on_lot: 19, lead_match_count: 17,
  },
];

const conditionLabels: Record<Condition, { label: string; className: string }> = {
  new: { label: "New", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" },
  demo: { label: "Demo", className: "border-blue-500/30 bg-blue-500/10 text-blue-400" },
  used: { label: "Used", className: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  certified_preowned: { label: "CPO", className: "border-violet-500/30 bg-violet-500/10 text-violet-400" },
};

function formatPrice(amount: number): string {
  return `R${amount.toLocaleString("en-ZA")}`;
}

function formatMileage(km: number): string {
  if (km === 0) return "0 km";
  return `${km.toLocaleString("en-ZA")} km`;
}

export default function InventoryPage() {
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>(vehicles);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("days_on_lot");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    brand: "", model: "", year: 2025, price: 0, mileage: 0,
    condition: "new" as Condition, vehicle_type: "sedan" as VehicleType,
    variant: "", color: "", vin: "",
  });
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (brandFilter !== "all") params.set("brand", brandFilter);
    if (conditionFilter !== "all") params.set("condition", conditionFilter);
    if (typeFilter !== "all") params.set("vehicle_type", typeFilter);
    const url = `/api/inventory${params.toString() ? `?${params}` : ""}`;
    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        const rows = json.data ?? json.vehicles ?? json.inventory ?? [];
        if (rows.length > 0) setAllVehicles(rows);
      })
      .catch(() => {/* keep mock */})
      .finally(() => setLoading(false));
  }, [brandFilter, conditionFilter, typeFilter]);

  // Apply filters
  let filtered = allVehicles.filter((v) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !v.brand.toLowerCase().includes(q) &&
        !v.model.toLowerCase().includes(q) &&
        !v.variant.toLowerCase().includes(q)
      )
        return false;
    }
    if (brandFilter !== "all" && v.brand !== brandFilter) return false;
    if (conditionFilter !== "all" && v.condition !== conditionFilter) return false;
    if (typeFilter !== "all" && v.vehicle_type !== typeFilter) return false;
    return true;
  });

  // Sort
  if (sortBy === "price_asc") filtered.sort((a, b) => a.price - b.price);
  else if (sortBy === "price_desc") filtered.sort((a, b) => b.price - a.price);
  else if (sortBy === "days_on_lot") filtered.sort((a, b) => a.days_on_lot - b.days_on_lot);
  else if (sortBy === "matches") filtered.sort((a, b) => b.lead_match_count - a.lead_match_count);

  // Stats
  const stats = {
    total: filtered.length,
    avgPrice: Math.round(filtered.reduce((s, v) => s + v.price, 0) / (filtered.length || 1)),
    avgDays: Math.round(filtered.reduce((s, v) => s + v.days_on_lot, 0) / (filtered.length || 1)),
    fastMovers: filtered.filter((v) => v.days_on_lot <= 7).length,
    slowMovers: filtered.filter((v) => v.days_on_lot > 30).length,
  };

  const brands = [...new Set(allVehicles.map((v) => v.brand))].sort();
  const types = [...new Set(allVehicles.map((v) => v.vehicle_type))].sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventory</h1>
          <p className="text-sm text-zinc-400">
            Manage your digital showroom — {allVehicles.length} vehicles
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger
            render={<Button className="bg-emerald-600 text-white hover:bg-emerald-700" />}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto border-zinc-800 bg-zinc-950 sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white">Add Vehicle</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Add a new vehicle to your inventory
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Brand</Label>
                  <Input placeholder="e.g. Toyota" className="border-zinc-800 bg-zinc-900 text-zinc-200" value={newVehicle.brand} onChange={(e) => setNewVehicle((v) => ({ ...v, brand: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Model</Label>
                  <Input placeholder="e.g. Hilux 2.8 GD-6" className="border-zinc-800 bg-zinc-900 text-zinc-200" value={newVehicle.model} onChange={(e) => setNewVehicle((v) => ({ ...v, model: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Year</Label>
                  <Input type="number" placeholder="2025" className="border-zinc-800 bg-zinc-900 text-zinc-200" value={newVehicle.year} onChange={(e) => setNewVehicle((v) => ({ ...v, year: Number(e.target.value) }))} />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Price (R)</Label>
                  <Input type="number" placeholder="499900" className="border-zinc-800 bg-zinc-900 text-zinc-200" value={newVehicle.price || ""} onChange={(e) => setNewVehicle((v) => ({ ...v, price: Number(e.target.value) }))} />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Mileage</Label>
                  <Input type="number" placeholder="0" className="border-zinc-800 bg-zinc-900 text-zinc-200" value={newVehicle.mileage || ""} onChange={(e) => setNewVehicle((v) => ({ ...v, mileage: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Condition</Label>
                  <Select value={newVehicle.condition} onValueChange={(val) => setNewVehicle((v) => ({ ...v, condition: val as Condition }))}>
                    <SelectTrigger className="border-zinc-800 bg-zinc-900 text-zinc-200">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent className="border-zinc-800 bg-zinc-950">
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="demo">Demo</SelectItem>
                      <SelectItem value="used">Used</SelectItem>
                      <SelectItem value="certified_preowned">Certified Pre-Owned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Type</Label>
                  <Select value={newVehicle.vehicle_type} onValueChange={(val) => setNewVehicle((v) => ({ ...v, vehicle_type: val as VehicleType }))}>
                    <SelectTrigger className="border-zinc-800 bg-zinc-900 text-zinc-200">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="border-zinc-800 bg-zinc-950">
                      <SelectItem value="sedan">Sedan</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="bakkie">Bakkie</SelectItem>
                      <SelectItem value="hatch">Hatchback</SelectItem>
                      <SelectItem value="coupe">Coupe</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Variant</Label>
                  <Input placeholder="e.g. M Sport" className="border-zinc-800 bg-zinc-900 text-zinc-200" value={newVehicle.variant} onChange={(e) => setNewVehicle((v) => ({ ...v, variant: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Color</Label>
                  <Input placeholder="e.g. Alpine White" className="border-zinc-800 bg-zinc-900 text-zinc-200" value={newVehicle.color} onChange={(e) => setNewVehicle((v) => ({ ...v, color: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">VIN (optional)</Label>
                <Input placeholder="Vehicle Identification Number" className="border-zinc-800 bg-zinc-900 text-zinc-200" value={newVehicle.vin} onChange={(e) => setNewVehicle((v) => ({ ...v, vin: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose
                render={<Button variant="outline" className="border-zinc-800 text-zinc-300" />}
              >
                Cancel
              </DialogClose>
              <Button
                className="bg-emerald-600 text-white hover:bg-emerald-700"
                disabled={addLoading || !newVehicle.brand || !newVehicle.model}
                onClick={async () => {
                  setAddLoading(true);
                  try {
                    const res = await fetch("/api/inventory", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(newVehicle),
                    });
                    const json = await res.json();
                    const created = json.data ?? json.vehicle ?? json;
                    if (created?.id) {
                      setAllVehicles((prev) => [{ ...newVehicle, id: created.id, features: [], days_on_lot: 0, lead_match_count: 0 }, ...prev]);
                    }
                    setNewVehicle({ brand: "", model: "", year: 2025, price: 0, mileage: 0, condition: "new", vehicle_type: "sedan", variant: "", color: "", vin: "" });
                    setAddDialogOpen(false);
                  } catch { /* keep dialog open on error */ }
                  setAddLoading(false);
                }}
              >
                {addLoading ? "Adding..." : "Add Vehicle"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Card className="border-zinc-800/50 bg-zinc-900/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-zinc-500" />
              <span className="text-xs text-zinc-500">Total Vehicles</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-white">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800/50 bg-zinc-900/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-zinc-500" />
              <span className="text-xs text-zinc-500">Avg Price</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-white">
              {formatPrice(stats.avgPrice)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800/50 bg-zinc-900/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-zinc-500" />
              <span className="text-xs text-zinc-500">Avg Days on Lot</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-white">{stats.avgDays}</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800/50 bg-zinc-900/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-zinc-500">Fast Movers</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-emerald-400">
              {stats.fastMovers}
            </p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800/50 bg-zinc-900/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-zinc-500">Slow Movers</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-amber-400">
              {stats.slowMovers}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search brand, model, variant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-zinc-800 bg-zinc-900 pl-9 text-zinc-200 placeholder:text-zinc-600"
          />
        </div>
        <Select value={brandFilter} onValueChange={(v) => setBrandFilter(v ?? "all")}>
          <SelectTrigger className="w-[130px] border-zinc-800 bg-zinc-900 text-zinc-300">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent className="border-zinc-800 bg-zinc-950">
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={conditionFilter} onValueChange={(v) => setConditionFilter(v ?? "all")}>
          <SelectTrigger className="w-[130px] border-zinc-800 bg-zinc-900 text-zinc-300">
            <SelectValue placeholder="Condition" />
          </SelectTrigger>
          <SelectContent className="border-zinc-800 bg-zinc-950">
            <SelectItem value="all">All Conditions</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="demo">Demo</SelectItem>
            <SelectItem value="used">Used</SelectItem>
            <SelectItem value="certified_preowned">CPO</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
          <SelectTrigger className="w-[120px] border-zinc-800 bg-zinc-900 text-zinc-300">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="border-zinc-800 bg-zinc-950">
            <SelectItem value="all">All Types</SelectItem>
            {types.map((t) => (
              <SelectItem key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v ?? "days_on_lot")}>
          <SelectTrigger className="w-[140px] border-zinc-800 bg-zinc-900 text-zinc-300">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="border-zinc-800 bg-zinc-950">
            <SelectItem value="days_on_lot">Days on Lot</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="matches">Lead Matches</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex rounded-lg border border-zinc-800 bg-zinc-900/50 p-0.5">
          <button
            onClick={() => setView("grid")}
            className={cn(
              "rounded-md p-1.5 transition-colors",
              view === "grid"
                ? "bg-emerald-500/20 text-emerald-400"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "rounded-md p-1.5 transition-colors",
              view === "list"
                ? "bg-emerald-500/20 text-emerald-400"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((vehicle) => (
            <Card
              key={vehicle.id}
              className="group border-zinc-800/50 bg-zinc-900/50 transition-colors hover:border-zinc-700/50"
            >
              {/* Image Placeholder */}
              <div className="relative flex h-40 items-center justify-center rounded-t-lg bg-zinc-800/50">
                <Car className="h-12 w-12 text-zinc-700" />
                <Badge
                  variant="outline"
                  className={cn(
                    "absolute left-3 top-3",
                    conditionLabels[vehicle.condition].className
                  )}
                >
                  {conditionLabels[vehicle.condition].label}
                </Badge>
                <div className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-zinc-900/80 px-2 py-1 text-xs backdrop-blur-sm">
                  <Clock className="h-3 w-3 text-zinc-400" />
                  <span
                    className={cn(
                      "font-mono",
                      vehicle.days_on_lot <= 7
                        ? "text-emerald-400"
                        : vehicle.days_on_lot <= 21
                          ? "text-zinc-300"
                          : "text-amber-400"
                    )}
                  >
                    {vehicle.days_on_lot}d
                  </span>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-zinc-500">
                      {vehicle.year} {vehicle.brand}
                    </p>
                    <h3 className="truncate text-sm font-semibold text-white">
                      {vehicle.model}
                    </h3>
                    <p className="text-xs text-zinc-500">{vehicle.variant}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-lg font-bold text-emerald-400">
                    {formatPrice(vehicle.price)}
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
                  <span>{formatMileage(vehicle.mileage)}</span>
                  <span className="text-zinc-700">|</span>
                  <span>{vehicle.color}</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-zinc-800/50 pt-3">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-xs text-zinc-400">
                      <span className="font-mono text-emerald-400">
                        {vehicle.lead_match_count}
                      </span>{" "}
                      leads match
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-zinc-400 hover:text-white"
                  >
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <Card className="border-zinc-800/50 bg-zinc-900/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800/50 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Vehicle</TableHead>
                  <TableHead className="text-zinc-400">Year</TableHead>
                  <TableHead className="text-zinc-400">Condition</TableHead>
                  <TableHead className="text-right text-zinc-400">Price</TableHead>
                  <TableHead className="text-right text-zinc-400">Mileage</TableHead>
                  <TableHead className="text-right text-zinc-400">Days on Lot</TableHead>
                  <TableHead className="text-right text-zinc-400">Matches</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((vehicle) => (
                  <TableRow
                    key={vehicle.id}
                    className="border-zinc-800/30 hover:bg-zinc-800/30"
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-zinc-200">
                          {vehicle.brand} {vehicle.model}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {vehicle.variant} - {vehicle.color}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-300">{vehicle.year}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={conditionLabels[vehicle.condition].className}
                      >
                        {conditionLabels[vehicle.condition].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-emerald-400">
                      {formatPrice(vehicle.price)}
                    </TableCell>
                    <TableCell className="text-right text-zinc-300">
                      {formatMileage(vehicle.mileage)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          "font-mono",
                          vehicle.days_on_lot <= 7
                            ? "text-emerald-400"
                            : vehicle.days_on_lot <= 21
                              ? "text-zinc-300"
                              : "text-amber-400"
                        )}
                      >
                        {vehicle.days_on_lot}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Users className="h-3 w-3 text-emerald-400" />
                        <span className="font-mono text-zinc-200">
                          {vehicle.lead_match_count}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="h-12 w-12 text-zinc-700" />
          <h3 className="mt-4 text-lg font-medium text-zinc-300">
            No vehicles found
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Try adjusting your filters or add a new vehicle.
          </p>
          <Button
            className="mt-4 bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        </div>
      )}
    </div>
  );
}
