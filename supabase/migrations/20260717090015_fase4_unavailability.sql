-- Phase 4 — unavailability windows + yakuza request flow. Effective availability = inventory_items.available
-- AND no ACTIVE window on that date. If the item is relied on for an event, a window becomes a REQUEST
-- (yakuza decides); otherwise it's active immediately. Stand-staff always goes through the RPC.

alter table public.inventory_history add column if not exists kind public.inventory_history_kind not null default 'note';

create table public.item_unavailability (
	id           uuid primary key default gen_random_uuid(),
	item_id      uuid not null references public.inventory_items(id) on delete cascade,
	starts_on    date not null,
	ends_on      date,                                   -- null = indefinite
	reason       text,
	status       public.unavailability_status not null default 'active',
	requested_by uuid references auth.users(id),
	decided_by   uuid references auth.users(id),
	decided_at   timestamptz,
	created_at   timestamptz not null default now(),
	constraint item_unavailability_dates_chk check (ends_on is null or ends_on >= starts_on)
);
create trigger audit_item_unavailability after insert or update or delete on public.item_unavailability for each row execute function public.log_audit();
grant select, insert, update, delete on public.item_unavailability to authenticated, service_role;
alter table public.item_unavailability enable row level security;

-- Read: inventory.view. Direct writes (incl. delete): inventory.manage; stand-staff goes through the RPC.
create policy "unavail read" on public.item_unavailability for select to authenticated using ((select public.authorize('inventory.view')));
create policy "unavail manage" on public.item_unavailability for all to authenticated
	using ((select public.authorize('inventory.manage'))) with check ((select public.authorize('inventory.manage')));

-- Request/create: overlap with an event this item is assigned to → status 'requested' (yakuza decides),
-- otherwise 'active' immediately. SECURITY DEFINER so a view-holder (stand-staff) can create it.
create or replace function public.request_item_unavailability(p_item uuid, p_starts date, p_ends date, p_reason text)
returns public.item_unavailability
language plpgsql security definer set search_path = '' as $$
declare
	has_overlap boolean;
	item_name   text;
	new_status  public.unavailability_status;
	row         public.item_unavailability;
begin
	if not (select public.authorize('inventory.view')) then
		raise exception 'inventory.view vereist';
	end if;

	select exists (
		select 1
		from public.event_item_assignments a
		join public.events e on e.id = a.event_id
		where a.item_id = p_item
			and e.starts_on is not null
			and e.starts_on <= coalesce(p_ends, 'infinity'::date)
			and coalesce(e.ends_on, e.starts_on) >= p_starts
	) into has_overlap;

	new_status := (case when has_overlap then 'requested' else 'active' end)::public.unavailability_status;

	insert into public.item_unavailability (item_id, starts_on, ends_on, reason, status, requested_by)
	values (p_item, p_starts, p_ends, p_reason, new_status, (select auth.uid()))
	returning * into row;

	if has_overlap then
		select i.name into item_name from public.inventory_items i where i.id = p_item;
		insert into public.activity_log (kind, actor_id, item_id, summary)
		values ('item.unavailability_requested', (select auth.uid()), p_item,
			format('Onbeschikbaarheid aangevraagd voor "%s" (er wordt op gerekend)', coalesce(item_name, '—')));
	end if;

	return row;
end;
$$;
grant execute on function public.request_item_unavailability(uuid, date, date, text) to authenticated;

-- Yakuza decides on a request.
create or replace function public.decide_item_unavailability(p_id uuid, p_approve boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare
	rec       public.item_unavailability;
	item_name text;
begin
	if not (select public.authorize('inventory.manage')) then
		raise exception 'inventory.manage vereist';
	end if;
	select * into rec from public.item_unavailability where id = p_id for update;
	if rec.id is null then raise exception 'verzoek niet gevonden'; end if;
	if rec.status <> 'requested' then raise exception 'verzoek is al afgehandeld'; end if;

	update public.item_unavailability
		set status = (case when p_approve then 'active' else 'rejected' end)::public.unavailability_status,
			decided_by = (select auth.uid()),
			decided_at = now()
		where id = p_id;

	select i.name into item_name from public.inventory_items i where i.id = rec.item_id;
	insert into public.activity_log (kind, actor_id, item_id, summary)
	values ('item.unavailability_decided', (select auth.uid()), rec.item_id,
		format('Onbeschikbaarheid voor "%s" %s', coalesce(item_name, '—'), case when p_approve then 'goedgekeurd' else 'afgewezen' end));
end;
$$;
grant execute on function public.decide_item_unavailability(uuid, boolean) to authenticated;

-- Effective availability of an item on a date.
create or replace function public.item_available_on(p_item uuid, p_date date)
returns boolean language sql stable security definer set search_path = '' as $$
	select coalesce((select i.available from public.inventory_items i where i.id = p_item), false)
		and not exists (
			select 1 from public.item_unavailability u
			where u.item_id = p_item and u.status = 'active'
				and u.starts_on <= p_date and (u.ends_on is null or u.ends_on >= p_date)
		);
$$;
grant execute on function public.item_available_on(uuid, date) to authenticated;
