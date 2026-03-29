export type DealerTier = 'free' | 'starter' | 'growth' | 'pro' | 'enterprise'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'test_drive_booked' | 'test_drive_done' | 'negotiating' | 'sold' | 'lost' | 'inactive'
export type ScoreTier = 'hot' | 'warm' | 'cold'
export type VehicleType = 'sedan' | 'suv' | 'bakkie' | 'hatch' | 'coupe' | 'van' | 'any'
export type Language = 'en' | 'af' | 'zu' | 'st' | 'ts' | 'xh'

export type SignalType =
  | 'new_business' | 'new_apartment' | 'job_change' | 'promotion'
  | 'funding_round' | 'contract_won' | 'hiring' | 'position_filled'
  | 'relocation' | 'expat_arrival' | 'birthday_milestone' | 'new_driver_age'
  | 'wedding' | 'new_baby' | 'graduation' | 'lease_expiring'
  | 'insurance_claim' | 'interest_rate_change' | 'housing_development'
  | 'social_intent' | 'competitor_closing' | 'fleet_expansion' | 'salary_season'

export type SocialPlatform = 'tiktok' | 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'youtube'

export interface Dealer {
  id: string
  name: string
  group_name: string | null
  brands: string[]
  area: string
  city: string
  province: string
  phone: string | null
  email: string | null
  website: string | null
  dealer_principal: string | null
  tier: DealerTier
  monthly_fee: number
  leads_quota: number
  is_active: boolean
  whatsapp_number: string | null
  inventory_feed_url: string | null
  created_at: string
}

export interface Lead {
  id: string
  name: string
  phone: string
  email: string | null
  whatsapp: string | null
  area: string | null
  city: string
  province: string
  budget_min: number | null
  budget_max: number | null
  preferred_brand: string | null
  preferred_model: string | null
  preferred_type: VehicleType | null
  new_or_used: 'new' | 'used' | 'any'
  has_trade_in: boolean
  trade_in_brand: string | null
  trade_in_model: string | null
  trade_in_year: number | null
  timeline: 'this_week' | 'this_month' | 'three_months' | 'just_browsing'
  finance_status: 'pre_approved' | 'needs_finance' | 'cash' | 'unknown'
  ai_score: number
  score_tier: ScoreTier
  source: string
  source_detail: string | null
  language: Language
  assigned_dealer_id: string | null
  matched_vin: string | null
  matched_vehicle: string | null
  status: LeadStatus
  contacted_at: string | null
  test_drive_at: string | null
  sold_at: string | null
  sale_amount: number | null
  created_at: string
}

export interface Signal {
  id: string
  signal_type: SignalType
  title: string
  description: string | null
  person_name: string | null
  person_phone: string | null
  person_email: string | null
  person_linkedin: string | null
  company_name: string | null
  area: string | null
  city: string | null
  province: string | null
  data_source: string
  source_url: string | null
  signal_strength: 'strong' | 'medium' | 'weak'
  buying_probability: number
  estimated_budget_min: number | null
  estimated_budget_max: number | null
  vehicle_type_likely: string | null
  converted_to_lead_id: string | null
  is_processed: boolean
  created_at: string
}

export interface MarketData {
  id: string
  data_type: string
  brand: string | null
  model: string | null
  area: string | null
  period: string
  value: number
  value_previous: number | null
  change_pct: number | null
  unit: string
  source: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface SocialSignal {
  id: string
  platform: SocialPlatform
  signal_type: string
  person_name: string | null
  person_handle: string | null
  content: string | null
  engagement_count: number
  sentiment: string
  brand_mentioned: string | null
  model_mentioned: string | null
  area_detected: string | null
  language: string
  is_processed: boolean
  created_at: string
}

export interface InventoryItem {
  id: string
  dealer_id: string
  vin: string | null
  brand: string
  model: string
  year: number
  variant: string | null
  color: string | null
  mileage: number
  price: number
  condition: 'new' | 'demo' | 'used' | 'certified_preowned'
  vehicle_type: VehicleType | null
  images: string[]
  features: string[]
  is_available: boolean
  days_on_lot: number
}

export interface DealerAnalytics {
  id: string
  dealer_id: string
  period: string
  leads_delivered: number
  leads_contacted: number
  test_drives_booked: number
  test_drives_done: number
  sales_closed: number
  total_revenue: number
  avg_response_time_seconds: number | null
  ai_score_avg: number | null
  best_source: string | null
  best_brand: string | null
}
