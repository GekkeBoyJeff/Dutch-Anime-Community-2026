-- Fase 8 — web-push-abonnementen. Eén rij per browser/apparaat (endpoint uniek). De client schrijft/leest
-- alléén zijn eigen abonnementen; de send-push Edge Function leest ze met de service-role (bypasst RLS) om
-- te versturen. Geen audit-trigger: dit zijn vluchtige apparaat-tokens, geen audit-waardige records.
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
