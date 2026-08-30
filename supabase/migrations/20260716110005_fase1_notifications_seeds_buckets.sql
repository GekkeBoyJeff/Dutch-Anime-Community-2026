-- In-app notifications: only read/mark own rows. Writers are later-phase triggers/RPCs (SECURITY
-- DEFINER) — hence no client insert policy. Push/EF/pg_cron = phase 8. Realtime is already on.
create table public.notifications (
	id         uuid primary key default gen_random_uuid(),
	user_id    uuid not null references auth.users(id) on delete cascade,
	kind       text not null,
	title      text not null,
	body       text,
	payload    jsonb,
	read_at    timestamptz,
	created_at timestamptz not null default now()
);
create index notifications_user_unread on public.notifications (user_id, read_at);

grant select, update on public.notifications to authenticated;   -- update: only marking read_at
grant select, insert, update, delete on public.notifications to service_role;

alter table public.notifications enable row level security;
create policy "notifications own read" on public.notifications for select to authenticated using (user_id = (select auth.uid()));
create policy "notifications own update" on public.notifications for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

alter publication supabase_realtime add table public.notifications;

-- role_permissions seeds for the new permissions (per the seed table in the master plan).
insert into public.role_permissions (role, permission) values
	('admin', 'expenses.view'), ('admin', 'expenses.manage'), ('admin', 'logs.view'),
	('admin', 'badges.manage'), ('admin', 'records.delete'), ('admin', 'notifications.send'),
	('yakuza', 'expenses.view'), ('yakuza', 'expenses.manage'), ('yakuza', 'badges.manage'),
	('stand-staff', 'expenses.view')
on conflict (role, permission) do nothing;

-- service_role grants on the new tables (no auto-grants since 2026-04-28).
grant select, insert, update, delete on
	public.audit_log, public.activity_log, public.notifications
to service_role;

-- Bucket hardening: there was previously no server-side limit.
update storage.buckets set file_size_limit = 10485760, allowed_mime_types = array['application/pdf']
	where id = 'tickets';
update storage.buckets set file_size_limit = 10485760, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
	where id = 'mod-evidence';
