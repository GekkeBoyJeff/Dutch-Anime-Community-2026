-- Rechtenfundament: 18 → 28 permissies, user_permissions als enige bron van waarheid,
-- concept/gepubliceerd op pages+structures, admin-slot, gerichte sessie-revoke.
-- Spec: docs/superpowers/specs/2026-07-24-rechtenfundament-design.md

-- ============================================================================
-- A. Enum-swap + snapshots + sloop van alles dat aan het oude type hangt
-- ============================================================================
alter type public.app_permission rename to app_permission_old;

create type public.app_permission as enum (
  'pages.create', 'pages.edit', 'pages.delete', 'structures.edit',
  'media.upload', 'media.delete',
  'site.publish_staging', 'site.approve',
  'moderation.view', 'moderation.manage', 'roles.manage',
  'events.view', 'events.manage',
  'inventory.view', 'inventory.manage',
  'expenses.view', 'expenses.review',
  'finance.view', 'finance.manage',
  'staff.view', 'staff.manage',
  'surveys.manage', 'surveys.results',
  'notifications.send', 'notifications.manage',
  'logs.view', 'badges.manage', 'records.delete'
);

-- Snapshot existing per-user grants before the tables are rebuilt.
create temp table _old_grants as
  select user_id, permission::text as permission, granted_by from public.user_permissions;

-- Capture every policy whose expression calls authorize() so it can be rebuilt against the
-- new enum. pg_policies renders the FINAL expression (later migrations already folded in),
-- which also covers policies originally created via format() loops.
create temp table _pols as
  select schemaname, tablename, policyname, cmd, array_to_string(roles, ', ') as role_list, qual, with_check
  from pg_policies
  where coalesce(qual, '') like '%authorize(%' or coalesce(with_check, '') like '%authorize(%';

do $$
declare p record;
begin
  for p in select * from _pols loop
    execute format('drop policy %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end $$;

-- SQL-language functions are parse-bound to authorize(old type): drop, rebuild in section C.
drop function public.media_is_used(text);
drop function public.media_usage(text[]);
drop function public.list_notifiable_members();
drop function public.finance_rollup(date, date, uuid);
drop function public.survey_response_counts();
drop function public.staff_overview();
drop function public.team_candidates();
drop function public.my_permissions();
drop function public.authorize(public.app_permission_old);

drop table public.user_permissions;
drop table public.role_permissions;
drop type public.app_permission_old;

-- ============================================================================
-- B. Tabellen herbouwen + presets + materialisatie + kernfuncties
-- ============================================================================
create table public.role_permissions (
  id         uuid primary key default gen_random_uuid(),
  role       public.app_role not null,
  permission public.app_permission not null,
  unique (role, permission)
);

create table public.user_permissions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  permission public.app_permission not null,
  granted_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (user_id, permission)
);

grant select on public.role_permissions to authenticated;
grant select, insert, update, delete on public.user_permissions to authenticated;
alter table public.role_permissions enable row level security;
alter table public.user_permissions  enable row level security;

-- role_permissions is a preset template: read-only lookup, changes are migrations.
create policy "role_permissions read" on public.role_permissions for select to authenticated using (true);

-- New presets (spec §2). pages.delete / media.delete / site.approve: admin-only by design.
insert into public.role_permissions (role, permission) values
  ('stand-staff','inventory.view'), ('stand-staff','events.view'),
  ('stand-staff','expenses.view'),  ('stand-staff','staff.view'),
  ('author','pages.create'), ('author','pages.edit'), ('author','structures.edit'),
  ('author','media.upload'), ('author','site.publish_staging'),
  ('author','surveys.manage'), ('author','surveys.results'),
  ('yakuza','moderation.view'), ('yakuza','moderation.manage'),
  ('yakuza','events.view'), ('yakuza','events.manage'),
  ('yakuza','inventory.view'), ('yakuza','inventory.manage'),
  ('yakuza','expenses.view'), ('yakuza','expenses.review'),
  ('yakuza','finance.view'), ('yakuza','finance.manage'),
  ('yakuza','staff.view'), ('yakuza','staff.manage'),
  ('yakuza','surveys.manage'), ('yakuza','surveys.results'),
  ('yakuza','notifications.send'), ('yakuza','notifications.manage'),
  ('yakuza','badges.manage');
insert into public.role_permissions (role, permission)
  select 'admin', p from unnest(enum_range(null::public.app_permission)) as p;

-- Old individual grant → new permission(s); 1→N where a right was split.
create temp table _perm_map_grants (old text, new text);
insert into _perm_map_grants values
  ('pages.edit','pages.edit'), ('pages.edit','pages.create'),
  ('pages.delete','pages.delete'), ('structures.edit','structures.edit'),
  ('media.manage','media.upload'), ('media.manage','media.delete'),
  ('site.publish','site.publish_staging'), ('site.publish','site.approve'),
  ('moderation.view','moderation.view'), ('moderation.manage','moderation.manage'),
  ('roles.manage','roles.manage'),
  ('inventory.view','inventory.view'), ('inventory.view','events.view'),
  ('inventory.manage','inventory.manage'), ('inventory.manage','events.manage'),
  ('expenses.view','expenses.view'),
  ('expenses.manage','expenses.review'), ('expenses.manage','finance.view'), ('expenses.manage','finance.manage'),
  ('logs.view','logs.view'), ('badges.manage','badges.manage'), ('records.delete','records.delete'),
  ('notifications.send','notifications.send'), ('notifications.send','notifications.manage'),
  ('surveys.manage','surveys.manage'), ('surveys.manage','surveys.results'),
  ('staff.manage','staff.manage'), ('staff.manage','staff.view');

-- Materialise every user's effective set: NEW preset of their role ∪ translated old grants.
-- Existing authors deliberately lose delete/approve here (spec §8.3).
insert into public.user_permissions (user_id, permission, granted_by)
select user_id, permission, granted_by from (
  select ur.user_id, rp.permission, null::uuid as granted_by
  from public.user_roles ur
  join public.role_permissions rp on rp.role = ur.role
  union
  select og.user_id, m.new::public.app_permission, og.granted_by
  from _old_grants og
  join _perm_map_grants m on m.old = og.permission
) s
on conflict (user_id, permission) do nothing;

-- authorize()/my_permissions(): user_permissions is now the single source of truth.
create function public.authorize(requested_permission public.app_permission)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.user_permissions up
    where up.user_id = (select auth.uid()) and up.permission = requested_permission
  );
$$;

create function public.my_permissions()
returns setof public.app_permission language sql stable security definer set search_path = '' as $$
  select up.permission from public.user_permissions up
  where up.user_id = (select auth.uid());
$$;

grant execute on function public.authorize(public.app_permission) to authenticated;
grant execute on function public.my_permissions() to authenticated;
