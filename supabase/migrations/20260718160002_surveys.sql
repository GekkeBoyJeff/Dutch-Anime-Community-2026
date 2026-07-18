-- Enquêtes & polls — tabellen, RLS, RPC's (respondent-lezen/-schrijven ook voor anon → static-export-safe,
-- geen Edge Function), permissie-seed en hard_delete-tak. Spec: docs/superpowers/specs/2026-07-18-surveys-design.md.

-- ---------- Tabellen ----------
create table public.surveys (
	id            uuid primary key default gen_random_uuid(),
	title         text not null,
	description   text,
	access_mode   public.survey_access_mode not null default 'authenticated',
	anonymous     boolean not null default false,
	audience      public.survey_audience not null default 'all_users',
	audience_role public.app_role,
	event_id      uuid references public.events(id) on delete set null,
	opens_at      timestamptz,
	closes_at     timestamptz,
	archived_at   timestamptz,
	archived_by   uuid references auth.users(id),
	created_by    uuid default auth.uid(),
	created_at    timestamptz not null default now(),
	updated_at    timestamptz not null default now(),
	constraint audience_needs_role check (audience <> 'role' or audience_role is not null),
	constraint audience_needs_event check (audience <> 'event_attendees' or event_id is not null)
);
create trigger set_updated_at before update on public.surveys for each row execute function public.set_updated_at();
create trigger audit_surveys after insert or update or delete on public.surveys for each row execute function public.log_audit();

create table public.survey_questions (
	id        uuid primary key default gen_random_uuid(),
	survey_id uuid not null references public.surveys(id) on delete cascade,
	position  int not null default 0,
	label     text not null,
	kind      public.survey_question_kind not null,
	required  boolean not null default false
);
create index survey_questions_survey on public.survey_questions (survey_id);
create trigger audit_survey_questions after insert or update or delete on public.survey_questions for each row execute function public.log_audit();

create table public.survey_question_options (
	id          uuid primary key default gen_random_uuid(),
	question_id uuid not null references public.survey_questions(id) on delete cascade,
	position    int not null default 0,
	label       text not null
);
create index survey_question_options_question on public.survey_question_options (question_id);
create trigger audit_survey_question_options after insert or update or delete on public.survey_question_options for each row execute function public.log_audit();

create table public.survey_responses (
	id           uuid primary key default gen_random_uuid(),
	survey_id    uuid not null references public.surveys(id) on delete cascade,
	user_id      uuid references auth.users(id) on delete set null,
	submitted_at timestamptz not null default now(),
	unique (survey_id, user_id)
);
create index survey_responses_survey on public.survey_responses (survey_id);

create table public.survey_answers (
	id           uuid primary key default gen_random_uuid(),
	response_id  uuid not null references public.survey_responses(id) on delete cascade,
	question_id  uuid not null references public.survey_questions(id) on delete cascade,
	value_number numeric,
	value_text   text,
	value_date   date
);
create index survey_answers_response on public.survey_answers (response_id);

create table public.survey_answer_choices (
	id        uuid primary key default gen_random_uuid(),
	answer_id uuid not null references public.survey_answers(id) on delete cascade,
	option_id uuid not null references public.survey_question_options(id) on delete cascade
);
create index survey_answer_choices_answer on public.survey_answer_choices (answer_id);
create index survey_answer_choices_option on public.survey_answer_choices (option_id);

-- ---------- Grants + RLS ----------
grant select on public.surveys, public.survey_questions, public.survey_question_options,
	public.survey_responses, public.survey_answers, public.survey_answer_choices to authenticated;
grant select, insert, update, delete on public.surveys, public.survey_questions, public.survey_question_options,
	public.survey_responses, public.survey_answers, public.survey_answer_choices to service_role;

alter table public.surveys enable row level security;
alter table public.survey_questions enable row level security;
alter table public.survey_question_options enable row level security;
alter table public.survey_responses enable row level security;
alter table public.survey_answers enable row level security;
alter table public.survey_answer_choices enable row level security;

-- Definitie-tabellen: alleen beheer (respondent leest via get_survey_for_fill-RPC, niet hier).
create policy "surveys manage" on public.surveys for all to authenticated
	using ((select public.authorize('surveys.manage'))) with check ((select public.authorize('surveys.manage')));
create policy "survey_questions manage" on public.survey_questions for all to authenticated
	using ((select public.authorize('surveys.manage'))) with check ((select public.authorize('surveys.manage')));
create policy "survey_question_options manage" on public.survey_question_options for all to authenticated
	using ((select public.authorize('surveys.manage'))) with check ((select public.authorize('surveys.manage')));

-- Inzendingen: eigen rij ∪ surveys.manage lezen; verwijderen alleen records.delete; schrijven uitsluitend via RPC.
create policy "survey_responses read" on public.survey_responses for select to authenticated
	using (user_id = (select auth.uid()) or (select public.authorize('surveys.manage')));
create policy "survey_responses delete" on public.survey_responses for delete to authenticated
	using ((select public.authorize('records.delete')));

create policy "survey_answers read" on public.survey_answers for select to authenticated
	using (exists (
		select 1 from public.survey_responses r
		where r.id = survey_answers.response_id
			and (r.user_id = (select auth.uid()) or (select public.authorize('surveys.manage')))));
create policy "survey_answers delete" on public.survey_answers for delete to authenticated
	using ((select public.authorize('records.delete')));

create policy "survey_answer_choices read" on public.survey_answer_choices for select to authenticated
	using (exists (
		select 1 from public.survey_answers a
		join public.survey_responses r on r.id = a.response_id
		where a.id = survey_answer_choices.answer_id
			and (r.user_id = (select auth.uid()) or (select public.authorize('surveys.manage')))));
create policy "survey_answer_choices delete" on public.survey_answer_choices for delete to authenticated
	using ((select public.authorize('records.delete')));

-- ---------- RPC: lezen om in te vullen (anon + authenticated) ----------
create or replace function public.get_survey_for_fill(p_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
	v_survey    public.surveys;
	v_uid       uuid := (select auth.uid());
	v_eligible  boolean := false;
	v_submitted boolean := false;
	v_questions jsonb;
	v_answers   jsonb := null;
begin
	select * into v_survey from public.surveys where id = p_id;
	if not found or v_survey.archived_at is not null then
		return jsonb_build_object('error', 'niet gevonden');
	end if;
	if not (v_survey.opens_at is not null and now() >= v_survey.opens_at
		and (v_survey.closes_at is null or now() < v_survey.closes_at)) then
		return jsonb_build_object('error', 'gesloten');
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

	return jsonb_build_object(
		'survey', jsonb_build_object('id', v_survey.id, 'title', v_survey.title, 'description', v_survey.description,
			'access_mode', v_survey.access_mode, 'anonymous', v_survey.anonymous),
		'questions', v_questions,
		'eligible', v_eligible,
		'already_submitted', v_submitted,
		'my_answers', v_answers);
end;
$$;
grant execute on function public.get_survey_for_fill(uuid) to anon, authenticated;

-- ---------- RPC: indienen (anon + authenticated) ----------
create or replace function public.submit_survey_response(p_id uuid, p_answers jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
	v_survey   public.surveys;
	v_uid      uuid := (select auth.uid());
	v_eligible boolean := false;
	v_response uuid;
	v_answer   uuid;
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
		raise exception 'enquête niet gevonden';
	end if;
	if not (v_survey.opens_at is not null and now() >= v_survey.opens_at
		and (v_survey.closes_at is null or now() < v_survey.closes_at)) then
		raise exception 'enquête is niet open';
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

	for q in select * from public.survey_questions where survey_id = p_id loop
		v_num := null; v_txt := null; v_date := null; v_opts := null; v_valid := false;

		select e.value into v_ans
		from jsonb_array_elements(coalesce(p_answers, '[]'::jsonb)) as e
		where (e.value->>'question_id')::uuid = q.id limit 1;

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
				select array_agg(t.value::uuid) into v_opts
				from jsonb_array_elements_text(coalesce(v_ans->'option_ids', '[]'::jsonb)) as t;
				if v_opts is not null and array_length(v_opts, 1) >= 1
					and (q.kind <> 'single_choice' or array_length(v_opts, 1) = 1)
					and not exists (
						select 1 from unnest(v_opts) as oid
						where not exists (select 1 from public.survey_question_options o where o.id = oid and o.question_id = q.id))
				then v_valid := true; end if;
			end if;
		end if;

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
grant execute on function public.submit_survey_response(uuid, jsonb) to anon, authenticated;

-- ---------- RPC: openzetten (+ notificatie) / sluiten ----------
create or replace function public.open_survey(p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
	v_survey public.surveys;
begin
	if not (select public.authorize('surveys.manage')) then
		raise exception 'surveys.manage vereist';
	end if;
	update public.surveys set opens_at = coalesce(opens_at, now()), closes_at = null
		where id = p_id returning * into v_survey;
	if not found then raise exception 'enquête niet gevonden'; end if;

	if v_survey.access_mode = 'authenticated' then
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
	end if;

	insert into public.activity_log (kind, actor_id, event_id, summary)
		values ('survey.open', (select auth.uid()), v_survey.event_id, 'Enquête opengezet: ' || v_survey.title);
end;
$$;
grant execute on function public.open_survey(uuid) to authenticated;

create or replace function public.close_survey(p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
	if not (select public.authorize('surveys.manage')) then
		raise exception 'surveys.manage vereist';
	end if;
	update public.surveys set closes_at = now() where id = p_id;
	if not found then raise exception 'enquête niet gevonden'; end if;
end;
$$;
grant execute on function public.close_survey(uuid) to authenticated;

-- ---------- RPC: eigen openstaande enquêtes (taakkaart) ----------
create or replace function public.my_open_surveys()
returns table (survey_id uuid, title text, closes_at timestamptz, question_count bigint)
language plpgsql security definer set search_path = '' as $$
declare
	v_uid     uuid := (select auth.uid());
	v_subject uuid := (select public.my_subject_id());
begin
	if v_uid is null then return; end if;
	return query
	select s.id, s.title, s.closes_at,
		(select count(*) from public.survey_questions q where q.survey_id = s.id)
	from public.surveys s
	where s.access_mode = 'authenticated' and s.archived_at is null
		and s.opens_at is not null and now() >= s.opens_at
		and (s.closes_at is null or now() < s.closes_at)
		and (
			s.audience = 'all_users'
			or (s.audience = 'role' and exists (select 1 from public.user_roles ur where ur.user_id = v_uid and ur.role = s.audience_role))
			or (s.audience = 'event_attendees' and exists (select 1 from public.event_attendance a
				where a.event_id = s.event_id and a.subject_id = v_subject and a.status in ('present', 'late')))
		)
		and not exists (select 1 from public.survey_responses r where r.survey_id = s.id and r.user_id = v_uid);
end;
$$;
grant execute on function public.my_open_surveys() to authenticated;

-- ---------- Permissie-seed ----------
insert into public.role_permissions (role, permission) values
	('admin', 'surveys.manage'), ('yakuza', 'surveys.manage'), ('author', 'surveys.manage')
on conflict (role, permission) do nothing;

-- ---------- hard_delete: surveys-tak (cascade ruimt de rest; geen storage) ----------
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
		return query
			select 'mod-evidence'::text, le.storage_path
			from public.mod_link_evidence le
			join public.mod_subject_links l on l.id = le.link_id
			where (l.subject_low = target_id or l.subject_high = target_id) and le.storage_path is not null;
		return query
			select 'badges'::text, b.image_path
			from public.badges b
			where b.subject_id = target_id and b.image_path is not null;
		delete from public.mod_subjects where id = target_id;

	elsif target_table = 'mod_warnings' then
		return query
			select 'mod-evidence'::text, e.storage_path
			from public.mod_evidence e
			where e.warning_id = target_id and e.storage_path is not null;
		delete from public.mod_warnings where id = target_id;

	elsif target_table = 'mod_subject_links' then
		return query
			select 'mod-evidence'::text, le.storage_path
			from public.mod_link_evidence le
			where le.link_id = target_id and le.storage_path is not null;
		delete from public.mod_subject_links where id = target_id;

	elsif target_table = 'mod_bans' then
		delete from public.mod_bans where id = target_id;

	elsif target_table = 'badges' then
		return query
			select 'badges'::text, b.image_path
			from public.badges b
			where b.id = target_id and b.image_path is not null;
		delete from public.badges where id = target_id;

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

	elsif target_table = 'surveys' then
		delete from public.surveys where id = target_id;

	else
		raise exception 'hard_delete: niet-ondersteunde tabel %', target_table;
	end if;
end;
$$;
