-- Phase 8 — web push subscriptions. One row per browser/device (endpoint unique). The client only
-- writes/reads its own subscriptions; the send-push Edge Function reads them via service-role
-- (bypasses RLS) to deliver. No audit trigger: these are transient device tokens, not audit-worthy.
create table public.push_subscriptions (
	id         uuid primary key default gen_random_uuid(),
	user_id    uuid not null references auth.users(id) on delete cascade,
	endpoint   text not null unique,
	p256dh     text not null,
	auth       text not null,
	created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.push_subscriptions to authenticated, service_role;
alter table public.push_subscriptions enable row level security;
create policy "push subs own" on public.push_subscriptions for all to authenticated
	using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
