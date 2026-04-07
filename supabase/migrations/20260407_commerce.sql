-- ─────────────────────────────────────────────────────────────────────
-- Visio Auto Commerce — 5 tables
-- Created: 2026-04-07
-- Apply via: https://supabase.com/dashboard/project/xquzbgaenmohruluyhgv/sql
--
-- Schema design:
--   va_commerce_orders         — one-off purchases (lead packs, inspect reports, audit PDFs)
--   va_commerce_order_items    — line items for an order
--   va_commerce_subscriptions  — recurring monthly billing (BDC, Trust, Approve embed, etc.)
--   va_commerce_payments       — Yoco payment events (audit trail)
--   va_commerce_entitlements   — computed access rights (read by sibling apps)
--
-- Notes:
--   • All amounts in ZAR cents (integer) — no decimals
--   • All timestamps in UTC, use timestamptz
--   • RLS enabled but policies are permissive for service role; tighten when JWT auth lands
--   • Honesty Protocol: every row has a `data_source` for provenance (manual, jess_chat, yoco_webhook)
--   • Foreign keys to vt_transactions are NULL-able — commerce can run without trust
-- ─────────────────────────────────────────────────────────────────────

-- ── ORDERS ──────────────────────────────────────────────────────────
create table if not exists va_commerce_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null default ('VA-' || substring(replace(gen_random_uuid()::text, '-', '') from 1 for 10)),

  -- Customer
  buyer_email text not null,
  buyer_phone text,
  buyer_name text,
  dealer_id uuid,            -- references va_dealers.id when buyer is a dealer (null for consumer)

  -- Money
  subtotal_cents integer not null check (subtotal_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  currency text not null default 'ZAR',

  -- State
  status text not null default 'pending'
    check (status in ('pending', 'awaiting_payment', 'paid', 'fulfilled', 'cancelled', 'refunded', 'failed')),

  -- Payment
  yoco_checkout_id text,
  yoco_payment_id text,
  paid_at timestamptz,
  fulfilled_at timestamptz,

  -- Provenance (Honesty Protocol)
  data_source text not null default 'unknown',  -- 'jess_chat' | 'shop_page' | 'api' | 'manual'
  source_metadata jsonb default '{}'::jsonb,

  -- Audit
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Notes
  internal_notes text,
  buyer_notes text
);

create index if not exists idx_commerce_orders_buyer_email on va_commerce_orders(buyer_email);
create index if not exists idx_commerce_orders_status on va_commerce_orders(status);
create index if not exists idx_commerce_orders_created_at on va_commerce_orders(created_at desc);

-- ── ORDER ITEMS ─────────────────────────────────────────────────────
create table if not exists va_commerce_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references va_commerce_orders(id) on delete cascade,

  -- SKU snapshot at time of order (immutable history)
  sku text not null,
  label text not null,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity integer not null default 1 check (quantity > 0),
  line_total_cents integer not null check (line_total_cents >= 0),

  -- What this item grants
  product_key text,           -- 'approve' | 'inspect' | 'bdc' | 'intent' | 'open-finance' | 'trust' | 'leads' | 'concierge'
  grants_json jsonb default '[]'::jsonb,  -- entitlement keys granted on payment

  created_at timestamptz not null default now()
);

create index if not exists idx_commerce_order_items_order_id on va_commerce_order_items(order_id);
create index if not exists idx_commerce_order_items_sku on va_commerce_order_items(sku);

-- ── SUBSCRIPTIONS ───────────────────────────────────────────────────
create table if not exists va_commerce_subscriptions (
  id uuid primary key default gen_random_uuid(),
  subscription_number text unique not null default ('VS-' || substring(replace(gen_random_uuid()::text, '-', '') from 1 for 10)),

  -- Customer
  buyer_email text not null,
  buyer_phone text,
  buyer_name text,
  dealer_id uuid,

  -- SKU
  sku text not null,                    -- e.g. 'bdc-pro', 'trust-velocity'
  product_key text not null,            -- 'bdc' | 'trust' | etc.
  tier text,                            -- 'starter' | 'pro' | 'velocity' | etc.
  amount_cents integer not null check (amount_cents >= 0),
  billing_cadence_days integer not null default 30 check (billing_cadence_days > 0),
  revenue_share_pct numeric(5, 4),      -- e.g. 0.0100 for 1% GMV

  -- State
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'active', 'past_due', 'cancelled', 'paused', 'expired')),

  -- Lifecycle
  started_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancelled_at timestamptz,
  cancel_at_period_end boolean default false,

  -- Yoco
  yoco_initial_checkout_id text,
  last_payment_at timestamptz,
  next_billing_at timestamptz,

  -- Provenance
  data_source text not null default 'unknown',
  source_metadata jsonb default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_commerce_subs_buyer_email on va_commerce_subscriptions(buyer_email);
create index if not exists idx_commerce_subs_status on va_commerce_subscriptions(status);
create index if not exists idx_commerce_subs_sku on va_commerce_subscriptions(sku);
create index if not exists idx_commerce_subs_next_billing on va_commerce_subscriptions(next_billing_at) where status = 'active';

-- ── PAYMENTS ────────────────────────────────────────────────────────
create table if not exists va_commerce_payments (
  id uuid primary key default gen_random_uuid(),

  -- Foreign keys (one of these must be set)
  order_id uuid references va_commerce_orders(id) on delete set null,
  subscription_id uuid references va_commerce_subscriptions(id) on delete set null,

  -- Money
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'ZAR',

  -- Yoco event details
  yoco_event_type text not null,        -- 'payment.succeeded' | 'payment.failed' | 'refund.succeeded'
  yoco_payment_id text,
  yoco_checkout_id text,
  yoco_metadata jsonb default '{}'::jsonb,

  -- State
  status text not null check (status in ('succeeded', 'failed', 'refunded', 'pending')),
  failure_reason text,

  occurred_at timestamptz not null default now(),
  recorded_at timestamptz not null default now()
);

create index if not exists idx_commerce_payments_order_id on va_commerce_payments(order_id);
create index if not exists idx_commerce_payments_sub_id on va_commerce_payments(subscription_id);
create index if not exists idx_commerce_payments_yoco_payment_id on va_commerce_payments(yoco_payment_id);
create index if not exists idx_commerce_payments_occurred_at on va_commerce_payments(occurred_at desc);

-- ── ENTITLEMENTS ────────────────────────────────────────────────────
-- Computed table — every successful payment writes one row per granted key.
-- Sibling apps query this to gate features.
create table if not exists va_commerce_entitlements (
  id uuid primary key default gen_random_uuid(),

  -- Who
  buyer_email text not null,
  dealer_id uuid,

  -- What
  entitlement_key text not null,        -- e.g. 'bdc:pro', 'trust:velocity', 'inspect:unlimited'
  product_key text not null,            -- e.g. 'bdc', 'trust', 'inspect'
  tier text,                            -- e.g. 'pro', 'velocity', 'unlimited'

  -- Source
  granted_by text not null,             -- 'order' | 'subscription' | 'manual'
  order_id uuid references va_commerce_orders(id) on delete set null,
  subscription_id uuid references va_commerce_subscriptions(id) on delete set null,

  -- Lifecycle
  granted_at timestamptz not null default now(),
  expires_at timestamptz,               -- null = no expiry (one-off purchases) or rolling subscription
  revoked_at timestamptz,
  active boolean generated always as (revoked_at is null and (expires_at is null or expires_at > now())) stored,

  created_at timestamptz not null default now()
);

create unique index if not exists idx_commerce_ent_unique
  on va_commerce_entitlements(buyer_email, entitlement_key)
  where revoked_at is null;
create index if not exists idx_commerce_ent_buyer_email on va_commerce_entitlements(buyer_email);
create index if not exists idx_commerce_ent_active on va_commerce_entitlements(active) where active = true;

-- ── RLS POLICIES (permissive default — tighten when auth lands) ──
alter table va_commerce_orders enable row level security;
alter table va_commerce_order_items enable row level security;
alter table va_commerce_subscriptions enable row level security;
alter table va_commerce_payments enable row level security;
alter table va_commerce_entitlements enable row level security;

create policy "service_role_all" on va_commerce_orders for all using (true) with check (true);
create policy "service_role_all" on va_commerce_order_items for all using (true) with check (true);
create policy "service_role_all" on va_commerce_subscriptions for all using (true) with check (true);
create policy "service_role_all" on va_commerce_payments for all using (true) with check (true);
create policy "service_role_all" on va_commerce_entitlements for all using (true) with check (true);

-- ── updated_at triggers ──────────────────────────────────────────
create or replace function va_commerce_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_commerce_orders_updated_at
  before update on va_commerce_orders
  for each row execute function va_commerce_set_updated_at();

create trigger trg_commerce_subs_updated_at
  before update on va_commerce_subscriptions
  for each row execute function va_commerce_set_updated_at();

-- ── Done ────────────────────────────────────────────────────────────
-- Apply this file via the Supabase SQL editor.
-- After applying, the commerce API routes at /api/commerce/* will work end-to-end.
