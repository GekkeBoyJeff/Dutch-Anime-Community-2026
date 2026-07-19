-- Phase B — Finance: one flat, filterable rollup over all money DAC spends, sourced solely from
-- public.expenses (no income source exists yet, so direction is always 'uitgaven'). Gated on
-- authorize('expenses.manage') in the WHERE, mirroring survey_response_counts; no iban/account_holder.
create or replace function public.finance_rollup(
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
	categorie    public.expense_category,
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
		e.category,
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
		and (p_event_id is null or e.event_id = p_event_id);
$$;
grant execute on function public.finance_rollup(date, date, uuid) to authenticated;
