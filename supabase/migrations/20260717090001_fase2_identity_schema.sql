-- Fase 2 — identiteitsschema (VEILIG: additief, geen auth.users-triggers en geen login-flow-wijziging).
-- discord_id is de onveranderlijke koppelsleutel (usernames wijzigen, het ID nooit).
alter table public.profiles
	add column if not exists discord_id        text unique,
	add column if not exists global_name       text,
	add column if not exists guild_nick        text,
	add column if not exists guild_roles       jsonb,
	add column if not exists guild_joined_at   timestamptz,
	add column if not exists synced_at         timestamptz,
	add column if not exists terms_accepted_at timestamptz,
	add column if not exists terms_version     text;

-- Username-historie voor echte accounts.
create table if not exists public.profile_name_history (
	id         bigint generated always as identity primary key,
	user_id    uuid not null references auth.users(id) on delete cascade,
	old_name   text,
	new_name   text,
	changed_at timestamptz not null default now()
);
create index if not exists profile_name_history_user on public.profile_name_history (user_id, changed_at);

-- Alias-/usernamehistorie voor (schaduw)profielen.
create table if not exists public.mod_subject_aliases (
	id         bigint generated always as identity primary key,
	subject_id uuid not null references public.mod_subjects(id) on delete cascade,
	alias      text not null,
	kind       text,
	source     text,
	first_seen timestamptz not null default now(),
	last_seen  timestamptz not null default now(),
	unique (subject_id, alias)
);

-- Eén subject per user: auto-provision (fase 2 Task 2) mag niet twee subjects aan één user hangen.
create unique index if not exists mod_subjects_user_uniq on public.mod_subjects (user_id) where user_id is not null;

-- Self-read op het eigen subject (nodig voor "mijn conventie"/inschrijven in fase 3).
drop policy if exists "mod_subjects self read" on public.mod_subjects;
create policy "mod_subjects self read" on public.mod_subjects for select to authenticated using (user_id = (select auth.uid()));

-- profiles read: ook inventory.manage (iemand met alléén die grant zag anders een lege PersonPicker).
drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles for select to authenticated
	using (
		id = (select auth.uid())
		or (select public.authorize('roles.manage'))
		or (select public.authorize('moderation.view'))
		or (select public.authorize('logs.view'))
		or (select public.authorize('inventory.manage'))
	);

-- subject_names: id + weergavenaam + avatar voor iedere authenticated, zodat lijsten (agenda, aanwezigheid)
-- namen tonen zonder de afgeschermde mod_*-velden te lekken. Owner-view (security_invoker=false) met
-- kolom-subset; Supabase-linterwaarschuwing bewust geaccepteerd. Prioriteit: guild_nick → global_name →
-- username → discord_name.
create or replace view public.subject_names
with (security_invoker = false) as
	select s.id,
		coalesce(p.guild_nick, p.global_name, p.username, s.discord_name, left(s.id::text, 8)) as display_name,
		p.avatar_url
	from public.mod_subjects s
	left join public.profiles p on p.id = s.user_id;

grant select on public.subject_names to authenticated;

-- Grants + RLS op de nieuwe tabellen.
grant select on public.profile_name_history to authenticated;
grant select, insert, update, delete on public.profile_name_history to service_role;
grant select on public.mod_subject_aliases to authenticated;
grant select, insert, update, delete on public.mod_subject_aliases to service_role;

alter table public.profile_name_history enable row level security;
alter table public.mod_subject_aliases  enable row level security;
create policy "name history own read" on public.profile_name_history for select to authenticated
	using (user_id = (select auth.uid()) or (select public.authorize('moderation.view')));
create policy "subject aliases mod read" on public.mod_subject_aliases for select to authenticated
	using ((select public.authorize('moderation.view')));
