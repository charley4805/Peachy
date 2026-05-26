-- ============================================================
-- Daily — Messages Schema
-- REQUIRES: 20260525_core_schema.sql already applied
-- ============================================================

create table public.messages (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid references public.organizations on delete cascade not null,
  channel      text not null,  -- 'announcements' | 'job:{job_id}' | 'dm:{employee_id}'
  sender_type  text not null default 'admin', -- 'admin' | 'employee'
  sender_id    uuid,           -- auth.users.id (admin) or employees.id (employee)
  sender_name  text not null,
  body         text not null,
  created_at   timestamptz not null default now()
);

create index messages_org_channel_idx on public.messages (org_id, channel, created_at desc);

alter table public.messages enable row level security;

create policy "Org members can manage messages"
  on public.messages for all
  using  (org_id = my_org_id())
  with check (org_id = my_org_id());

-- Enable realtime for live chat
alter publication supabase_realtime add table public.messages;
