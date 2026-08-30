-- Inventory + conventions module.
--   inventory.manage (admin, yakuza) → full CRUD on everything.
--   inventory.view (stand-staff; grantable per-user) → CRUD on their OWN items + read-only on what is
--   assigned to them (items to bring, tickets) and the history of their own items. Convention rows
--   themselves are readable reference data for any view-holder.
-- Owner / assignee = a DB user when possible (assigned_user_id), with a free-text fallback label.

create table public.inventory_items (
	id            uuid primary key default gen_random_uuid(),
	name          text not null,
	owner_user_id uuid references auth.users(id) on delete set null,
	owner_label   text,
	quantity      int not null default 1,
	value_eur     numeric(10, 2),
	available     boolean not null default true,
	notes         text,
	created_by    uuid references auth.users(id),
	created_at    timestamptz not null default now(),
	updated_at    timestamptz not null default now()
);

create table public.events (
	id         uuid primary key default gen_random_uuid(),
	name       text not null,
	location   text,
	starts_on  date,
	ends_on    date,
	notes      text,
	created_by uuid references auth.users(id),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table public.event_item_assignments (
	id                uuid primary key default gen_random_uuid(),
	event_id          uuid not null references public.events(id) on delete cascade,
	item_id           uuid not null references public.inventory_items(id) on delete cascade,
	assigned_user_id  uuid references auth.users(id) on delete set null,
	assigned_label    text,
	quantity          int not null default 1,
	expected_to_bring boolean not null default true,
	notes             text,
	created_by        uuid references auth.users(id),
	created_at        timestamptz not null default now()
);

create table public.event_tickets (
	id               uuid primary key default gen_random_uuid(),
	event_id         uuid not null references public.events(id) on delete cascade,
	day              date,
	assigned_user_id uuid references auth.users(id) on delete set null,
	assigned_label   text,
	quantity         int not null default 1,
	ticket_pdf_path  text,          -- object in the private `tickets` bucket, path <user_id>/<file>.pdf
	note             text,          -- NO default: UI shows the wristband note only when no PDF and no note
	created_by       uuid references auth.users(id),
	created_at       timestamptz not null default now()
);

create table public.inventory_history (
	id          uuid primary key default gen_random_uuid(),
	item_id     uuid not null references public.inventory_items(id) on delete cascade,
	event_id    uuid references public.events(id) on delete set null,
	taken_on    date not null default current_date,
	recorded_by uuid references auth.users(id),
	note        text,
	created_at  timestamptz not null default now()
);

insert into public.role_permissions (role, permission) values
	('admin', 'inventory.manage'), ('admin', 'inventory.view'),
	('yakuza', 'inventory.manage'), ('yakuza', 'inventory.view'),
	('stand-staff', 'inventory.view')
on conflict (role, permission) do nothing;

grant select, insert, update, delete on
	public.inventory_items, public.events, public.event_item_assignments, public.event_tickets, public.inventory_history
to authenticated, service_role;

alter table public.inventory_items        enable row level security;
alter table public.events                 enable row level security;
alter table public.event_item_assignments enable row level security;
alter table public.event_tickets          enable row level security;
alter table public.inventory_history      enable row level security;

-- inventory_items: managers do everything; view-holders CRUD only their own items.
create policy "inv items manage" on public.inventory_items for all to authenticated
	using ((select public.authorize('inventory.manage'))) with check ((select public.authorize('inventory.manage')));
create policy "inv items own select" on public.inventory_items for select to authenticated
	using ((select public.authorize('inventory.view')) and owner_user_id = (select auth.uid()));
create policy "inv items own insert" on public.inventory_items for insert to authenticated
	with check ((select public.authorize('inventory.view')) and owner_user_id = (select auth.uid()));
create policy "inv items own update" on public.inventory_items for update to authenticated
	using ((select public.authorize('inventory.view')) and owner_user_id = (select auth.uid()))
	with check ((select public.authorize('inventory.view')) and owner_user_id = (select auth.uid()));
create policy "inv items own delete" on public.inventory_items for delete to authenticated
	using ((select public.authorize('inventory.view')) and owner_user_id = (select auth.uid()));

-- events: managers manage; view-holders read (reference data for their assignments/tickets).
create policy "events manage" on public.events for all to authenticated
	using ((select public.authorize('inventory.manage'))) with check ((select public.authorize('inventory.manage')));
create policy "events view read" on public.events for select to authenticated
	using ((select public.authorize('inventory.view')));

-- assignments: managers manage; view-holders read what is assigned to them.
create policy "assignments manage" on public.event_item_assignments for all to authenticated
	using ((select public.authorize('inventory.manage'))) with check ((select public.authorize('inventory.manage')));
create policy "assignments own read" on public.event_item_assignments for select to authenticated
	using ((select public.authorize('inventory.view')) and assigned_user_id = (select auth.uid()));

-- tickets: managers manage; view-holders read their own.
create policy "tickets manage" on public.event_tickets for all to authenticated
	using ((select public.authorize('inventory.manage'))) with check ((select public.authorize('inventory.manage')));
create policy "tickets own read" on public.event_tickets for select to authenticated
	using ((select public.authorize('inventory.view')) and assigned_user_id = (select auth.uid()));

-- history: managers manage; view-holders read the history of items they own.
create policy "history manage" on public.inventory_history for all to authenticated
	using ((select public.authorize('inventory.manage'))) with check ((select public.authorize('inventory.manage')));
create policy "history own read" on public.inventory_history for select to authenticated
	using (
		(select public.authorize('inventory.view'))
		and exists (
			select 1 from public.inventory_items i
			where i.id = inventory_history.item_id and i.owner_user_id = (select auth.uid())
		)
	);

-- Private ticket-PDF bucket. Path convention: <assigned_user_id>/<file>.pdf, so an assignee can read
-- their own folder; managers read/write everything.
insert into storage.buckets (id, name, public) values ('tickets', 'tickets', false) on conflict (id) do nothing;
create policy "tickets pdf write"  on storage.objects for insert to authenticated with check (bucket_id = 'tickets' and (select public.authorize('inventory.manage')));
create policy "tickets pdf update" on storage.objects for update to authenticated using (bucket_id = 'tickets' and (select public.authorize('inventory.manage'))) with check (bucket_id = 'tickets' and (select public.authorize('inventory.manage')));
create policy "tickets pdf delete" on storage.objects for delete to authenticated using (bucket_id = 'tickets' and (select public.authorize('inventory.manage')));
create policy "tickets pdf read"   on storage.objects for select to authenticated using (bucket_id = 'tickets' and ((select public.authorize('inventory.manage')) or (storage.foldername(name))[1] = (select auth.uid())::text));
