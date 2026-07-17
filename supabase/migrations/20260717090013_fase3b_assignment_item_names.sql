-- Fase 3b — itemnamen voor de eigen toewijzingen (ook community-/andermans items). inventory.view mag
-- via RLS alleen eigen inventory_items lezen; deze SECURITY DEFINER-RPC geeft de namen van de items die
-- aan de beller zijn toegewezen, zodat "Mijn conventie" de mee-te-nemen items met naam kan tonen.
create or replace function public.my_assignment_item_names()
returns table (item_id uuid, name text)
language sql stable security definer set search_path = '' as $$
	select distinct i.id, i.name
	from public.event_item_assignments a
	join public.inventory_items i on i.id = a.item_id
	where a.assigned_user_id = (select auth.uid());
$$;
grant execute on function public.my_assignment_item_names() to authenticated;
