-- ============================================================
-- Daily — Core Business Schema
-- Run this in Supabase Dashboard > SQL Editor
-- REQUIRES: 20260520_auth_schema.sql already applied
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists pgcrypto;

-- ============================================================
-- ORGANIZATIONS
-- Created first so org_members can reference it.
-- RLS policies are applied after my_org_id() is defined below.
-- ============================================================
create table public.organizations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  industry   text,
  owner_id   uuid references auth.users on delete set null,
  plan       text not null default 'free',   -- free|starter|pro|enterprise
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger organizations_updated_at
  before update on public.organizations
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- ORG MEMBERS
-- Created second so my_org_id() (below) can reference it.
-- ============================================================
create table public.org_members (
  id        uuid primary key default gen_random_uuid(),
  org_id    uuid references public.organizations on delete cascade not null,
  user_id   uuid references auth.users on delete cascade not null,
  role      text not null default 'admin',   -- owner|admin|manager
  joined_at timestamptz not null default now(),
  unique (org_id, user_id)
);

-- ============================================================
-- HELPER: current user's org_id
-- Defined AFTER org_members exists — SQL functions are validated
-- at creation time, so the table must already exist.
-- SECURITY DEFINER bypasses RLS when reading org_members.
-- ============================================================
create or replace function public.my_org_id()
returns uuid
language sql stable
security definer
set search_path = public
as $$
  select org_id
  from   public.org_members
  where  user_id = auth.uid()
  limit  1
$$;

-- ============================================================
-- RLS: ORGANIZATIONS
-- ============================================================
alter table public.organizations enable row level security;

create policy "Org members can view their organization"
  on public.organizations for select
  using (id = my_org_id());

create policy "Org owner can update their organization"
  on public.organizations for update
  using (owner_id = auth.uid());

-- ============================================================
-- RLS: ORG MEMBERS
-- ============================================================
alter table public.org_members enable row level security;

create policy "Members can view their own membership"
  on public.org_members for select
  using (user_id = auth.uid());

-- ============================================================
-- AUTO-CREATE ORG WHEN ONBOARDING COMPLETES
-- Fires when profiles.onboarding_complete flips to true.
-- ============================================================
create or replace function public.handle_onboarding_complete()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_org_id uuid;
begin
  if new.onboarding_complete = true
     and (old.onboarding_complete = false or old.onboarding_complete is null)
  then
    insert into public.organizations (name, industry, owner_id)
    values (
      coalesce(nullif(trim(new.company_name), ''), 'My Company'),
      new.industry,
      new.id
    )
    returning id into new_org_id;

    insert into public.org_members (org_id, user_id, role)
    values (new_org_id, new.id, 'owner');
  end if;
  return new;
end;
$$;

create trigger on_onboarding_complete
  after update on public.profiles
  for each row execute procedure public.handle_onboarding_complete();

-- ============================================================
-- LOCATIONS / GEOFENCES
-- ============================================================
create table public.locations (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid references public.organizations on delete cascade not null,
  name            text not null,
  address         text,
  latitude        numeric(10, 7),
  longitude       numeric(10, 7),
  radius_meters   int not null default 100,
  validation_mode text not null default 'warn',   -- off|warn|require
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.locations enable row level security;

create policy "Org members can manage locations"
  on public.locations for all
  using  (org_id = my_org_id())
  with check (org_id = my_org_id());

create trigger locations_updated_at
  before update on public.locations
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- JOBS
-- ============================================================
create table public.jobs (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid references public.organizations on delete cascade not null,
  customer    text not null,
  name        text not null,
  location_id uuid references public.locations on delete set null,
  budget      numeric(12, 2),
  spent       numeric(12, 2) not null default 0,
  status      text not null default 'active',   -- active|complete|archived
  color       text default '#3b82f6',
  start_date  date,
  end_date    date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.jobs enable row level security;

create policy "Org members can manage jobs"
  on public.jobs for all
  using  (org_id = my_org_id())
  with check (org_id = my_org_id());

create trigger jobs_updated_at
  before update on public.jobs
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- EMPLOYEES
-- ============================================================
create table public.employees (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid references public.organizations on delete cascade not null,
  name       text not null,
  badge      text not null,
  role       text not null default 'Employee',   -- Employee|Crew Leader|Manager|Admin
  department text,
  pay_type   text not null default 'Hourly',     -- Hourly|Salary|Piecework
  pay_rate   numeric(10, 2),
  pay_unit   text not null default 'hr',          -- hr|yr|unit
  status     text not null default 'Active',      -- Active|Inactive
  hire_date  date,
  email      text,
  phone      text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, badge)
);

alter table public.employees enable row level security;

create policy "Org members can manage employees"
  on public.employees for all
  using  (org_id = my_org_id())
  with check (org_id = my_org_id());

create trigger employees_updated_at
  before update on public.employees
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- EMPLOYEE PINS (portal badge + PIN login)
-- No anon RLS — accessed only via service-role key in API routes.
-- ============================================================
create table public.employee_pins (
  employee_id uuid references public.employees on delete cascade primary key,
  pin_hash    text not null,    -- scrypt format: salt:hash
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.employee_pins enable row level security;

create policy "No anon access to pins"
  on public.employee_pins for all
  using (false);

-- ============================================================
-- SCHEDULE ENTRIES
-- ============================================================
create table public.schedule_entries (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid references public.organizations on delete cascade not null,
  employee_id uuid references public.employees on delete cascade not null,
  date        date not null,
  start_time  time,             -- null for full-day types (PTO, Vacation, Holiday)
  end_time    time,
  job_id      uuid references public.jobs on delete set null,
  type        text not null default 'Shift',   -- Shift|PTO|Vacation|Holiday
  notes       text,
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.schedule_entries enable row level security;

create policy "Org members can manage schedule entries"
  on public.schedule_entries for all
  using  (org_id = my_org_id())
  with check (org_id = my_org_id());

create trigger schedule_entries_updated_at
  before update on public.schedule_entries
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- TIME ENTRIES (clock-in / clock-out)
-- ============================================================
create table public.time_entries (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid references public.organizations on delete cascade not null,
  employee_id     uuid references public.employees on delete cascade not null,
  job_id          uuid references public.jobs on delete set null,
  clock_in        timestamptz not null default now(),
  clock_out       timestamptz,
  clock_in_lat    numeric(10, 7),
  clock_in_lng    numeric(10, 7),
  clock_out_lat   numeric(10, 7),
  clock_out_lng   numeric(10, 7),
  break_minutes   int not null default 0,
  notes           text,
  flagged         boolean not null default false,
  flag_reason     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.time_entries enable row level security;

create policy "Org members can manage time entries"
  on public.time_entries for all
  using  (org_id = my_org_id())
  with check (org_id = my_org_id());

create trigger time_entries_updated_at
  before update on public.time_entries
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- TIMESHEETS
-- ============================================================
create table public.timesheets (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid references public.organizations on delete cascade not null,
  employee_id    uuid references public.employees on delete cascade not null,
  period_start   date not null,
  period_end     date not null,
  regular_hours  numeric(8, 2) not null default 0,
  ot_hours       numeric(8, 2) not null default 0,
  total_cost     numeric(12, 2),
  status         text not null default 'pending',   -- pending|approved|locked
  manager_notes  text,
  approved_by    uuid references auth.users on delete set null,
  approved_at    timestamptz,
  locked_at      timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (org_id, employee_id, period_start)
);

alter table public.timesheets enable row level security;

create policy "Org members can manage timesheets"
  on public.timesheets for all
  using  (org_id = my_org_id())
  with check (org_id = my_org_id());

create trigger timesheets_updated_at
  before update on public.timesheets
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- PTO REQUESTS
-- ============================================================
create table public.pto_requests (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid references public.organizations on delete cascade not null,
  employee_id   uuid references public.employees on delete cascade not null,
  type          text not null,   -- PTO|Vacation|Holiday|Sick
  start_date    date not null,
  end_date      date not null,
  hours         numeric(6, 2),
  status        text not null default 'pending',   -- pending|approved|denied
  notes         text,
  manager_notes text,
  reviewed_by   uuid references auth.users on delete set null,
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.pto_requests enable row level security;

create policy "Org members can manage PTO requests"
  on public.pto_requests for all
  using  (org_id = my_org_id())
  with check (org_id = my_org_id());

create trigger pto_requests_updated_at
  before update on public.pto_requests
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- PAY RULES (per org)
-- ============================================================
create table public.pay_rules (
  org_id              uuid references public.organizations on delete cascade primary key,
  ot_threshold_weekly numeric(5, 2) not null default 40,
  ot_multiplier       numeric(4, 2) not null default 1.5,
  rounding_minutes    int not null default 0,
  break_enforcement   boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.pay_rules enable row level security;

create policy "Org members can manage pay rules"
  on public.pay_rules for all
  using  (org_id = my_org_id())
  with check (org_id = my_org_id());

create trigger pay_rules_updated_at
  before update on public.pay_rules
  for each row execute procedure public.set_updated_at();

-- Auto-create default pay_rules when a new org is created
create or replace function public.handle_new_organization()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.pay_rules (org_id)
  values (new.id)
  on conflict do nothing;
  return new;
end;
$$;

create trigger on_organization_created
  after insert on public.organizations
  for each row execute procedure public.handle_new_organization();

-- ============================================================
-- PARTNER ACCOUNTS
-- ============================================================
create table public.partner_accounts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users on delete cascade not null unique,
  company_name   text not null,
  tier           text not null default 'bronze',   -- bronze|silver|gold|platinum
  payout_method  text not null default 'ACH',
  payout_email   text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.partner_accounts enable row level security;

create policy "Partners can manage their own account"
  on public.partner_accounts for all
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

create trigger partner_accounts_updated_at
  before update on public.partner_accounts
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- PARTNER CLIENTS
-- ============================================================
create table public.partner_clients (
  id              uuid primary key default gen_random_uuid(),
  partner_id      uuid references public.partner_accounts on delete cascade not null,
  org_id          uuid references public.organizations on delete set null,
  company_name    text not null,
  contact_name    text,
  contact_email   text,
  industry        text,
  plan            text not null default 'free',
  status          text not null default 'trial',   -- trial|active|suspended
  mrr_cents       int not null default 0,
  trial_ends_at   timestamptz,
  provisioned_at  timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.partner_clients enable row level security;

create policy "Partners can manage their clients"
  on public.partner_clients for all
  using (
    partner_id in (
      select id from public.partner_accounts where user_id = auth.uid()
    )
  )
  with check (
    partner_id in (
      select id from public.partner_accounts where user_id = auth.uid()
    )
  );

create trigger partner_clients_updated_at
  before update on public.partner_clients
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- PARTNER INVOICES
-- ============================================================
create table public.partner_invoices (
  id             uuid primary key default gen_random_uuid(),
  partner_id     uuid references public.partner_accounts on delete cascade not null,
  period_start   date not null,
  period_end     date not null,
  client_count   int not null default 0,
  gross_cents    int not null default 0,
  partner_cents  int not null default 0,
  status         text not null default 'pending',   -- pending|paid|overdue
  issued_at      timestamptz not null default now(),
  due_at         timestamptz,
  paid_at        timestamptz,
  created_at     timestamptz not null default now()
);

alter table public.partner_invoices enable row level security;

create policy "Partners can view their invoices"
  on public.partner_invoices for select
  using (
    partner_id in (
      select id from public.partner_accounts where user_id = auth.uid()
    )
  );

-- ============================================================
-- REALTIME
-- Also toggle these on in: Dashboard > Database > Replication
-- ============================================================
alter publication supabase_realtime add table public.time_entries;
alter publication supabase_realtime add table public.schedule_entries;
alter publication supabase_realtime add table public.timesheets;
