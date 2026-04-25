-- Visio Auto — Security + POPIA + product extensions
-- 2026-04-25
--
-- Adds:
--   - va_webhook_events  (idempotency for Yoco/WhatsApp/Retell)
--   - va_lead_receipts   (POPIA-clean lead receipt per delivery)
--   - va_data_rights_requests (POPIA data subject access/delete log)
--   - va_dealer_users    (auth: link Supabase auth users to dealers)
--   - va_lead_dedup      (helper view for phone/email lookup)
--   - va_leads.consent_*, va_leads.oem_pass_through  (compliance + product)
--   - va_leads.utm_*, va_leads.referrer (attribution)

-- =============================================================================
-- 1. Webhook idempotency
-- =============================================================================
create table if not exists public.va_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('yoco','whatsapp','retell','vprai','resend')),
  event_id text not null,
  payload jsonb,
  created_at timestamptz default now(),
  unique (provider, event_id)
);

create index if not exists va_webhook_events_provider_idx
  on public.va_webhook_events (provider, created_at desc);

-- =============================================================================
-- 2. POPIA — consent capture + lead receipts + data rights log
-- =============================================================================
alter table if exists public.va_leads
  add column if not exists consent_version text,
  add column if not exists consent_at timestamptz,
  add column if not exists consent_ip text,
  add column if not exists popia_lawful_basis text default 'consent',
  add column if not exists opt_out_token text default encode(gen_random_bytes(16), 'hex'),
  add column if not exists opted_out_at timestamptz;

create unique index if not exists va_leads_opt_out_token_idx
  on public.va_leads (opt_out_token)
  where opt_out_token is not null;

create table if not exists public.va_lead_receipts (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.va_leads(id) on delete cascade,
  dealer_id uuid references public.va_dealers(id) on delete cascade,
  delivered_at timestamptz default now(),
  lawful_basis text not null default 'consent',
  consent_version text,
  consent_at timestamptz,
  consent_ip text,
  source text,
  source_url text,
  opt_out_url text not null,
  channel text check (channel in ('whatsapp','email','dashboard','api')),
  receipt_hash text,
  metadata jsonb
);

create index if not exists va_lead_receipts_lead_idx on public.va_lead_receipts (lead_id);
create index if not exists va_lead_receipts_dealer_idx on public.va_lead_receipts (dealer_id);

create table if not exists public.va_data_rights_requests (
  id uuid primary key default gen_random_uuid(),
  request_type text not null check (request_type in ('access','export','delete','rectify','restrict')),
  email text,
  phone text,
  requester_ip text,
  status text not null default 'received' check (status in ('received','verified','in_progress','completed','rejected')),
  responded_at timestamptz,
  notes text,
  created_at timestamptz default now()
);

create index if not exists va_data_rights_requests_email_idx
  on public.va_data_rights_requests (email);

-- =============================================================================
-- 3. Auth — dealer user linkage
-- =============================================================================
create table if not exists public.va_dealer_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,            -- Supabase auth.users.id
  dealer_id uuid not null references public.va_dealers(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member','viewer')),
  email text not null,
  created_at timestamptz default now(),
  unique (user_id, dealer_id)
);

create index if not exists va_dealer_users_user_idx on public.va_dealer_users (user_id);
create index if not exists va_dealer_users_dealer_idx on public.va_dealer_users (dealer_id);

-- =============================================================================
-- 4. Product — OEM pass-through detection + attribution
-- =============================================================================
alter table if exists public.va_leads
  add column if not exists oem_pass_through boolean default false,
  add column if not exists oem_brand_detected text,
  add column if not exists oem_referrer_url text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists utm_term text,
  add column if not exists landing_referrer text;

-- =============================================================================
-- 5. Affordability check log (pre-decline checker product)
-- =============================================================================
create table if not exists public.va_affordability_checks (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.va_leads(id) on delete set null,
  dealer_id uuid references public.va_dealers(id) on delete set null,
  gross_income_monthly bigint,
  net_income_monthly bigint,
  declared_expenses_monthly bigint,
  expense_norm_used bigint,           -- NCA Reg 23A norm we applied
  discretionary_income bigint,
  affordable_installment bigint,
  affordable_vehicle_price bigint,
  declined_reasons jsonb,
  bureau_check_attempted boolean default false,
  bureau_check_score integer,
  bureau_provider text,
  recommendation text,                -- 'approve_likely' | 'borderline' | 'decline_likely'
  created_at timestamptz default now()
);

-- =============================================================================
-- 6. Source-of-truth for multi-marketplace signal aggregation
-- =============================================================================
alter table if exists public.va_signals
  add column if not exists source_marketplace text,    -- 'autotrader_sa','cars_co_za','facebook','gumtree','dealer_site','signal_engine','manual'
  add column if not exists source_listing_id text,
  add column if not exists source_listing_url text;

create index if not exists va_signals_source_marketplace_idx
  on public.va_signals (source_marketplace);
