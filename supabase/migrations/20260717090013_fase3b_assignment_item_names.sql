-- Phase 3b — item names for the caller's own assignments (including community/others' items).
-- inventory.view can only read own inventory_items via RLS; this SECURITY DEFINER RPC returns the
-- names of items assigned to the caller, so "My convention" can list what to bring by name.
create or replace function public.my_assignment_item_names()
returns table (item_id uuid, name text)
language sql stable security definer set search_path = '' as $$
	select distinct i.id, i.name
	from public.event_item_assignments a
	join public.inventory_items i on i.id = a.item_id
	where a.assigned_user_id = (select auth.uid());
$$;
grant execute on function public.my_assignment_item_names() to authenticated;
