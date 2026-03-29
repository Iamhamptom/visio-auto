-- VISIO AUTO — AI Automotive Intelligence Platform
-- Database Schema

-- Dealers (our clients)
CREATE TABLE va_dealers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  group_name TEXT,
  brands TEXT[] DEFAULT '{}',
  area TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT DEFAULT 'Gauteng',
  phone TEXT,
  email TEXT,
  website TEXT,
  dealer_principal TEXT,
  tier TEXT DEFAULT 'growth' CHECK (tier IN ('starter', 'growth', 'pro', 'enterprise')),
  monthly_fee INTEGER DEFAULT 15000,
  leads_quota INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  whatsapp_number TEXT,
  inventory_feed_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads (car buyers we find and sell to dealers)
CREATE TABLE va_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  whatsapp TEXT,
  area TEXT,
  city TEXT DEFAULT 'Johannesburg',
  province TEXT DEFAULT 'Gauteng',
  budget_min INTEGER,
  budget_max INTEGER,
  preferred_brand TEXT,
  preferred_model TEXT,
  preferred_type TEXT CHECK (preferred_type IN ('sedan', 'suv', 'bakkie', 'hatch', 'coupe', 'van', 'any')),
  new_or_used TEXT DEFAULT 'any' CHECK (new_or_used IN ('new', 'used', 'any')),
  has_trade_in BOOLEAN DEFAULT false,
  trade_in_brand TEXT,
  trade_in_model TEXT,
  trade_in_year INTEGER,
  timeline TEXT DEFAULT 'this_month' CHECK (timeline IN ('this_week', 'this_month', 'three_months', 'just_browsing')),
  finance_status TEXT DEFAULT 'unknown' CHECK (finance_status IN ('pre_approved', 'needs_finance', 'cash', 'unknown')),
  ai_score INTEGER DEFAULT 0 CHECK (ai_score >= 0 AND ai_score <= 100),
  score_tier TEXT DEFAULT 'cold' CHECK (score_tier IN ('hot', 'warm', 'cold')),
  source TEXT NOT NULL, -- meta_ad, google_ad, whatsapp, organic, referral, signal_engine
  source_detail TEXT, -- specific ad campaign, signal type, etc.
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'af', 'zu', 'st', 'ts', 'xh', 'nr', 'ss', 'tn', 've')),
  assigned_dealer_id UUID REFERENCES va_dealers(id),
  matched_vin TEXT,
  matched_vehicle TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'test_drive_booked', 'test_drive_done', 'negotiating', 'sold', 'lost', 'inactive')),
  whatsapp_convo_id TEXT,
  contacted_at TIMESTAMPTZ,
  test_drive_at TIMESTAMPTZ,
  sold_at TIMESTAMPTZ,
  sale_amount INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Signals (the intelligence engine)
CREATE TABLE va_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_type TEXT NOT NULL CHECK (signal_type IN (
    'new_business', 'new_apartment', 'job_change', 'promotion', 'funding_round',
    'contract_won', 'hiring', 'position_filled', 'relocation', 'expat_arrival',
    'birthday_milestone', 'new_driver_age', 'wedding', 'new_baby', 'graduation',
    'lease_expiring', 'insurance_claim', 'interest_rate_change', 'housing_development',
    'social_intent', 'competitor_closing', 'fleet_expansion', 'salary_season'
  )),
  title TEXT NOT NULL,
  description TEXT,
  person_name TEXT,
  person_phone TEXT,
  person_email TEXT,
  person_linkedin TEXT,
  company_name TEXT,
  area TEXT,
  city TEXT,
  province TEXT,
  data_source TEXT NOT NULL, -- cipc, linkedin, facebook, tiktok, news, transunion, manual
  source_url TEXT,
  signal_strength TEXT DEFAULT 'medium' CHECK (signal_strength IN ('strong', 'medium', 'weak')),
  buying_probability INTEGER DEFAULT 50 CHECK (buying_probability >= 0 AND buying_probability <= 100),
  estimated_budget_min INTEGER,
  estimated_budget_max INTEGER,
  vehicle_type_likely TEXT,
  converted_to_lead_id UUID REFERENCES va_leads(id),
  is_processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market data (Bloomberg terminal)
CREATE TABLE va_market_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_type TEXT NOT NULL CHECK (data_type IN (
    'monthly_sales', 'brand_share', 'model_ranking', 'price_trend',
    'days_to_sell', 'inventory_level', 'finance_rate', 'fuel_price',
    'used_car_index', 'segment_trend'
  )),
  brand TEXT,
  model TEXT,
  area TEXT,
  period TEXT NOT NULL, -- 2026-03, 2026-Q1, etc.
  value NUMERIC,
  value_previous NUMERIC,
  change_pct NUMERIC,
  unit TEXT, -- units, rands, days, percent
  source TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social radar (social media monitoring)
CREATE TABLE va_social_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('tiktok', 'facebook', 'instagram', 'linkedin', 'twitter', 'youtube')),
  signal_type TEXT NOT NULL CHECK (signal_type IN (
    'comment_intent', 'like_dealer', 'share_car', 'post_looking',
    'group_inquiry', 'marketplace_browse', 'video_engagement',
    'profile_change', 'birthday', 'life_event'
  )),
  person_name TEXT,
  person_handle TEXT,
  person_url TEXT,
  content TEXT,
  engagement_count INTEGER DEFAULT 0,
  sentiment TEXT DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'negative', 'neutral', 'intent')),
  brand_mentioned TEXT,
  model_mentioned TEXT,
  area_detected TEXT,
  language TEXT DEFAULT 'en',
  converted_to_signal_id UUID REFERENCES va_signals(id),
  is_processed BOOLEAN DEFAULT false,
  raw_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WhatsApp conversations
CREATE TABLE va_whatsapp_convos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES va_leads(id),
  phone TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'qualified', 'booked', 'closed', 'inactive')),
  messages JSONB DEFAULT '[]',
  ai_summary TEXT,
  qualification_data JSONB DEFAULT '{}',
  test_drive_booked BOOLEAN DEFAULT false,
  test_drive_datetime TIMESTAMPTZ,
  test_drive_dealer_id UUID REFERENCES va_dealers(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dealer inventory (VIN matching)
CREATE TABLE va_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES va_dealers(id) NOT NULL,
  vin TEXT,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  variant TEXT,
  color TEXT,
  mileage INTEGER DEFAULT 0,
  price INTEGER NOT NULL,
  condition TEXT DEFAULT 'new' CHECK (condition IN ('new', 'demo', 'used', 'certified_preowned')),
  vehicle_type TEXT CHECK (vehicle_type IN ('sedan', 'suv', 'bakkie', 'hatch', 'coupe', 'van')),
  images TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  days_on_lot INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dealer analytics / reporting
CREATE TABLE va_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES va_dealers(id) NOT NULL,
  period TEXT NOT NULL, -- 2026-03-29, 2026-03, 2026-Q1
  leads_delivered INTEGER DEFAULT 0,
  leads_contacted INTEGER DEFAULT 0,
  test_drives_booked INTEGER DEFAULT 0,
  test_drives_done INTEGER DEFAULT 0,
  sales_closed INTEGER DEFAULT 0,
  total_revenue INTEGER DEFAULT 0,
  avg_response_time_seconds INTEGER,
  ai_score_avg NUMERIC,
  best_source TEXT,
  best_brand TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_leads_dealer ON va_leads(assigned_dealer_id);
CREATE INDEX idx_leads_score ON va_leads(ai_score DESC);
CREATE INDEX idx_leads_status ON va_leads(status);
CREATE INDEX idx_leads_source ON va_leads(source);
CREATE INDEX idx_signals_type ON va_signals(signal_type);
CREATE INDEX idx_signals_processed ON va_signals(is_processed);
CREATE INDEX idx_social_platform ON va_social_signals(platform);
CREATE INDEX idx_social_processed ON va_social_signals(is_processed);
CREATE INDEX idx_inventory_dealer ON va_inventory(dealer_id);
CREATE INDEX idx_inventory_brand ON va_inventory(brand);
CREATE INDEX idx_market_type ON va_market_data(data_type, period);
CREATE INDEX idx_analytics_dealer ON va_analytics(dealer_id, period);
