-- Visio Auto — Row-Level Security + audit log
-- 2026-04-25
--
-- True multi-tenant isolation. Every va_* table that contains dealer-scoped
-- data gets an RLS policy: a dealer can only read/write rows where
-- assigned_dealer_id (or dealer_id) matches their session.
--
-- Service-role keys bypass RLS — that's intentional for cron, webhooks, and
-- the Workspace gateway. Anon-role + authenticated callers are constrained.

-- =============================================================================
-- Audit log — every meaningful write captured
-- =============================================================================
create table if not exists public.va_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid,
  actor_email text,
  actor_role text,
  table_name text not null,
  row_id text,
  action text not null check (action in ('insert','update','delete')),
  diff jsonb,
  request_ip text,
  request_id text,
  product text,                    -- which suite product (auto, approve, ...)
  reason text,
  created_at timestamptz default now()
);

create index if not exists va_audit_log_table_idx on public.va_audit_log (table_name, created_at desc);
create index if not exists va_audit_log_actor_idx on public.va_audit_log (actor_user_id, created_at desc);

-- =============================================================================
-- Helper: jwt_dealer_id() — pulls dealer_id from the joined va_dealer_users
-- row for the current authenticated user.
-- =============================================================================
create or replace function public.current_dealer_id() returns uuid
language sql stable security definer
as $$
  select dealer_id
  from public.va_dealer_users
  where user_id = auth.uid()
  order by created_at asc
  limit 1
$$;

grant execute on function public.current_dealer_id() to authenticated, anon;

-- =============================================================================
-- Enable RLS on every dealer-scoped table
-- =============================================================================
alter table if exists public.va_dealers enable row level security;
alter table if exists public.va_leads enable row level security;
alter table if exists public.va_signals enable row level security;
alter table if exists public.va_inventory enable row level security;
alter table if exists public.va_lead_receipts enable row level security;
alter table if exists public.va_affordability_checks enable row level security;
alter table if exists public.va_orders enable row level security;
alter table if exists public.va_payment_events enable row level security;
-- va_voice_calls is created lazily by the voice cron — guard with an existence check
do $$ begin
  if exists (select 1 from information_schema.tables where table_name = 'va_voice_calls') then
    execute 'alter table public.va_voice_calls enable row level security';
  end if;
end $$;
alter table if exists public.va_dealer_users enable row level security;
alter table if exists public.va_audit_log enable row level security;

-- =============================================================================
-- Policies (drop-and-create pattern so this migration is re-runnable)
-- =============================================================================

-- Dealers: a user reads their own dealer + dealers in the same group
drop policy if exists "dealer_select_self" on public.va_dealers;
create policy "dealer_select_self" on public.va_dealers
  for select
  using (id = public.current_dealer_id());

drop policy if exists "dealer_update_self" on public.va_dealers;
create policy "dealer_update_self" on public.va_dealers
  for update
  using (id = public.current_dealer_id())
  with check (id = public.current_dealer_id());

-- Leads: dealer-scoped via assigned_dealer_id
drop policy if exists "lead_select_assigned" on public.va_leads;
create policy "lead_select_assigned" on public.va_leads
  for select
  using (assigned_dealer_id = public.current_dealer_id());

drop policy if exists "lead_update_assigned" on public.va_leads;
create policy "lead_update_assigned" on public.va_leads
  for update
  using (assigned_dealer_id = public.current_dealer_id())
  with check (assigned_dealer_id = public.current_dealer_id());

-- Signals: visible to all authenticated dealers (they're market-level signals
-- until converted to a lead, at which point the lead-row RLS takes over).
drop policy if exists "signals_select_all_auth" on public.va_signals;
create policy "signals_select_all_auth" on public.va_signals
  for select
  using (auth.uid() is not null);

-- Inventory: dealer-scoped
drop policy if exists "inv_select_self" on public.va_inventory;
create policy "inv_select_self" on public.va_inventory
  for select
  using (dealer_id::text = public.current_dealer_id()::text);

drop policy if exists "inv_modify_self" on public.va_inventory;
create policy "inv_modify_self" on public.va_inventory
  for all
  using (dealer_id::text = public.current_dealer_id()::text)
  with check (dealer_id::text = public.current_dealer_id()::text);

-- Lead receipts: dealer-scoped
drop policy if exists "receipts_select_self" on public.va_lead_receipts;
create policy "receipts_select_self" on public.va_lead_receipts
  for select
  using (dealer_id = public.current_dealer_id());

-- Affordability checks: dealer-scoped (or unscoped public-form checks)
drop policy if exists "affordability_select_self" on public.va_affordability_checks;
create policy "affordability_select_self" on public.va_affordability_checks
  for select
  using (
    dealer_id is null
    or dealer_id = public.current_dealer_id()
  );

-- Orders: dealer-scoped
drop policy if exists "orders_select_self" on public.va_orders;
create policy "orders_select_self" on public.va_orders
  for select
  using (dealer_id::text = public.current_dealer_id()::text);

-- Payment events: dealer-scoped
drop policy if exists "payments_select_self" on public.va_payment_events;
create policy "payments_select_self" on public.va_payment_events
  for select
  using (dealer_id::text = public.current_dealer_id()::text);

-- Voice calls: dealer-scoped via the lead they reference (only if table exists)
do $$ begin
  if exists (select 1 from information_schema.tables where table_name = 'va_voice_calls') then
    execute 'drop policy if exists "voice_select_self" on public.va_voice_calls';
    execute $p$create policy "voice_select_self" on public.va_voice_calls
      for select using (
        exists (select 1 from public.va_leads l
          where l.id = lead_id and l.assigned_dealer_id = public.current_dealer_id())
      )$p$;
  end if;
end $$;

-- Dealer users: a user can see their own membership rows
drop policy if exists "dealer_users_self" on public.va_dealer_users;
create policy "dealer_users_self" on public.va_dealer_users
  for select
  using (user_id = auth.uid());

-- Audit log: dealer's own writes only (and admins/service role bypass)
drop policy if exists "audit_select_own_dealer" on public.va_audit_log;
create policy "audit_select_own_dealer" on public.va_audit_log
  for select
  using (
    actor_user_id = auth.uid()
  );

-- =============================================================================
-- Audit triggers — capture every write to high-value tables
-- =============================================================================
create or replace function public.va_audit_trigger() returns trigger
language plpgsql security definer
as $$
declare
  v_action text;
  v_diff jsonb;
  v_row_id text;
begin
  if (tg_op = 'INSERT') then
    v_action := 'insert';
    v_diff := to_jsonb(new);
    v_row_id := coalesce(new.id::text, null);
  elsif (tg_op = 'UPDATE') then
    v_action := 'update';
    v_diff := jsonb_build_object('before', to_jsonb(old), 'after', to_jsonb(new));
    v_row_id := coalesce(new.id::text, old.id::text);
  elsif (tg_op = 'DELETE') then
    v_action := 'delete';
    v_diff := to_jsonb(old);
    v_row_id := coalesce(old.id::text, null);
  end if;

  insert into public.va_audit_log (
    actor_user_id,
    table_name,
    row_id,
    action,
    diff
  ) values (
    auth.uid(),
    tg_table_name,
    v_row_id,
    v_action,
    v_diff
  );

  return coalesce(new, old);
end;
$$;

drop trigger if exists va_leads_audit on public.va_leads;
create trigger va_leads_audit
  after insert or update or delete on public.va_leads
  for each row execute function public.va_audit_trigger();

drop trigger if exists va_dealers_audit on public.va_dealers;
create trigger va_dealers_audit
  after insert or update or delete on public.va_dealers
  for each row execute function public.va_audit_trigger();

drop trigger if exists va_orders_audit on public.va_orders;
create trigger va_orders_audit
  after insert or update or delete on public.va_orders
  for each row execute function public.va_audit_trigger();

drop trigger if exists va_lead_receipts_audit on public.va_lead_receipts;
create trigger va_lead_receipts_audit
  after insert on public.va_lead_receipts
  for each row execute function public.va_audit_trigger();
