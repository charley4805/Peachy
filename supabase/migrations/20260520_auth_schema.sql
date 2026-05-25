-- ============================================================
-- Daily — Auth & Onboarding Schema
-- Run this in the Supabase SQL editor (Dashboard > SQL Editor)
-- ============================================================

-- BEFORE running this SQL, also do the following in the Supabase dashboard:
--   1. Authentication > Providers > Enable Google (add OAuth credentials)
--   2. Authentication > URL Configuration > set Site URL to your Vercel domain
--      and add https://yourdomain.com/auth/callback to Redirect URLs
--   3. Authentication > Email > enable "Confirm email"
--   4. Storage > New bucket > name: "avatars", Public: true

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id              uuid references auth.users on delete cascade primary key,
  first_name      text,
  last_name       text,
  avatar_url      text,
  job_title       text,
  phone           text,
  company_name    text,
  industry        text,
  onboarding_complete boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile row on signup (captures Google name too)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', split_part(new.raw_user_meta_data->>'full_name', ' ', 1)),
    coalesce(new.raw_user_meta_data->>'last_name',  split_part(new.raw_user_meta_data->>'full_name', ' ', 2)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Keep updated_at current
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- CONSENT RECORDS (GDPR)
-- ============================================================
create table public.consent_records (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users on delete cascade not null,
  consent_type text not null,   -- 'terms' | 'privacy' | 'marketing'
  consented    boolean not null,
  ip_address   text,
  user_agent   text,
  consented_at timestamptz not null default now()
);

alter table public.consent_records enable row level security;

create policy "Users can read own consent records"
  on public.consent_records for select
  using (auth.uid() = user_id);

create policy "Users can insert own consent records"
  on public.consent_records for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- USER SERVICES (onboarding selection)
-- ============================================================
create table public.user_services (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users on delete cascade not null,
  service_slug text not null,
  enabled_at  timestamptz not null default now(),
  unique (user_id, service_slug)
);

alter table public.user_services enable row level security;

create policy "Users can read own services"
  on public.user_services for select
  using (auth.uid() = user_id);

create policy "Users can manage own services"
  on public.user_services for all
  using (auth.uid() = user_id);

-- ============================================================
-- AUDIT LOG (SOC 2 / ISO 27001 evidence)
-- No UPDATE or DELETE policies — append-only by design
-- ============================================================
create table public.audit_log (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users on delete set null,
  action     text not null,
  ip_address text,
  user_agent text,
  metadata   jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_log enable row level security;

create policy "Users can insert own audit events"
  on public.audit_log for insert
  with check (auth.uid() = user_id);
