-- Phase 5c — payout details (IBAN), expense category/IBAN snapshot with PII-safe audit, and per-event
-- budget.

-- Payout details: separate, tightly scoped table. NO audit trigger (IBAN is PII and audit_log is
-- readable via logs.view). Read is owner-only plus expenses.manage — deliberately NOT
-- moderation.view/logs.view/roles.manage (they have no reason to see payout data). Write is owner-only.
create table public.payout_details (
	user_id        uuid primary key references auth.users(id) on delete cascade,
	iban           text,
	account_holder text,
	updated_at     timestamptz not null default now()
);
create trigger set_updated_at before update on public.payout_details for each row execute function public.set_updated_at();
grant select, insert, update, delete on public.payout_details to authenticated, service_role;
alter table public.payout_details enable row level security;
create policy "payout self" on public.payout_details for all to authenticated
	using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "payout manage read" on public.payout_details for select to authenticated
	using ((select public.authorize('expenses.manage')));

-- expenses: category + IBAN snapshot (effective for this claim; pre-filled from payout_details,
-- overridable per claim). RLS is unchanged (read = own ∪ expenses.manage also covers these columns).
alter table public.expenses add column if not exists category public.expense_category not null default 'other';
alter table public.expenses add column if not exists iban text;
alter table public.expenses add column if not exists account_holder text;

-- PII-safe audit for expenses: identical to public.log_audit() but with iban/account_holder REDACTED,
-- so the account number never ends up in audit_log (which is readable via logs.view).
create or replace function public.log_audit_expenses()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
	insert into public.audit_log (table_name, record_id, op, old_data, new_data, actor_id)
	values (
		tg_table_name,
		case when tg_op = 'DELETE' then old.id else new.id end,
		tg_op,
		case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) - 'iban' - 'account_holder' else null end,
		case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) - 'iban' - 'account_holder' else null end,
		auth.uid()
	);
	return null; -- AFTER trigger
end;
$$;
drop trigger if exists audit_expenses on public.expenses;
create trigger audit_expenses after insert or update or delete on public.expenses for each row execute function public.log_audit_expenses();

-- Budget per event (optional; empty = no budget tracking). A CHECK passes on NULL.
alter table public.events add column if not exists budget_eur numeric(10, 2) check (budget_eur >= 0);
