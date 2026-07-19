-- 20260719160001_fasec_tickets.sql herdefinieerde hard_delete vanaf een verouderde basis en liet daarbij
-- de surveys- én org_income-tak vallen plus de badges-opruiming binnen de mod_subjects-tak. Omdat die
-- migratie ná 20260719140002_fasec_income.sql sorteert, won de onvolledige versie. Deze migratie herstelt
-- hard_delete éénmalig als de volledige unie van álle takken ooit toegevoegd (11 stuks).
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
		return query
			select 'mod-evidence'::text, le.storage_path
			from public.mod_link_evidence le
			join public.mod_subject_links l on l.id = le.link_id
			where (l.subject_low = target_id or l.subject_high = target_id) and le.storage_path is not null;
		return query
			select 'badges'::text, b.image_path
			from public.badges b
			where b.subject_id = target_id and b.image_path is not null;
		delete from public.mod_subjects where id = target_id;

	elsif target_table = 'mod_warnings' then
		return query
			select 'mod-evidence'::text, e.storage_path
			from public.mod_evidence e
			where e.warning_id = target_id and e.storage_path is not null;
		delete from public.mod_warnings where id = target_id;

	elsif target_table = 'mod_subject_links' then
		return query
			select 'mod-evidence'::text, le.storage_path
			from public.mod_link_evidence le
			where le.link_id = target_id and le.storage_path is not null;
		delete from public.mod_subject_links where id = target_id;

	elsif target_table = 'mod_bans' then
		delete from public.mod_bans where id = target_id;

	elsif target_table = 'tickets' then
		delete from public.tickets where id = target_id;  -- cascade ruimt messages + participants

	elsif target_table = 'badges' then
		return query
			select 'badges'::text, b.image_path
			from public.badges b
			where b.id = target_id and b.image_path is not null;
		delete from public.badges where id = target_id;

	elsif target_table = 'expenses' then
		return query
			select 'receipts'::text, e.receipt_path
			from public.expenses e
			where e.id = target_id and e.receipt_path is not null;
		return query
			select 'receipts'::text, r.path
			from public.expense_receipts r
			where r.expense_id = target_id and r.path is not null;
		delete from public.expenses where id = target_id;

	elsif target_table = 'surveys' then
		delete from public.surveys where id = target_id;

	elsif target_table = 'org_income' then
		delete from public.org_income where id = target_id;

	else
		raise exception 'hard_delete: niet-ondersteunde tabel %', target_table;
	end if;
end;
$$;
