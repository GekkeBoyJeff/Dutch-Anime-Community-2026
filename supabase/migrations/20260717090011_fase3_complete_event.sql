-- Fase 3 — "event afronden": aanwezigheid definitief maken, shifts locken, per toewijzing een
-- inventory_history-regel, en een leesbare activity_log-regel. inventory.manage-only.
create or replace function public.complete_event(target_event uuid, present_subjects uuid[])
returns void language plpgsql security definer set search_path = '' as $$
begin
	if not (select public.authorize('inventory.manage')) then
		raise exception 'inventory.manage vereist';
	end if;

	update public.event_attendance set status = 'present'
		where event_id = target_event and subject_id = any(present_subjects) and status in ('signed_up', 'expected', 'late');
	update public.event_attendance set status = 'no_show'
		where event_id = target_event and status in ('signed_up', 'expected') and not (subject_id = any(present_subjects));

	update public.event_shifts set locked_at = now() where event_id = target_event and locked_at is null;

	insert into public.inventory_history (item_id, event_id, note, recorded_by)
		select a.item_id, a.event_id, 'Event afgerond', (select auth.uid())
		from public.event_item_assignments a where a.event_id = target_event;

	insert into public.activity_log (kind, actor_id, event_id, summary)
		values ('event.completed', (select auth.uid()), target_event, 'Event afgerond');
end;
$$;
grant execute on function public.complete_event(uuid, uuid[]) to authenticated;
