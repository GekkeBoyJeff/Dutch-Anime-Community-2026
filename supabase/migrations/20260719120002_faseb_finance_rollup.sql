-- Fase B — Financiën: één vlakke, filterbare rollup over al het geld dat DAC uitgeeft. De org-brede
-- tegenhanger van de per-conventie "Kosten"-tab en de eigen "Declaraties". Bron is uitsluitend
-- public.expenses: event-gebonden declaraties tellen als 'kosten', losse als 'declaratie'. Er is (nog)
-- geen inkomstenbron in het schema, dus richting is altijd 'uitgaven' — de UI toont inkomsten leeg.
-- SECURITY DEFINER met authorize('expenses.manage') in de WHERE: zonder dat recht komt er niets terug
-- (spiegelt survey_response_counts). Geen iban/account_holder — PII blijft buiten deze rollup.
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
