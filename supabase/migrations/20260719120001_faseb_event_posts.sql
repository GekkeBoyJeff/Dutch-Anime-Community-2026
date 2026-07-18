-- Fase B — conventie-post per editie: één bewerkbaar concept per event. De eerste versie wordt in de
-- app gegenereerd uit de aanwezigheids-/toewijzingsdata (bedankt helpers en item-brengers); daarna
-- handmatig bijgeschaafd. Interne concept-opslag; publiceren naar de publieke site valt buiten scope.
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

-- Lezen/schrijven van het concept volgt de event-editor: die draait op inventory.manage, dezelfde
-- permissie die de events-tabel zelf voor beheer gebruikt.
create policy "event posts manage select" on public.event_posts for select to authenticated
	using ((select public.authorize('inventory.manage')));
create policy "event posts manage insert" on public.event_posts for insert to authenticated
	with check ((select public.authorize('inventory.manage')));
create policy "event posts manage update" on public.event_posts for update to authenticated
	using ((select public.authorize('inventory.manage'))) with check ((select public.authorize('inventory.manage')));

-- Een concept wordt normaal geleegd, niet verwijderd; echte delete is admin-only, consistent met de
-- archiveer-vs-harddelete-discipline elders.
create policy "event posts delete" on public.event_posts for delete to authenticated
	using ((select public.authorize('records.delete')));
