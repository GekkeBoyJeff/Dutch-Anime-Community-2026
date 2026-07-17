-- Fase 5 — expenses (declaraties) + expense_receipts (extra bonnen). Declarant (expenses.view) dient in
-- met verplicht bonnetje (receipt_path NOT NULL — DB-afgedwongen, want client-verplicht is omzeilbaar);
-- yakuza (expenses.manage) beoordeelt. Een declarant kan zichzelf niet goedkeuren: niet via de RPC, en
-- ook niet via een directe table-write (RLS-guard hieronder). Spiegelt de event_attendance-conventies
-- (set_updated_at + log_audit + archived_at/by) en de self-signup-vs-manage-RLS-split.

create table public.expenses (
	id           uuid primary key default gen_random_uuid(),
	user_id      uuid not null references auth.users(id) on delete cascade,      -- declarant
	event_id     uuid references public.events(id) on delete set null,           -- con of los evenement
	activity_id  uuid references public.event_activities(id) on delete set null, -- extra's op een con
	description  text not null,
	amount_eur   numeric(10, 2) not null check (amount_eur > 0),
	incurred_on  date not null,                                                  -- kwartaalfilter leidt hiervan af
	status       public.expense_status not null default 'submitted',
	receipt_path text not null,                                                  -- hoofdbon; DB-afgedwongen verplicht
	reviewed_by  uuid references auth.users(id),
	reviewed_at  timestamptz,
	review_note  text,
	archived_at  timestamptz,
	archived_by  uuid references auth.users(id),
	created_at   timestamptz not null default now(),
	updated_at   timestamptz not null default now()
);
create trigger set_updated_at before update on public.expenses for each row execute function public.set_updated_at();
create trigger audit_expenses after insert or update or delete on public.expenses for each row execute function public.log_audit();
grant select, insert, update, delete on public.expenses to authenticated, service_role;
alter table public.expenses enable row level security;

create table public.expense_receipts (
	id         uuid primary key default gen_random_uuid(),
	expense_id uuid not null references public.expenses(id) on delete cascade,
	path       text not null,
	created_at timestamptz not null default now()
);
create trigger audit_expense_receipts after insert or update or delete on public.expense_receipts for each row execute function public.log_audit();
grant select, insert, update, delete on public.expense_receipts to authenticated, service_role;
alter table public.expense_receipts enable row level security;

-- Lezen: eigen declaraties, of expenses.manage.
create policy "expenses read" on public.expenses for select to authenticated
	using (user_id = (select auth.uid()) or (select public.authorize('expenses.manage')));
-- Declarant maakt aan: alleen eigen, alleen als submitted (kan zichzelf niet goedkeuren).
create policy "expenses self insert" on public.expenses for insert to authenticated
	with check ((select public.authorize('expenses.view')) and user_id = (select auth.uid()) and status = 'submitted');
-- Declarant bewerkt: alleen eigen én zolang submitted, blijft submitted.
create policy "expenses self update" on public.expenses for update to authenticated
	using (user_id = (select auth.uid()) and status = 'submitted')
	with check (user_id = (select auth.uid()) and status = 'submitted');
-- Beheer: mag alles behalve zichzelf goedkeuren — een eigen declaratie mag ook via een directe table-write
-- niet uit 'submitted' geduwd worden (anders omzeilt een manager review_expense's zelf-goedkeur-blok).
-- Geen client-DELETE (hard delete loopt via de records.delete-gated RPC).
create policy "expenses manage insert" on public.expenses for insert to authenticated
	with check ((select public.authorize('expenses.manage')) and (user_id <> (select auth.uid()) or status = 'submitted'));
create policy "expenses manage update" on public.expenses for update to authenticated
	using ((select public.authorize('expenses.manage')))
	with check ((select public.authorize('expenses.manage')) and (user_id <> (select auth.uid()) or status = 'submitted'));

-- expense_receipts: lezen via de bovenliggende declaratie; schrijven door eigenaar-zolang-submitted of manage.
create policy "receipts read" on public.expense_receipts for select to authenticated
	using (exists (select 1 from public.expenses e where e.id = expense_id
		and (e.user_id = (select auth.uid()) or (select public.authorize('expenses.manage')))));
create policy "receipts self write" on public.expense_receipts for all to authenticated
	using (exists (select 1 from public.expenses e where e.id = expense_id and e.user_id = (select auth.uid()) and e.status = 'submitted'))
	with check (exists (select 1 from public.expenses e where e.id = expense_id and e.user_id = (select auth.uid()) and e.status = 'submitted'));
create policy "receipts manage write" on public.expense_receipts for all to authenticated
	using ((select public.authorize('expenses.manage'))) with check ((select public.authorize('expenses.manage')));

-- activity_log krijgt een expense_id-koppeling voor leesbare declaratie-historie.
alter table public.activity_log add column if not exists expense_id uuid references public.expenses(id) on delete set null;

-- Domain-activity bij indienen (de enige manier waarop een rij ontstaat is status='submitted').
create or replace function public.log_expense_submitted() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
	insert into public.activity_log (kind, actor_id, event_id, expense_id, summary)
	values ('expense.submitted', coalesce((select auth.uid()), new.user_id), new.event_id, new.id,
		format('Declaratie ingediend: %s (€ %s)', coalesce(new.description, '—'), to_char(new.amount_eur, 'FM999999990.00')));
	return new;
end;
$$;
create trigger log_expense_submitted after insert on public.expenses for each row execute function public.log_expense_submitted();

-- Beoordelen door yakuza. Kan-niet-eigen-declaratie-beoordelen (rij-overschrijdende regel die een WITH CHECK
-- niet netjes uitdrukt samen met de statuswissel); zet reviewer atomisch en logt. Afgewezen mag terug naar
-- submitted (audit_log bewaart de historie).
create or replace function public.review_expense(p_id uuid, p_status public.expense_status, p_note text default null)
returns public.expenses language plpgsql security definer set search_path = '' as $$
declare
	rec public.expenses;
begin
	if not (select public.authorize('expenses.manage')) then
		raise exception 'expenses.manage vereist';
	end if;
	select * into rec from public.expenses where id = p_id for update;
	if rec.id is null then
		raise exception 'declaratie niet gevonden';
	end if;
	if rec.user_id = (select auth.uid()) then
		raise exception 'je kunt je eigen declaratie niet beoordelen';
	end if;

	update public.expenses
		set status = p_status,
			reviewed_by = (select auth.uid()),
			reviewed_at = now(),
			review_note = coalesce(p_note, review_note)
		where id = p_id
		returning * into rec;

	insert into public.activity_log (kind, actor_id, event_id, expense_id, summary)
	values ('expense.' || p_status::text, (select auth.uid()), rec.event_id, rec.id,
		format('Declaratie "%s" beoordeeld: %s', coalesce(rec.description, '—'), p_status::text));

	return rec;
end;
$$;
grant execute on function public.review_expense(uuid, public.expense_status, text) to authenticated;

-- hard_delete uitgebreid met een expenses-tak: geef eerst álle bon-paden (hoofdbon + extra bonnen) terug
-- zodat de client ze uit de 'receipts'-bucket verwijdert, dan pas de rij wissen (cascade ruimt de
-- expense_receipts-rijen op). Alle bestaande takken ongewijzigd overgenomen.
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

	else
		raise exception 'hard_delete: niet-ondersteunde tabel %', target_table;
	end if;
end;
$$;
