-- Phase 1 fixes after adversarial review (fix-forward; 110004/110005 are already applied, untouched here).

-- FIX A (critical): hard_delete('inventory_items', …) returned ticket-PDF paths of tickets that weren't
-- actually deleted — event_tickets belong to events, not items, so they don't cascade on an item delete,
-- yet the client wiped those paths from storage anyway → loss of live ticket PDFs. An item itself has
-- no storage children (assignments/history carry no files), so return nothing for that branch.
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

-- FIX B (high): 110004 removed the DELETE policy on operational child rows with no replacement, so
-- nobody could delete an assignment/ticket/history row anymore (EventDetail buttons failed silently).
-- These rows are NOT archived; managers (inventory.manage) delete them directly (110003's audit trigger
-- logs it). Restore the DELETE policy and put tickets-PDF storage delete back on inventory.manage.
drop policy if exists "assignments manage delete" on public.event_item_assignments;
create policy "assignments manage delete" on public.event_item_assignments for delete to authenticated using ((select public.authorize('inventory.manage')));
drop policy if exists "tickets manage delete" on public.event_tickets;
create policy "tickets manage delete" on public.event_tickets for delete to authenticated using ((select public.authorize('inventory.manage')));
drop policy if exists "history manage delete" on public.inventory_history;
create policy "history manage delete" on public.inventory_history for delete to authenticated using ((select public.authorize('inventory.manage')));

drop policy if exists "tickets pdf delete" on storage.objects;
create policy "tickets pdf delete" on storage.objects for delete to authenticated using (bucket_id = 'tickets' and (select public.authorize('inventory.manage')));

-- FIX C (low): notifications granted table-wide UPDATE (all columns) → restrict to marking read_at only.
revoke update on public.notifications from authenticated;
grant update (read_at) on public.notifications to authenticated;

-- FIX D (low): a logs.view holder without roles.manage/moderation.view couldn't read profile names →
-- actor names on the Logs screen fell back to UUIDs. Add logs.view to the profiles read policy.
drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles for select to authenticated
	using (
		id = (select auth.uid())
		or (select public.authorize('roles.manage'))
		or (select public.authorize('moderation.view'))
		or (select public.authorize('logs.view'))
	);
