-- Phase B — one editable draft "convention post" per event. The app generates a first version from
-- attendance/assignment data (thanking helpers and item contributors); staff polish it manually.
-- Internal draft storage only; publishing to the public site is out of scope.
create table public.event_posts (
	id           uuid primary key default gen_random_uuid(),
	event_id     uuid not null unique references public.events(id) on delete cascade,
	title        text not null default '',
	body         text not null default '',
	generated_at timestamptz,
	created_by   uuid default auth.uid(),
	created_at   timestamptz not null default now(),
	updated_at   timestamptz not null default now(),
	updated_by   uuid references auth.users(id)
);
create trigger set_updated_at before update on public.event_posts for each row execute function public.set_updated_at();
create trigger audit_event_posts after insert or update or delete on public.event_posts for each row execute function public.log_audit();

grant select, insert, update, delete on public.event_posts to authenticated, service_role;
alter table public.event_posts enable row level security;

-- Read/write of the draft follows the event editor: it runs on inventory.manage, the same
-- permission the events table itself uses for management.
create policy "event posts manage select" on public.event_posts for select to authenticated
	using ((select public.authorize('inventory.manage')));
create policy "event posts manage insert" on public.event_posts for insert to authenticated
	with check ((select public.authorize('inventory.manage')));
create policy "event posts manage update" on public.event_posts for update to authenticated
	using ((select public.authorize('inventory.manage'))) with check ((select public.authorize('inventory.manage')));

-- A draft is normally cleared, not deleted; real delete is admin-only, consistent with the
-- archive-vs-hard-delete discipline elsewhere.
create policy "event posts delete" on public.event_posts for delete to authenticated
	using ((select public.authorize('records.delete')));
