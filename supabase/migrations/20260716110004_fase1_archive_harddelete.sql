-- Archive instead of delete. The archive filter belongs in the app query, NOT in the SELECT policy
-- (a filtering policy would block the archiving UPDATE itself).
alter table public.inventory_items add column if not exists archived_at timestamptz, add column if not exists archived_by uuid references auth.users(id);
alter table public.events         add column if not exists archived_at timestamptz, add column if not exists archived_by uuid references auth.users(id);
alter table public.mod_notes      add column if not exists archived_at timestamptz, add column if not exists archived_by uuid references auth.users(id);

-- Hard-delete split. The existing `for all` manage policies bundle DELETE under inventory.manage.
-- Replace them with select/insert/update manage policies — direct client DELETE goes away (archiving =
-- UPDATE archived_at; hard delete goes through the RPC below). Idempotent: drop-if-exists before each create.

-- inventory_items: own-scope policies stay, except own-DELETE (own archiving = own-UPDATE).
drop policy if exists "inv items manage" on public.inventory_items;
drop policy if exists "inv items manage select" on public.inventory_items;
drop policy if exists "inv items manage insert" on public.inventory_items;
drop policy if exists "inv items manage update" on public.inventory_items;
create policy "inv items manage select" on public.inventory_items for select to authenticated using ((select public.authorize('inventory.manage')));
create policy "inv items manage insert" on public.inventory_items for insert to authenticated with check ((select public.authorize('inventory.manage')));
create policy "inv items manage update" on public.inventory_items for update to authenticated using ((select public.authorize('inventory.manage'))) with check ((select public.authorize('inventory.manage')));
drop policy if exists "inv items own delete" on public.inventory_items;

-- events
drop policy if exists "events manage" on public.events;
drop policy if exists "events manage select" on public.events;
drop policy if exists "events manage insert" on public.events;
drop policy if exists "events manage update" on public.events;
create policy "events manage select" on public.events for select to authenticated using ((select public.authorize('inventory.manage')));
create policy "events manage insert" on public.events for insert to authenticated with check ((select public.authorize('inventory.manage')));
create policy "events manage update" on public.events for update to authenticated using ((select public.authorize('inventory.manage'))) with check ((select public.authorize('inventory.manage')));

-- event_item_assignments
drop policy if exists "assignments manage" on public.event_item_assignments;
drop policy if exists "assignments manage select" on public.event_item_assignments;
drop policy if exists "assignments manage insert" on public.event_item_assignments;
drop policy if exists "assignments manage update" on public.event_item_assignments;
create policy "assignments manage select" on public.event_item_assignments for select to authenticated using ((select public.authorize('inventory.manage')));
create policy "assignments manage insert" on public.event_item_assignments for insert to authenticated with check ((select public.authorize('inventory.manage')));
create policy "assignments manage update" on public.event_item_assignments for update to authenticated using ((select public.authorize('inventory.manage'))) with check ((select public.authorize('inventory.manage')));

-- event_tickets
drop policy if exists "tickets manage" on public.event_tickets;
drop policy if exists "tickets manage select" on public.event_tickets;
drop policy if exists "tickets manage insert" on public.event_tickets;
drop policy if exists "tickets manage update" on public.event_tickets;
create policy "tickets manage select" on public.event_tickets for select to authenticated using ((select public.authorize('inventory.manage')));
create policy "tickets manage insert" on public.event_tickets for insert to authenticated with check ((select public.authorize('inventory.manage')));
create policy "tickets manage update" on public.event_tickets for update to authenticated using ((select public.authorize('inventory.manage'))) with check ((select public.authorize('inventory.manage')));

-- inventory_history
drop policy if exists "history manage" on public.inventory_history;
drop policy if exists "history manage select" on public.inventory_history;
drop policy if exists "history manage insert" on public.inventory_history;
drop policy if exists "history manage update" on public.inventory_history;
create policy "history manage select" on public.inventory_history for select to authenticated using ((select public.authorize('inventory.manage')));
create policy "history manage insert" on public.inventory_history for insert to authenticated with check ((select public.authorize('inventory.manage')));
create policy "history manage update" on public.inventory_history for update to authenticated using ((select public.authorize('inventory.manage'))) with check ((select public.authorize('inventory.manage')));

-- Moderation: DELETE policies (currently moderation.manage) → records.delete (admin-only). Insert/update/select
-- stay moderation.manage/moderation.view.
do $$
declare t text;
begin
	foreach t in array array['mod_subjects', 'mod_warnings', 'mod_evidence', 'mod_notes', 'mod_subject_links'] loop
		execute format('drop policy if exists "mod delete %1$s" on public.%1$I', t);
		execute format($f$create policy "mod delete %1$s" on public.%1$I for delete to authenticated using ((select public.authorize('records.delete')))$f$, t);
	end loop;
end $$;

-- Storage-aware hard-delete RPC (replaces client DELETE on the domain tables). Checks records.delete,
-- collects storage paths of the row + cascaded children, deletes the row, and returns the paths for
-- the client to remove() via the Storage API — this RPC never touches storage.objects directly.
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
		return query
			select 'tickets'::text, t.ticket_pdf_path
			from public.event_tickets t
			join public.event_item_assignments a on a.event_id = t.event_id
			where a.item_id = target_id and t.ticket_pdf_path is not null;
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

grant execute on function public.hard_delete(text, uuid) to authenticated;

-- Storage DELETE gated on records.delete (write/read unchanged).
drop policy if exists "tickets pdf delete" on storage.objects;
create policy "tickets pdf delete" on storage.objects for delete to authenticated using (bucket_id = 'tickets' and (select public.authorize('records.delete')));

drop policy if exists "mod-evidence delete" on storage.objects;
create policy "mod-evidence delete" on storage.objects for delete to authenticated using (bucket_id = 'mod-evidence' and (select public.authorize('records.delete')));
