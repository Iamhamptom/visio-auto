/**
 * Visio Intelligence — Q1 2026 SA Automotive Snapshot API
 *
 * Free for all dealership partners. Returns the verified Q1 2026 dataset
 * documented in VRL-AUTO-001 (SA Automotive Intelligence Vol. 1).
 *
 * GET /api/intelligence/q1-2026
 *
 * Every figure cited. Sources documented per data point.
 * No authentication required for this snapshot — full intelligence feed
 * with custom queries requires a dealership partner key.
 */

import { NextResponse } from "next/server";

const dataset = {
  meta: {
    publisher: "Visio Research Labs",
    paper: "VRL-AUTO-001",
    paperUrl: "/papers/intelligence-vol-1",
    snapshotDate: "2026-04-07",
    license: "CC BY 4.0",
    contact: "research@visiocorp.co",
    notes:
      "Every numerical claim sourced inline. See the Honesty Protocol footnote in the published paper for known gaps.",
  },

  q1_2026_sales: {
    january: {
      units: 50073,
      yoy_change_pct: 7.5,
      headline: "LCVs rebound +11%, passenger cars +7.1%",
      source: "NAAMSA January 2026",
    },
    february: {
      units: 53455,
      yoy_change_pct: 11.4,
      headline: "Best February since 2013",
      source: "NAAMSA February 2026",
    },
    march: {
      units: 58060,
      yoy_change_pct: 17.3,
      headline: "Best March since 2007 — passenger cars +18.2%",
      passenger_cars: 39370,
      passenger_yoy_pct: 18.2,
      lcv: 15557,
      lcv_yoy_pct: 15.7,
      dealer_channel_pct: 88.7,
      rental_channel_pct: 5.5,
      government_channel_pct: 3.2,
      corporate_fleet_pct: 2.6,
      source: "NAAMSA March 2026",
    },
    q1_total: {
      units: 161588,
      yoy_change_pct: 12.0,
      source: "NAAMSA Q1 2026 aggregated",
    },
  },

  march_2026_brand_rankings: [
    { rank: 1, brand: "Toyota", units: 13323, yoy_unit_change: 1051 },
    { rank: 2, brand: "Volkswagen Group", units: 5574, yoy_unit_change: 679 },
    { rank: 3, brand: "Suzuki", units: 5047, yoy_unit_change: -1515 },
    { rank: 4, brand: "Isuzu", units: 3513, yoy_unit_change: 1142, note: "Displaced Hyundai for #4" },
    { rank: 5, brand: "Hyundai", units: 3258, yoy_unit_change: 122 },
    { rank: 6, brand: "Ford", units: 2828, yoy_unit_change: -100 },
    { rank: 7, brand: "GWM", units: 2777, yoy_unit_change: 163, asian_oem: true },
    { rank: 8, brand: "Chery", units: 2390, yoy_unit_change: 78, asian_oem: true },
    { rank: 9, brand: "Mahindra", units: 2280, yoy_unit_change: 284, asian_oem: true },
    { rank: 10, brand: "Jetour", units: 1768, yoy_unit_change: 95, asian_oem: true },
  ],

  full_year_2025: {
    total_units: 596818,
    yoy_change_pct: 15.7,
    passenger_cars: 422292,
    passenger_yoy_pct: 20.1,
    used_market_units: 383410,
    used_market_value_zar_billions: 160.1,
    bev_units: 1018,
    bev_share_pct: 0.17,
    bev_yoy_pct: -17,
    bev_h1_yoy_pct: 65,
    sources: [
      "NAAMSA December 2025 / Full Year release",
      "AutoTrader 20th Annual Car Industry Report",
      "GreenCape Market Intelligence Report SA 2025: EVs",
    ],
  },

  brand_share_2025: [
    { rank: 1, brand: "Toyota (incl. Lexus, Hino)", units: 148122, share_pct: 24.8, note: "46th consecutive year #1" },
    { rank: 2, brand: "Suzuki", units: 71560, note: "Record. First time #2 — overtook VW Group" },
    { rank: 3, brand: "Volkswagen Group", note: "Dropped to #3" },
    { rank: 8, brand: "Chery", units: 25304, yoy_pct: 26.7 },
    { rank: 9, brand: "Kia", units: 18517, yoy_pct: 25.3 },
    { rank: 12, brand: "Nissan", units: 15085, yoy_pct: -32.3, note: "Lost 5 places" },
  ],

  macro: {
    prime_rate: {
      current_pct: 10.25,
      peak_pct: 11.75,
      cumulative_cuts_bps: 150,
      cuts_since: "September 2024",
    },
    inflation_pct: {
      headline_feb_2026: 3.0,
      new_vehicle_inflation_2025_2026: 1.2,
      used_vehicle_deflation_2025_2026: 1.9,
    },
    private_credit_extension_yoy_pct_dec_2025: 8.7,
    bankservafrica_btpi_jan_2025_zar: 18098,
    fuel_price_april_2026: {
      diesel_zar_per_litre_record: 26.11,
      diesel_increase_zar: 7.0,
      petrol_increase_zar: 3.06,
      brent_crude_usd_above: 80,
      rand_usd_approx: 16.16,
    },
    two_pot_liquidity_zar_billions_2025: { low: 40, high: 60 },
    dealer_confidence_index: 67,
    dealer_confidence_note: "13-year high",
  },

  unemployment_q4_2025: {
    official_pct: 31.4,
    yoy_change_pp: -0.5,
    employed_millions: 17.1,
    youth_15_34_pct: 43.8,
    expanded_lu3_pct: 42.1,
    note: "Lowest in over 5 years",
    source: "Stats SA QLFS Q4 2025 (released 17 Feb 2026)",
  },

  buyer_demographics_2025: {
    gen_z_18_29_purchase_intent_pct: 25,
    millennials_30_45_pct: 21,
    gen_x_46_61_pct: 14,
    boomers_62_80_pct: 7,
    source: "TransUnion Q4 2025 Mobility Insights",
  },

  chery_rosslyn_acquisition: {
    headline: "Chery acquires Nissan's 60-year-old Rosslyn plant in Tshwane",
    deal_status: "Comprehensive agreement finalized",
    plant_age_years: 60,
    location: "Rosslyn, Tshwane",
    retrofit_period_months: { min: 12, max: 18 },
    target_production_start: "End of 2027",
    product_mix: ["ICE", "Hybrid", "PHEV"],
    jobs_direct_indirect_approx: 3000,
    nissan_employees_offered_employment_pct: "majority",
    chery_current_sa_volume_annual: 50000,
    chery_dealer_network: 150,
    strategic_intent: "SA as strategic export hub for African and European markets",
    significance: "First major Chinese OEM industrial footprint in South Africa",
  },

  super_group_h1_fy26: {
    period: "Six months ended December 2025",
    asian_brand_volume_growth_pct: 102.0,
    asian_brand_share_of_total_pct: 30,
    specialized_facilities: 28,
    new_brands_added: ["Geely", "Tata", "Mahindra", "GWM"],
    dealership_revenue_zar_billions: 6.0,
    dealership_revenue_growth_pct: 12.7,
    source: "Super Group H1 FY2026 SENS",
  },

  manufacturing_crisis: {
    sector_gdp_contribution_pct: 5.2,
    manufacturing_output_share_pct: 22.6,
    formal_sector_jobs: 498000,
    feb_2026_exports: { units: 24221, yoy_pct: -28.1 },
    march_2026_exports: { units: 37388, yoy_pct: -5.3 },
    morocco_overtake: {
      status: "Morocco overtook SA as #1 vehicle producer in Africa",
      morocco_advantages: [
        "25-year corporate tax exemptions for export production",
        "Labour costs ~$106 per vehicle",
        "Aggressively courting NEV manufacturers including BYD",
      ],
    },
    local_production_2024: 515850,
    saam_2035_target: 784509,
    import_penetration_pct: 64,
    local_content_pct: 39,
    saam_local_content_target_pct: 60,
    bosch_tier1_viability_units_per_year: 1000000,
  },

  ev_policy: {
    headline: "150% tax deduction for BEV/H2 production capex",
    legislation: "Taxation Laws Amendment Act No. 42 of 2024",
    effective_date: "2026-03-01",
    duration_years: 10,
    eligible_capex: ["new buildings", "factory improvements", "plant machinery"],
    treasury_fiscal_cost_fy26_27_zar_millions: 500,
    fast_charging_points_planned: 120,
    minister_quoted: "Parks Tau (Minister of Trade, Industry and Competition)",
    nev_2025_units: 16700,
    nev_2025_share_pct: 4,
    hybrid_share_of_nev_pct: 75,
  },

  africa_hnw: {
    source_2025: "Henley & Partners Africa Wealth Report 2025",
    continental_hnwi_count: 122500,
    continental_centi_millionaires: 348,
    continental_billionaires: 25,
    total_private_wealth_usd_trillions: 2.5,
    by_country_2024: {
      south_africa: 37400,
      egypt: 15600,
      nigeria: 8200,
      kenya: 7200,
    },
    by_city_2025: {
      johannesburg: 11700,
      cape_town: 8500,
      cape_town_centi_millionaires: 35,
      lagos_continental_rank: 7,
    },
    knight_frank_uhnwi_5yr_growth_forecast_pct: {
      cote_d_ivoire: 119,
      nigeria: 90,
      zambia: 40,
      south_africa: 32,
    },
  },

  destination_country_duty_stacks: {
    nigeria: "20% duty + 15% NAC + 7.5% VAT + 7% SUR + 0.5% ETLS + 4% FOB",
    kenya: "25% duty + up to 35% excise + 16% VAT + 3.5% IDF + 2% RDL (8-yr age limit, RHD only)",
    angola: "~30% duty + 14% VAT (BNA FX caps apply)",
    drc: "30% duty + 16% VAT (RHD ban since 2009 — LHD only)",
  },

  used_car_jan_2026: {
    units: 34452,
    yoy_pct: 11.28,
    mom_pct: 12.07,
    value_zar_billions: 14.32,
    avg_transaction_price_zar: 416082,
    avg_mileage_km: 70938,
    used_to_new_ratio_late_2025: 2.9,
    used_to_new_ratio_2024: 3.8,
    source: "AutoTrader Industry Report 2026",
  },

  autotrader_top_searched_2026: [
    { rank: 1, model: "Toyota Hilux", searches: 12371080 },
    { rank: 2, model: "VW Polo", searches: 11305009 },
    { rank: 3, model: "Ford Ranger", searches: 9366333 },
    { rank: 4, model: "VW Golf", searches: 7048674 },
    { rank: 5, model: "BMW 3 Series", searches: 6860624 },
  ],
};

export async function GET() {
  return NextResponse.json(dataset, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
