-- Brok D: resultaten-RPC geeft nu de respondent-NAAM mee bij niet-anonieme enquêtes (de definer
-- resolvet 'm zelf uit profiles, zodat managers geen profiles-leesrecht nodig hebben), en een
-- eigen-geschiedenis-RPC voor het teruglezen op /account.

create or replace function public.get_survey_results(p_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
	v_survey public.surveys;
	v_hide   boolean;
begin
	if not (select public.authorize('surveys.manage')) then
		raise exception 'surveys.manage vereist';
	end if;
	select * into v_survey from public.surveys where id = p_id;
	if not found then raise exception 'enquête niet gevonden'; end if;
	v_hide := v_survey.anonymous or v_survey.access_mode = 'public';

	return jsonb_build_object(
		'survey', jsonb_build_object('id', v_survey.id, 'title', v_survey.title,
			'anonymous', v_survey.anonymous, 'access_mode', v_survey.access_mode),
		'questions', (select coalesce(jsonb_agg(jsonb_build_object(
				'id', q.id, 'label', q.label, 'kind', q.kind, 'required', q.required, 'position', q.position,
				'options', (select coalesce(jsonb_agg(jsonb_build_object('id', o.id, 'label', o.label) order by o.position), '[]'::jsonb)
					from public.survey_question_options o where o.question_id = q.id)
			) order by q.position), '[]'::jsonb) from public.survey_questions q where q.survey_id = p_id),
		'responses', (select coalesce(jsonb_agg(jsonb_build_object(
				'response_id', r.id,
				'submitted_at', r.submitted_at,
				'respondent', case when v_hide then null else jsonb_build_object(
					'user_id', r.user_id,
					'name', (select coalesce(p.guild_nick, p.global_name, p.username) from public.profiles p where p.id = r.user_id)
				) end,
				'answers', (select coalesce(jsonb_agg(jsonb_build_object(
						'question_id', a.question_id, 'value_number', a.value_number, 'value_text', a.value_text, 'value_date', a.value_date,
						'option_ids', (select coalesce(jsonb_agg(c.option_id), '[]'::jsonb) from public.survey_answer_choices c where c.answer_id = a.id)
					)), '[]'::jsonb) from public.survey_answers a where a.response_id = r.id)
			)), '[]'::jsonb) from public.survey_responses r where r.survey_id = p_id));
end;
$$;

create or replace function public.my_survey_history()
returns table (survey_id uuid, title text, submitted_at timestamptz)
language sql security definer set search_path = '' as $$
	select s.id, s.title, r.submitted_at
	from public.survey_responses r
	join public.surveys s on s.id = r.survey_id
	where r.user_id = (select auth.uid())
	order by r.submitted_at desc;
$$;
grant execute on function public.my_survey_history() to authenticated;
