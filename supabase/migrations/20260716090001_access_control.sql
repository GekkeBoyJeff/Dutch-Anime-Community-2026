-- Roles are permission bundles; per-user grants layer on top. Effective = role ∪ user grants.
create type public.app_role as enum ('user', 'author', 'yakuza', 'admin');
create type public.app_permission as enum (
  'pages.edit', 'pages.delete', 'structures.edit', 'media.manage', 'site.publish',
  'moderation.view', 'moderation.manage', 'roles.manage'
);

create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text,
  avatar_url text,
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique references auth.users(id) on delete cascade,
  role       public.app_role not null default 'user',
  created_at timestamptz not null default now()
);

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

-- authorize(): true if the caller's role bundle OR a per-user grant contains the permission.
-- SECURITY DEFINER so it reads the tables regardless of the caller's RLS; only ever reports on the
-- caller's own access, so it is not an escalation surface. search_path='' → fully-qualify everything.
create or replace function public.authorize(requested_permission public.app_permission)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.user_roles ur
    join public.role_permissions rp on rp.role = ur.role
    where ur.user_id = (select auth.uid()) and rp.permission = requested_permission
  ) or exists (
    select 1 from public.user_permissions up
    where up.user_id = (select auth.uid()) and up.permission = requested_permission
  );
$$;

-- my_permissions(): the caller's effective permission set, for client-side UI gating.
create or replace function public.my_permissions()
returns setof public.app_permission language sql stable security definer set search_path = '' as $$
  select rp.permission from public.user_roles ur
    join public.role_permissions rp on rp.role = ur.role
    where ur.user_id = (select auth.uid())
  union
  select up.permission from public.user_permissions up
    where up.user_id = (select auth.uid());
$$;

grant execute on function public.authorize(public.app_permission) to authenticated;
grant execute on function public.my_permissions() to authenticated;

-- Auto-provision a profile + default 'user' role for every new account.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'user_name'),
    new.raw_user_meta_data ->> 'avatar_url'
  ) on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'user')
    on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Data API exposure (new public tables are not auto-exposed since 2026-04-28).
grant usage on schema public to authenticated;
grant select on public.role_permissions to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.user_roles to authenticated;
grant select, insert, update, delete on public.user_permissions to authenticated;

alter table public.profiles         enable row level security;
alter table public.user_roles       enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_permissions enable row level security;

-- profiles: own row always; managers/mods may read all (dashboard needs to show who's who).
create policy "profiles read" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.authorize('roles.manage')) or (select public.authorize('moderation.view')));
create policy "profiles self update" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- user_roles / user_permissions: own row readable; managing requires roles.manage AND a target
-- other than yourself (no self-escalation — the first admin is bootstrapped via service-role SQL).
create policy "user_roles read" on public.user_roles for select to authenticated
  using (user_id = (select auth.uid()) or (select public.authorize('roles.manage')));
create policy "user_roles insert" on public.user_roles for insert to authenticated
  with check ((select public.authorize('roles.manage')) and user_id <> (select auth.uid()));
create policy "user_roles update" on public.user_roles for update to authenticated
  using ((select public.authorize('roles.manage')) and user_id <> (select auth.uid()))
  with check ((select public.authorize('roles.manage')) and user_id <> (select auth.uid()));
create policy "user_roles delete" on public.user_roles for delete to authenticated
  using ((select public.authorize('roles.manage')) and user_id <> (select auth.uid()));

create policy "user_permissions read" on public.user_permissions for select to authenticated
  using (user_id = (select auth.uid()) or (select public.authorize('roles.manage')));
create policy "user_permissions insert" on public.user_permissions for insert to authenticated
  with check ((select public.authorize('roles.manage')) and user_id <> (select auth.uid()));
create policy "user_permissions update" on public.user_permissions for update to authenticated
  using ((select public.authorize('roles.manage')) and user_id <> (select auth.uid()))
  with check ((select public.authorize('roles.manage')) and user_id <> (select auth.uid()));
create policy "user_permissions delete" on public.user_permissions for delete to authenticated
  using ((select public.authorize('roles.manage')) and user_id <> (select auth.uid()));

-- role_permissions: read-only lookup for authenticated; changes are migrations.
create policy "role_permissions read" on public.role_permissions for select to authenticated using (true);

insert into public.role_permissions (role, permission) values
  ('admin','pages.edit'),('admin','pages.delete'),('admin','structures.edit'),('admin','media.manage'),
  ('admin','site.publish'),('admin','moderation.view'),('admin','moderation.manage'),('admin','roles.manage'),
  ('author','pages.edit'),('author','pages.delete'),('author','structures.edit'),('author','media.manage'),('author','site.publish'),
  ('yakuza','moderation.view'),('yakuza','moderation.manage')
on conflict (role, permission) do nothing;
