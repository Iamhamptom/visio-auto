-- Visio Auto — Notification approval gate
-- 2026-04-24
-- Adds notification_status to va_leads so the dashboard can show which leads
-- still need manual approval before any WhatsApp/email alert fires.

alter table if exists public.va_leads
  add column if not exists notification_status text
    check (notification_status in ('pending_approval', 'approved', 'sent', 'failed', 'skipped'))
    default null;

create index if not exists va_leads_notification_status_idx
  on public.va_leads (notification_status)
  where notification_status is not null;

-- Orders: a few fields the webhook expects to update.
alter table if exists public.va_orders
  add column if not exists payment_id text,
  add column if not exists paid_at timestamptz,
  add column if not exists delivered_at timestamptz;

-- Dealers: columns the webhook flips on payment success.
alter table if exists public.va_dealers
  add column if not exists status text default 'pending_payment',
  add column if not exists payment_status text,
  add column if not exists last_payment_at timestamptz;

-- Payment event audit log.
create table if not exists public.va_payment_events (
  id uuid primary key default gen_random_uuid(),
  dealer_id text,
  tier text,
  amount_cents bigint,
  event_type text,
  yoco_checkout_id text,
  payload jsonb,
  created_at timestamptz default now()
);
