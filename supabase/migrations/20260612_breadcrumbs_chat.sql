-- ============================================================
-- Daily — Location Breadcrumbs & Chat Privacy
-- Run this in Supabase Dashboard > SQL Editor
-- REQUIRES: 20260611_employee_accounts.sql already applied
--
-- Adds:
--   1. location_pings — GPS breadcrumbs recorded while an employee
--      is on the clock (written server-side only)
--   2. Tighter message visibility for employees: coworker DMs
--      ('edm:{idA}:{idB}') are only visible to the two participants,
--      and 'dm:{employee_id}' threads only to that employee.
-- ============================================================

-- ============================================================
-- LOCATION PINGS (breadcrumbing)
-- ============================================================
create table public.location_pings (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid references public.organizations on delete cascade not null,
  employee_id   uuid references public.employees on delete cascade not null,
  time_entry_id uuid references public.time_entries on delete cascade,
  latitude      numeric(10, 7) not null,
  longitude     numeric(10, 7) not null,
  accuracy_m    numeric(8, 2),
  recorded_at   timestamptz not null default now()
);

create index location_pings_employee_idx
  on public.location_pings (org_id, employee_id, recorded_at desc);

alter table public.location_pings enable row level security;

-- Managers can review breadcrumbs; employees can see their own trail.
-- Inserts happen only via the service-role key (server API), so no
-- insert policy is needed.
create policy "Org members can view location pings"
  on public.location_pings for select
  using (org_id = my_org_id());

create policy "Employees can view their own pings"
  on public.location_pings for select
  using (employee_id = my_employee_id());

-- ============================================================
-- MESSAGES: restrict employee visibility per channel
-- Replaces the blanket org-wide read from 20260611.
-- Channels:
--   announcements        — everyone in the org
--   job:{job_id}         — everyone in the org (crew chat)
--   dm:{employee_id}     — that employee + management
--   edm:{idA}:{idB}      — the two employees in the pair (sorted ids)
-- ============================================================
drop policy "Employees can view org messages" on public.messages;

create policy "Employees can view permitted org messages"
  on public.messages for select
  using (
    org_id = my_employee_org_id()
    and (
      channel = 'announcements'
      or channel like 'job:%'
      or channel = 'dm:' || my_employee_id()::text
      or (
        channel like 'edm:%'
        and position(my_employee_id()::text in channel) > 0
      )
    )
  );
