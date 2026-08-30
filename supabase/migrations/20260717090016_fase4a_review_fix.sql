-- Phase 4a review-fix (HIGH): request_item_unavailability had no ownership check — any inventory.view
-- holder could mark any item unavailable, and without overlap it went straight to 'active' (no yakuza
-- approval). Now only the owner can go straight to 'active', and only without overlap; everything else
-- becomes a 'requested' window that yakuza decides on.
create or replace function public.request_item_unavailability(p_item uuid, p_starts date, p_ends date, p_reason text)
returns public.item_unavailability
language plpgsql security definer set search_path = '' as $$
declare
	has_overlap boolean;
	is_owner    boolean;
	item_name   text;
	new_status  public.unavailability_status;
	row         public.item_unavailability;
begin
	if not (select public.authorize('inventory.view')) then
		raise exception 'inventory.view vereist';
	end if;

	select (i.owner_user_id = (select auth.uid())), i.name into is_owner, item_name
	from public.inventory_items i where i.id = p_item;
	if not found then
		raise exception 'item niet gevonden';
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

	-- Only the owner can go straight to active, and only without overlap; anything else is a request.
	new_status := (case when has_overlap or not coalesce(is_owner, false) then 'requested' else 'active' end)::public.unavailability_status;

	insert into public.item_unavailability (item_id, starts_on, ends_on, reason, status, requested_by)
	values (p_item, p_starts, p_ends, p_reason, new_status, (select auth.uid()))
	returning * into row;

	insert into public.activity_log (kind, actor_id, item_id, summary)
	values (
		case when new_status = 'requested' then 'item.unavailability_requested' else 'item.unavailability_set' end,
		(select auth.uid()),
		p_item,
		case when new_status = 'requested'
			then format('Onbeschikbaarheid aangevraagd voor "%s"', coalesce(item_name, '—'))
			else format('"%s" op onbeschikbaar gezet', coalesce(item_name, '—'))
		end
	);

	return row;
end;
$$;
grant execute on function public.request_item_unavailability(uuid, date, date, text) to authenticated;
