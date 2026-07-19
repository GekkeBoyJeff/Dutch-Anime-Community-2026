-- After the hard-anonymity fix, managers no longer read survey_responses directly. The management
-- list (status + "has submissions → lock questions") needs a non-identifying count: totals per
-- survey only, never who. surveys.manage-gated.
create or replace function public.survey_response_counts()
returns table (survey_id uuid, response_count bigint)
language sql security definer set search_path = '' as $$
	select r.survey_id, count(*)
	from public.survey_responses r
	where (select public.authorize('surveys.manage'))
	group by r.survey_id;
$$;
grant execute on function public.survey_response_counts() to authenticated;
