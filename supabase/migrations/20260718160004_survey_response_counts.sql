-- Managers lezen na de harde-anonimiteit-fix survey_responses niet meer direct. Voor de beheerlijst
-- (status + "heeft inzendingen → vragen op slot") is een NIET-identificerende telling nodig: alleen
-- aantallen per enquête, nooit wie. surveys.manage-gated.
create or replace function public.survey_response_counts()
returns table (survey_id uuid, response_count bigint)
language sql security definer set search_path = '' as $$
	select r.survey_id, count(*)
	from public.survey_responses r
	where (select public.authorize('surveys.manage'))
	group by r.survey_id;
$$;
grant execute on function public.survey_response_counts() to authenticated;
