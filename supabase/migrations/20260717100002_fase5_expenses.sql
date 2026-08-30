-- Phase 5 — expenses + expense_receipts (extra receipts). Claimant (expenses.view) submits with a
-- required receipt (receipt_path NOT NULL — DB-enforced, since client-side is bypassable); yakuza
-- (expenses.manage) reviews. A claimant can't approve their own claim, neither via the RPC nor a direct
-- table-write (RLS guard below). Mirrors the event_attendance conventions (set_updated_at + log_audit +
-- archived_at/by) and the self-signup-vs-manage RLS split.

create table public.expenses (
	id           uuid primary key default gen_random_uuid(),
	user_id      uuid not null references auth.users(id) on delete cascade,      -- claimant
	event_id     uuid references public.events(id) on delete set null,           -- con or standalone event
	activity_id  uuid references public.event_activities(id) on delete set null, -- extras at a con
	description  text not null,
	amount_eur   numeric(10, 2) not null check (amount_eur > 0),
	incurred_on  date not null,                                                  -- quarter filter derives from this
	status       public.expense_status not null default 'submitted',
	receipt_path text not null,                                                  -- main receipt; DB-enforced required
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

-- Read: own claims, or expenses.manage.
create policy "expenses read" on public.expenses for select to authenticated
	using (user_id = (select auth.uid()) or (select public.authorize('expenses.manage')));
-- Claimant creates: only their own, only as submitted (can't approve themselves).
create policy "expenses self insert" on public.expenses for insert to authenticated
	with check ((select public.authorize('expenses.view')) and user_id = (select auth.uid()) and status = 'submitted');
-- Claimant edits: only their own and only while submitted, stays submitted.
create policy "expenses self update" on public.expenses for update to authenticated
	using (user_id = (select auth.uid()) and status = 'submitted')
	with check (user_id = (select auth.uid()) and status = 'submitted');
-- Manage: can do everything except approve their own — a manager's own claim also can't be pushed out
-- of 'submitted' via a direct table-write (otherwise it bypasses review_expense's self-approval block).
-- No client DELETE (hard delete goes through the records.delete-gated RPC).
create policy "expenses manage insert" on public.expenses for insert to authenticated
	with check ((select public.authorize('expenses.manage')) and (user_id <> (select auth.uid()) or status = 'submitted'));
create policy "expenses manage update" on public.expenses for update to authenticated
	using ((select public.authorize('expenses.manage')))
	with check ((select public.authorize('expenses.manage')) and (user_id <> (select auth.uid()) or status = 'submitted'));

-- expense_receipts: read via the parent claim; written by owner-while-submitted or manage.
create policy "receipts read" on public.expense_receipts for select to authenticated
	using (exists (select 1 from public.expenses e where e.id = expense_id
		and (e.user_id = (select auth.uid()) or (select public.authorize('expenses.manage')))));
create policy "receipts self write" on public.expense_receipts for all to authenticated
	using (exists (select 1 from public.expenses e where e.id = expense_id and e.user_id = (select auth.uid()) and e.status = 'submitted'))
	with check (exists (select 1 from public.expenses e where e.id = expense_id and e.user_id = (select auth.uid()) and e.status = 'submitted'));
create policy "receipts manage write" on public.expense_receipts for all to authenticated
	using ((select public.authorize('expenses.manage'))) with check ((select public.authorize('expenses.manage')));

-- activity_log gets an expense_id link for readable claim history.
alter table public.activity_log add column if not exists expense_id uuid references public.expenses(id) on delete set null;

-- Domain activity on submission (the only way a row is created is status='submitted').
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

-- Reviewed by yakuza. Can't-review-own-claim (a cross-row rule a WITH CHECK can't express cleanly
-- alongside the status change); sets reviewer atomically and logs. Rejected can go back to submitted
-- (audit_log keeps the history).
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

-- hard_delete extended with an expenses branch: return all receipt paths (main + extra) first so the
-- client removes them from the 'receipts' bucket, only then delete the row (cascade cleans up the
-- expense_receipts rows). All existing branches carried over unchanged.
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
