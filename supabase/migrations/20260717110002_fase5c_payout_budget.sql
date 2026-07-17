-- Fase 5c — uitbetaalgegevens (IBAN), declaratie-categorie/IBAN-snapshot met PII-veilige audit, en budget
-- per conferentie.

-- Uitbetaalgegevens: aparte, streng-gescoopte tabel. GEEN audit-trigger (IBAN is PII en audit_log is leesbaar
-- door logs.view). Lezen mag alléén de eigenaar én expenses.manage — bewust NIET moderation.view/logs.view/
-- roles.manage (die hebben geen uitbetaalreden). Schrijven alleen de eigenaar zelf.
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

-- expenses: categorie + IBAN-snapshot (effectief voor déze declaratie; voorgevuld uit payout_details, per
-- declaratie te overschrijven). RLS is ongewijzigd (read = eigen ∪ expenses.manage dekt ook deze kolommen).
alter table public.expenses add column if not exists category public.expense_category not null default 'other';
alter table public.expenses add column if not exists iban text;
alter table public.expenses add column if not exists account_holder text;

-- PII-veilige audit voor expenses: identiek aan public.log_audit() maar met iban/account_holder GEREDIGEERD,
-- zodat het rekeningnummer nooit in audit_log belandt (dat is leesbaar door logs.view).
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
	return null; -- AFTER-trigger
end;
$$;
drop trigger if exists audit_expenses on public.expenses;
create trigger audit_expenses after insert or update or delete on public.expenses for each row execute function public.log_audit_expenses();

-- Budget per conferentie (optioneel; leeg = geen budgetbewaking). Een CHECK passeert bij NULL.
alter table public.events add column if not exists budget_eur numeric(10, 2) check (budget_eur >= 0);
