-- Fase 1 fixes na adversarial review (fix-forward; 110004/110005 zijn al toegepast, die raken we niet).

-- FIX A (critical): hard_delete('inventory_items', …) gaf ticket-PDF-paden van NIET-verwijderde tickets
-- terug — event_tickets hangen aan events (niet aan items) en cascaden dus niet mee bij een item-delete,
-- terwijl de client die paden wél uit storage wiste → verlies van live ticket-PDF's. Een item heeft zelf
-- geen storage-children (assignments/history dragen geen bestanden) → geef niets terug voor die tak.
create or replace function public.hard_delete(target_table text, target_id uuid)
returns table (bucket_id text, path text)
language plpgsql security definer set search_path = '' as $$
begin
	if not (select public.authorize('records.delete')) then
		raise exception 'records.delete vereist';
	end if;

	if target_table = 'events' then
		return query
			select 'tickets'::text, t.ticket_pdf_path
			from public.event_tickets t
			where t.event_id = target_id and t.ticket_pdf_path is not null;
		delete from public.events where id = target_id;

	elsif target_table = 'inventory_items' then
		delete from public.inventory_items where id = target_id;

	elsif target_table = 'mod_subjects' then
		return query
			select 'mod-evidence'::text, e.storage_path
			from public.mod_evidence e
			join public.mod_warnings w on w.id = e.warning_id
			where w.subject_id = target_id and e.storage_path is not null;
		delete from public.mod_subjects where id = target_id;

	elsif target_table = 'mod_warnings' then
		return query
			select 'mod-evidence'::text, e.storage_path
			from public.mod_evidence e
			where e.warning_id = target_id and e.storage_path is not null;
		delete from public.mod_warnings where id = target_id;

	else
		raise exception 'hard_delete: niet-ondersteunde tabel %', target_table;
	end if;
end;
$$;

-- FIX B (high): 110004 haalde de DELETE-policy van de operationele child-rijen weg zonder vervanging →
-- niemand kon nog een toewijzing/ticket/historie-regel verwijderen (EventDetail-knoppen faalden stil).
-- Deze rijen worden NIET gearchiveerd; managers (inventory.manage) verwijderen ze direct (de audit-trigger
-- uit 110003 logt het). Herstel de DELETE-policy, en zet de tickets-PDF-storage-delete terug naar
-- inventory.manage (een manager die een ticket verwijdert moet ook de PDF kunnen opruimen).
drop policy if exists "assignments manage delete" on public.event_item_assignments;
create policy "assignments manage delete" on public.event_item_assignments for delete to authenticated using ((select public.authorize('inventory.manage')));
drop policy if exists "tickets manage delete" on public.event_tickets;
create policy "tickets manage delete" on public.event_tickets for delete to authenticated using ((select public.authorize('inventory.manage')));
drop policy if exists "history manage delete" on public.inventory_history;
create policy "history manage delete" on public.inventory_history for delete to authenticated using ((select public.authorize('inventory.manage')));

drop policy if exists "tickets pdf delete" on storage.objects;
create policy "tickets pdf delete" on storage.objects for delete to authenticated using (bucket_id = 'tickets' and (select public.authorize('inventory.manage')));

-- FIX C (low): notifications gaf table-brede UPDATE (alle kolommen) → beperk tot alleen read_at markeren.
revoke update on public.notifications from authenticated;
grant update (read_at) on public.notifications to authenticated;

-- FIX D (low): een logs.view-houder zonder roles.manage/moderation.view kon geen profielnamen lezen →
-- actor-namen op het Logs-scherm vielen terug op UUID's. Voeg logs.view toe aan de profiles read-policy.
drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles for select to authenticated
	using (
		id = (select auth.uid())
		or (select public.authorize('roles.manage'))
		or (select public.authorize('moderation.view'))
		or (select public.authorize('logs.view'))
	);
