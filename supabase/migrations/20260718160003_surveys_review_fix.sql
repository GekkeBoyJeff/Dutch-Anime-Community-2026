-- Surveys — adversarial review fixes (3 dimensions: security/RLS-PII/correctness) + hard anonymity.
-- Findings: grants gap (managers couldn't write), NULL propagation bypassed required questions,
-- content leak in get_survey_for_fill, open_survey re-notified on every call, anon DoS on p_answers,
-- duplicate choice options, missing indexes, created_by lacked FK, anonymity wasn't enforced.

-- ---------- FIX 1 (CRITICAL): grants — RLS without table privilege blocks managers ----------
grant insert, update, delete on public.surveys, public.survey_questions, public.survey_question_options to authenticated;
grant delete on public.survey_responses, public.survey_answers, public.survey_answer_choices to authenticated;

-- ---------- FIX 6/8: duplicate choice options + created_by FK ----------
alter table public.survey_answer_choices add constraint survey_answer_choices_unique unique (answer_id, option_id);
alter table public.surveys add constraint surveys_created_by_fkey foreign key (created_by) references auth.users(id);

-- ---------- FIX 7: indexes for aggregation + reading back on /account ----------
create index survey_answers_question on public.survey_answers (question_id);
create index survey_responses_user on public.survey_responses (user_id);

-- ---------- HARD ANONYMITY: manager no longer reads submissions directly (own row only) ----------
-- Results (incl. name when not anonymous) only via get_survey_results (definer) below.
drop policy "survey_responses read" on public.survey_responses;
create policy "survey_responses read" on public.survey_responses for select to authenticated
	using (user_id = (select auth.uid()));

drop policy "survey_answers read" on public.survey_answers;
create policy "survey_answers read" on public.survey_answers for select to authenticated
	using (exists (
		select 1 from public.survey_responses r
		where r.id = survey_answers.response_id and r.user_id = (select auth.uid())));

drop policy "survey_answer_choices read" on public.survey_answer_choices;
create policy "survey_answer_choices read" on public.survey_answer_choices for select to authenticated
	using (exists (
		select 1 from public.survey_answers a
		join public.survey_responses r on r.id = a.response_id
		where a.id = survey_answer_choices.answer_id and r.user_id = (select auth.uid())));

-- ---------- FIX 3: get_survey_for_fill — questions only when eligible (else leaks private content) ----------
create or replace function public.get_survey_for_fill(p_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
	v_survey    public.surveys;
	v_uid       uuid := (select auth.uid());
	v_eligible  boolean := false;
	v_submitted boolean := false;
	v_questions jsonb := '[]'::jsonb;
	v_answers   jsonb := null;
begin
	select * into v_survey from public.surveys where id = p_id;
	if not found or v_survey.archived_at is not null then
		return jsonb_build_object('error', 'niet beschikbaar');
	end if;
	if not (v_survey.opens_at is not null and now() >= v_survey.opens_at
		and (v_survey.closes_at is null or now() < v_survey.closes_at)) then
		return jsonb_build_object('error', 'niet beschikbaar');
	end if;

	if v_survey.access_mode = 'public' then
		v_eligible := true;
	elsif v_uid is not null then
		if v_survey.audience = 'all_users' then
			v_eligible := true;
		elsif v_survey.audience = 'role' then
			v_eligible := exists (select 1 from public.user_roles ur where ur.user_id = v_uid and ur.role = v_survey.audience_role);
		elsif v_survey.audience = 'event_attendees' then
			v_eligible := exists (select 1 from public.event_attendance a
				where a.event_id = v_survey.event_id and a.subject_id = (select public.my_subject_id()) and a.status in ('present', 'late'));
		end if;
	end if;

	if v_eligible then
		select coalesce(jsonb_agg(jsonb_build_object(
				'id', sq.id, 'label', sq.label, 'kind', sq.kind, 'required', sq.required, 'position', sq.position,
				'options', (select coalesce(jsonb_agg(jsonb_build_object('id', o.id, 'label', o.label) order by o.position), '[]'::jsonb)
					from public.survey_question_options o where o.question_id = sq.id)
			) order by sq.position), '[]'::jsonb) into v_questions
		from public.survey_questions sq where sq.survey_id = p_id;

		if v_survey.access_mode = 'authenticated' and v_uid is not null then
			select exists (select 1 from public.survey_responses r where r.survey_id = p_id and r.user_id = v_uid) into v_submitted;
			if v_submitted then
				select coalesce(jsonb_agg(jsonb_build_object(
						'question_id', a.question_id, 'value_number', a.value_number, 'value_text', a.value_text, 'value_date', a.value_date,
						'option_ids', (select coalesce(jsonb_agg(c.option_id), '[]'::jsonb) from public.survey_answer_choices c where c.answer_id = a.id)
					)), '[]'::jsonb) into v_answers
				from public.survey_answers a
				join public.survey_responses r on r.id = a.response_id
				where r.survey_id = p_id and r.user_id = v_uid;
			end if;
		end if;
	end if;

	return jsonb_build_object(
		'survey', jsonb_build_object('id', v_survey.id, 'title', v_survey.title, 'description', v_survey.description,
			'access_mode', v_survey.access_mode, 'anonymous', v_survey.anonymous),
		'questions', v_questions,
		'eligible', v_eligible,
		'already_submitted', v_submitted,
		'my_answers', v_answers);
end;
$$;

-- ---------- FIX 2/5: submit_survey_response — single-pass parse + cap + coalesce(v_valid) + distinct options ----------
create or replace function public.submit_survey_response(p_id uuid, p_answers jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
	v_survey   public.surveys;
	v_uid      uuid := (select auth.uid());
	v_eligible boolean := false;
	v_response uuid;
	v_answer   uuid;
	v_by_q     jsonb;
	q          record;
	v_ans      jsonb;
	v_num      numeric;
	v_txt      text;
	v_date     date;
	v_opts     uuid[];
	v_valid    boolean;
begin
	select * into v_survey from public.surveys where id = p_id;
	if not found or v_survey.archived_at is not null then
		raise exception 'enquête niet beschikbaar';
	end if;
	if not (v_survey.opens_at is not null and now() >= v_survey.opens_at
		and (v_survey.closes_at is null or now() < v_survey.closes_at)) then
		raise exception 'enquête is niet open';
	end if;

	if jsonb_typeof(coalesce(p_answers, '[]'::jsonb)) <> 'array'
		or jsonb_array_length(coalesce(p_answers, '[]'::jsonb)) > 500 then
		raise exception 'ongeldige antwoorden';
	end if;

	if v_survey.access_mode = 'authenticated' then
		if v_uid is null then raise exception 'login vereist'; end if;
		if v_survey.audience = 'all_users' then
			v_eligible := true;
		elsif v_survey.audience = 'role' then
			v_eligible := exists (select 1 from public.user_roles ur where ur.user_id = v_uid and ur.role = v_survey.audience_role);
		elsif v_survey.audience = 'event_attendees' then
			v_eligible := exists (select 1 from public.event_attendance a
				where a.event_id = v_survey.event_id and a.subject_id = (select public.my_subject_id()) and a.status in ('present', 'late'));
		end if;
		if not v_eligible then raise exception 'deze enquête is niet voor jou'; end if;

		insert into public.survey_responses (survey_id, user_id) values (p_id, v_uid)
			on conflict (survey_id, user_id) do update set submitted_at = now()
			returning id into v_response;
	else
		insert into public.survey_responses (survey_id, user_id) values (p_id, null)
			returning id into v_response;
	end if;

	delete from public.survey_answers where response_id = v_response;

	-- Index p_answers once by question_id (last duplicate does not win: first per id).
	select coalesce(jsonb_object_agg(d.qid, d.val), '{}'::jsonb) into v_by_q
	from (
		select distinct on (e.value->>'question_id') (e.value->>'question_id') as qid, e.value as val
		from jsonb_array_elements(coalesce(p_answers, '[]'::jsonb)) as e
		where jsonb_typeof(e.value) = 'object' and (e.value->>'question_id') is not null
		order by (e.value->>'question_id')
	) d;

	for q in select * from public.survey_questions where survey_id = p_id loop
		v_num := null; v_txt := null; v_date := null; v_opts := null; v_valid := false;
		v_ans := v_by_q -> (q.id::text);

		if v_ans is not null then
			if q.kind in ('rating_1_5', 'scale_0_10', 'number', 'yes_no') then
				v_num := (v_ans->>'value_number')::numeric;
				if q.kind = 'rating_1_5' then v_valid := v_num between 1 and 5;
				elsif q.kind = 'scale_0_10' then v_valid := v_num between 0 and 10;
				elsif q.kind = 'yes_no' then v_valid := v_num in (0, 1);
				else v_valid := v_num is not null; end if;
			elsif q.kind = 'date' then
				v_date := (v_ans->>'value_date')::date;
				v_valid := v_date is not null;
			elsif q.kind = 'text' then
				v_txt := nullif(btrim(v_ans->>'value_text'), '');
				v_valid := v_txt is not null;
			elsif q.kind in ('single_choice', 'multi_choice') then
				select array_agg(distinct t.value::uuid) into v_opts
				from jsonb_array_elements_text(coalesce(v_ans->'option_ids', '[]'::jsonb)) as t;
				if v_opts is not null and array_length(v_opts, 1) >= 1
					and (q.kind <> 'single_choice' or array_length(v_opts, 1) = 1)
					and not exists (
						select 1 from unnest(v_opts) as oid
						where not exists (select 1 from public.survey_question_options o where o.id = oid and o.question_id = q.id))
				then v_valid := true; end if;
			end if;
		end if;

		v_valid := coalesce(v_valid, false);
		if not v_valid then
			if q.required then raise exception 'verplichte vraag niet (geldig) beantwoord'; end if;
			continue;
		end if;

		insert into public.survey_answers (response_id, question_id, value_number, value_text, value_date)
			values (v_response, q.id, v_num, v_txt, v_date) returning id into v_answer;
		if v_opts is not null then
			insert into public.survey_answer_choices (answer_id, option_id)
				select v_answer, oid from unnest(v_opts) as oid;
		end if;
	end loop;

	return v_response;
end;
$$;

-- ---------- FIX 4: open_survey — only notify on a real null→set transition ----------
create or replace function public.open_survey(p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
	v_survey    public.surveys;
	v_was_open  boolean;
begin
	if not (select public.authorize('surveys.manage')) then
		raise exception 'surveys.manage vereist';
	end if;
	select (opens_at is not null) into v_was_open from public.surveys where id = p_id;
	if not found then raise exception 'enquête niet gevonden'; end if;

	update public.surveys set opens_at = coalesce(opens_at, now()), closes_at = null
		where id = p_id returning * into v_survey;

	if v_survey.access_mode = 'authenticated' and not v_was_open then
		insert into public.notifications (user_id, kind, title, body, payload)
		select u.user_id, 'survey.open', 'Nieuwe enquête', 'Vul de enquête in: ' || v_survey.title,
			jsonb_build_object('survey_id', p_id, 'link', '/enquete?id=' || p_id)
		from (
			select ur.user_id from public.user_roles ur
			where v_survey.audience = 'all_users'
				or (v_survey.audience = 'role' and ur.role = v_survey.audience_role)
			union
			select s.user_id from public.event_attendance a
			join public.mod_subjects s on s.id = a.subject_id
			where v_survey.audience = 'event_attendees' and a.event_id = v_survey.event_id
				and a.status in ('present', 'late') and s.user_id is not null
		) u
		where u.user_id is not null;

		insert into public.activity_log (kind, actor_id, event_id, summary)
			values ('survey.open', (select auth.uid()), v_survey.event_id, 'Enquête opengezet: ' || v_survey.title);
	end if;
end;
$$;

-- ---------- HARD ANONYMITY: results RPC (identity only when not anonymous) ----------
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
	-- For an anonymous or public survey, respondent identity is NEVER returned.
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
				'respondent', case when v_hide then null else jsonb_build_object('user_id', r.user_id) end,
				'answers', (select coalesce(jsonb_agg(jsonb_build_object(
						'question_id', a.question_id, 'value_number', a.value_number, 'value_text', a.value_text, 'value_date', a.value_date,
						'option_ids', (select coalesce(jsonb_agg(c.option_id), '[]'::jsonb) from public.survey_answer_choices c where c.answer_id = a.id)
					)), '[]'::jsonb) from public.survey_answers a where a.response_id = r.id)
			)), '[]'::jsonb) from public.survey_responses r where r.survey_id = p_id));
end;
$$;
grant execute on function public.get_survey_results(uuid) to authenticated;
