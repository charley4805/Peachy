-- ============================================================
-- Daily — Employee Accounts & Self-Service
-- Run this in Supabase Dashboard > SQL Editor
-- REQUIRES: 20260526_messages.sql already applied
--
-- Adds:
--   1. employees.user_id      — links an employee to a real auth.users
--                               account (created via invite link)
--   2. employees.invite_token — one-time token for the invite link
--   3. employees.pto_allowance_hours — annual PTO allowance
--   4. my_employee_id() / my_employee_org_id() helpers
--   5. Read-only RLS policies so employees can view their own
--      data (and org messages, for realtime chat).
--      All employee WRITES go through server API routes that use
--      the service-role key — so employees can never edit their
--      own pay rate, time entries, etc. directly.
-- ============================================================

-- ============================================================
-- EMPLOYEES: account link + invite token + PTO allowance
-- ============================================================
alter table public.employees
  add column user_id             uuid references auth.users on delete set null,
  add column invite_token        text,
  add column invite_sent_at      timestamptz,
  add column invite_accepted_at  timestamptz,
  add column pto_allowance_hours numeric(6, 2) not null default 0;

-- One auth account can only ever be one employee, and tokens are unique
create unique index employees_user_id_key
  on public.employees (user_id) where user_id is not null;

create unique index employees_invite_token_key
  on public.employees (invite_token) where invite_token is not null;

-- ============================================================
-- HELPERS: current user's employee record / org
-- SECURITY DEFINER bypasses RLS when reading employees.
-- ============================================================
create or replace function public.my_employee_id()
returns uuid
language sql stable
security definer
set search_path = public
as $$
  select id
  from   public.employees
  where  user_id = auth.uid()
    and  status  = 'Active'
  limit  1
$$;

create or replace function public.my_employee_org_id()
returns uuid
language sql stable
security definer
set search_path = public
as $$
  select org_id
  from   public.employees
  where  user_id = auth.uid()
    and  status  = 'Active'
  limit  1
$$;

-- ============================================================
-- RLS: employee self-access (SELECT only)
-- ============================================================

-- Own employee record (also used by proxy to route /auth → /employee)
create policy "Employees can view their own record"
  on public.employees for select
  using (user_id = auth.uid());

create policy "Employees can view their organization"
  on public.organizations for select
  using (id = my_employee_org_id());

create policy "Employees can view their own schedule"
  on public.schedule_entries for select
  using (employee_id = my_employee_id());

create policy "Employees can view their own time entries"
  on public.time_entries for select
  using (employee_id = my_employee_id());

create policy "Employees can view their own timesheets"
  on public.timesheets for select
  using (employee_id = my_employee_id());

create policy "Employees can view their own PTO requests"
  on public.pto_requests for select
  using (employee_id = my_employee_id());

-- Org jobs (needed to pick a job when clocking in / job chat channels)
create policy "Employees can view org jobs"
  on public.jobs for select
  using (org_id = my_employee_org_id());

-- Org messages (needed for realtime chat subscriptions)
create policy "Employees can view org messages"
  on public.messages for select
  using (org_id = my_employee_org_id());
