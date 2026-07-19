-- Fase C — org_income: het geld dat DAC binnenkrijgt (Ko-fi-donaties, verkoop op de stand, sponsoring).
-- Bewust een aparte, lichte tabel i.p.v. public.expenses overladen: expenses draagt een volledige
-- declaratie-workflow (verplichte declarant user_id, receipt_path NOT NULL, expense_status, iban/
-- account_holder, reviewed_by/at, review_note) die voor inkomsten geen betekenis heeft. Overladen zou die
-- DB-afgedwongen invarianten (elke declaratie heeft een bon en een indiener) moeten opgeven en de op
-- eigenaarschap gebouwde expenses-RLS vertroebelen. org_income houdt alleen wat inkomsten nodig hebben en
-- spiegelt de expenses-conventies (set_updated_at + log_audit, numeric(10,2) met > 0-check).
create table public.org_income (
	id          uuid primary key default gen_random_uuid(),
	event_id    uuid references public.events(id) on delete set null,  -- con of los evenement (optioneel)
	description text not null,
	amount_eur  numeric(10, 2) not null check (amount_eur > 0),
	category    public.income_category not null default 'other',
	received_on date not null,                                         -- periodefilter leidt hiervan af
	created_by  uuid not null default auth.uid() references auth.users(id),
	created_at  timestamptz not null default now(),
	updated_at  timestamptz not null default now()
);
create trigger set_updated_at before update on public.org_income for each row execute function public.set_updated_at();
create trigger audit_org_income after insert or update or delete on public.org_income for each row execute function public.log_audit();
grant select, insert, update, delete on public.org_income to authenticated, service_role;
alter table public.org_income enable row level security;

-- Lezen + schrijven vereist expenses.manage (het Financiën-recht); spiegelt de manage-tak van expenses.
-- Geen client-DELETE-policy: hard delete loopt uitsluitend via de records.delete-gated hard_delete-RPC,
-- precies zoals bij expenses/kosten (B3/B4). RLS weigert delete standaard, de SECURITY DEFINER-RPC bypasst.
create policy "income read" on public.org_income for select to authenticated
	using ((select public.authorize('expenses.manage')));
create policy "income insert" on public.org_income for insert to authenticated
	with check ((select public.authorize('expenses.manage')));
create policy "income update" on public.org_income for update to authenticated
	using ((select public.authorize('expenses.manage')))
	with check ((select public.authorize('expenses.manage')));

-- finance_rollup opnieuw: nu een UNION over expenses (richting='uitgaven') én org_income
-- (richting='inkomsten'). categorie wordt text zodat beide enums (expense_category + income_category) in
-- één kolom passen; status is null voor inkomsten (die kennen geen beoordelingsworkflow). De signatuur
-- (argumenten) blijft identiek, dus de client-aanroep verandert niet. DROP omdat het return-type wijzigt.
drop function if exists public.finance_rollup(date, date, uuid);
create function public.finance_rollup(
	p_from date default null,
	p_to date default null,
	p_event_id uuid default null
)
returns table (
	id           uuid,
	bron         text,
	richting     text,
	event_id     uuid,
	event_naam   text,
	categorie    text,
	omschrijving text,
	datum        date,
	bedrag       numeric,
	status       public.expense_status
)
language sql security definer set search_path = '' as $$
	select
		e.id,
		case when e.event_id is not null then 'kosten' else 'declaratie' end,
		'uitgaven'::text,
		e.event_id,
		ev.name,
		e.category::text,
		e.description,
		e.incurred_on,
		e.amount_eur,
		e.status
	from public.expenses e
	left join public.events ev on ev.id = e.event_id
	where (select public.authorize('expenses.manage'))
		and e.archived_at is null
		and (p_from is null or e.incurred_on >= p_from)
		and (p_to is null or e.incurred_on <= p_to)
		and (p_event_id is null or e.event_id = p_event_id)
	union all
	select
		i.id,
		'inkomst'::text,
		'inkomsten'::text,
		i.event_id,
		ev.name,
		i.category::text,
		i.description,
		i.received_on,
		i.amount_eur,
		null::public.expense_status
	from public.org_income i
	left join public.events ev on ev.id = i.event_id
	where (select public.authorize('expenses.manage'))
		and (p_from is null or i.received_on >= p_from)
		and (p_to is null or i.received_on <= p_to)
		and (p_event_id is null or i.event_id = p_event_id);
$$;
grant execute on function public.finance_rollup(date, date, uuid) to authenticated;

-- hard_delete uitgebreid met een org_income-tak: inkomsten hebben geen storage-objecten, dus enkel de rij
-- wissen (geen paden terug, zoals de inventory_items-tak). Alle bestaande takken ongewijzigd overgenomen.
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
