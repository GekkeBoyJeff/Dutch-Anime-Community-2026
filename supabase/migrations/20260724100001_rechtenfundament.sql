-- Rechtenfundament: 18 → 28 permissies, user_permissions als enige bron van waarheid,
-- concept/gepubliceerd op pages+structures, admin-slot, gerichte sessie-revoke.
-- Spec: docs/superpowers/specs/2026-07-24-rechtenfundament-design.md

-- ============================================================================
-- A. Enum-swap + snapshots + sloop van alles dat aan het oude type hangt
-- ============================================================================
alter type public.app_permission rename to app_permission_old;

create type public.app_permission as enum (
  'pages.create', 'pages.edit', 'pages.delete', 'structures.edit',
  'media.upload', 'media.delete',
  'site.publish_staging', 'site.approve',
  'moderation.view', 'moderation.manage', 'roles.manage',
  'events.view', 'events.manage',
  'inventory.view', 'inventory.manage',
  'expenses.view', 'expenses.review',
  'finance.view', 'finance.manage',
  'staff.view', 'staff.manage',
  'surveys.manage', 'surveys.results',
  'notifications.send', 'notifications.manage',
  'logs.view', 'badges.manage', 'records.delete'
);

-- Snapshot existing per-user grants before the tables are rebuilt.
create temp table _old_grants as
  select user_id, permission::text as permission, granted_by from public.user_permissions;

-- Capture every policy whose expression calls authorize() so it can be rebuilt against the
-- new enum. pg_policies renders the FINAL expression (later migrations already folded in),
-- which also covers policies originally created via format() loops.
create temp table _pols as
  select schemaname, tablename, policyname, cmd, array_to_string(roles, ', ') as role_list, qual, with_check
  from pg_policies
  where coalesce(qual, '') like '%authorize(%' or coalesce(with_check, '') like '%authorize(%';

do $$
declare p record;
begin
  for p in select * from _pols loop
    execute format('drop policy %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end $$;

-- SQL-language functions are parse-bound to authorize(old type): drop, rebuild in section C.
drop function public.media_is_used(text);
drop function public.media_usage(text[]);
drop function public.list_notifiable_members();
drop function public.finance_rollup(date, date, uuid);
drop function public.survey_response_counts();
drop function public.staff_overview();
drop function public.team_candidates();
drop function public.my_permissions();
drop function public.authorize(public.app_permission_old);

drop table public.user_permissions;
drop table public.role_permissions;
drop type public.app_permission_old;

-- ============================================================================
-- B. Tabellen herbouwen + presets + materialisatie + kernfuncties
-- ============================================================================
create table public.role_permissions (
  id         uuid primary key default gen_random_uuid(),
  role       public.app_role not null,
  permission public.app_permission not null,
  unique (role, permission)
);

create table public.user_permissions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  permission public.app_permission not null,
  granted_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (user_id, permission)
);

grant select on public.role_permissions to authenticated;
grant select, insert, update, delete on public.user_permissions to authenticated;
alter table public.role_permissions enable row level security;
alter table public.user_permissions  enable row level security;

-- role_permissions is a preset template: read-only lookup, changes are migrations.
create policy "role_permissions read" on public.role_permissions for select to authenticated using (true);

-- New presets (spec §2). pages.delete / media.delete / site.approve: admin-only by design.
insert into public.role_permissions (role, permission) values
  ('stand-staff','inventory.view'), ('stand-staff','events.view'),
  ('stand-staff','expenses.view'),  ('stand-staff','staff.view'),
  ('author','pages.create'), ('author','pages.edit'), ('author','structures.edit'),
  ('author','media.upload'), ('author','site.publish_staging'),
  ('author','surveys.manage'), ('author','surveys.results'),
  ('yakuza','moderation.view'), ('yakuza','moderation.manage'),
  ('yakuza','events.view'), ('yakuza','events.manage'),
  ('yakuza','inventory.view'), ('yakuza','inventory.manage'),
  ('yakuza','expenses.view'), ('yakuza','expenses.review'),
  ('yakuza','finance.view'), ('yakuza','finance.manage'),
  ('yakuza','staff.view'), ('yakuza','staff.manage'),
  ('yakuza','surveys.manage'), ('yakuza','surveys.results'),
  ('yakuza','notifications.send'), ('yakuza','notifications.manage'),
  ('yakuza','badges.manage');
insert into public.role_permissions (role, permission)
  select 'admin', p from unnest(enum_range(null::public.app_permission)) as p;

-- Old individual grant → new permission(s); 1→N where a right was split.
create temp table _perm_map_grants (old text, new text);
insert into _perm_map_grants values
  ('pages.edit','pages.edit'), ('pages.edit','pages.create'),
  ('pages.delete','pages.delete'), ('structures.edit','structures.edit'),
  ('media.manage','media.upload'), ('media.manage','media.delete'),
  ('site.publish','site.publish_staging'), ('site.publish','site.approve'),
  ('moderation.view','moderation.view'), ('moderation.manage','moderation.manage'),
  ('roles.manage','roles.manage'),
  ('inventory.view','inventory.view'), ('inventory.view','events.view'),
  ('inventory.manage','inventory.manage'), ('inventory.manage','events.manage'),
  ('expenses.view','expenses.view'),
  ('expenses.manage','expenses.review'), ('expenses.manage','finance.view'), ('expenses.manage','finance.manage'),
  ('logs.view','logs.view'), ('badges.manage','badges.manage'), ('records.delete','records.delete'),
  ('notifications.send','notifications.send'), ('notifications.send','notifications.manage'),
  ('surveys.manage','surveys.manage'), ('surveys.manage','surveys.results'),
  ('staff.manage','staff.manage'), ('staff.manage','staff.view');

-- Materialise every user's effective set: NEW preset of their role ∪ translated old grants.
-- Existing authors deliberately lose delete/approve here (spec §8.3).
insert into public.user_permissions (user_id, permission, granted_by)
select user_id, permission, granted_by from (
  select ur.user_id, rp.permission, null::uuid as granted_by
  from public.user_roles ur
  join public.role_permissions rp on rp.role = ur.role
  union
  select og.user_id, m.new::public.app_permission, og.granted_by
  from _old_grants og
  join _perm_map_grants m on m.old = og.permission
) s
on conflict (user_id, permission) do nothing;

-- authorize()/my_permissions(): user_permissions is now the single source of truth.
create function public.authorize(requested_permission public.app_permission)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.user_permissions up
    where up.user_id = (select auth.uid()) and up.permission = requested_permission
  );
$$;

create function public.my_permissions()
returns setof public.app_permission language sql stable security definer set search_path = '' as $$
  select up.permission from public.user_permissions up
  where up.user_id = (select auth.uid());
$$;

grant execute on function public.authorize(public.app_permission) to authenticated;
grant execute on function public.my_permissions() to authenticated;

-- ============================================================================
-- C. Alle authorize()-policies hersmeden op het nieuwe enum
-- ============================================================================
-- (table-pattern, cmd, old, new): specifiekste eerst (prio). Literals die niet in de map
-- staan behouden hun naam (die bestaat in het nieuwe enum). user_roles/user_permissions
-- worden NIET dynamisch hersteld — die krijgen in sectie D nieuwe admin-slot-policies.
create temp table _pol_map (tbl_pattern text, cmd text, old text, new text, prio int);
insert into _pol_map values
  ('pages',              'INSERT', 'pages.edit',         'pages.create',         1),
  ('objects',            'INSERT', 'media.manage',       'media.upload',         1),
  ('objects',            'UPDATE', 'media.manage',       'media.upload',         1),
  ('objects',            'DELETE', 'media.manage',       'media.delete',         1),
  ('objects',            null,     'inventory.manage',   'events.manage',        1),
  ('org_income',         null,     'expenses.manage',    'finance.manage',       1),
  ('notification_types', null,     'notifications.send', 'notifications.manage', 1),
  ('event%',             null,     'inventory.manage',   'events.manage',        2),
  ('event%',             null,     'inventory.view',     'events.view',          2),
  ('%',                  null,     'expenses.manage',    'expenses.review',      3);

do $$
declare p record; m record; new_qual text; new_check text; stmt text;
begin
  for p in select * from _pols where not (schemaname = 'public' and tablename in ('user_roles', 'user_permissions', 'role_permissions')) loop
    new_qual := p.qual; new_check := p.with_check;
    for m in
      select * from _pol_map
      where p.tablename like tbl_pattern and (cmd is null or cmd = p.cmd)
      order by prio
    loop
      new_qual  := replace(new_qual,  '''' || m.old || '''', '''' || m.new || '''');
      new_check := replace(new_check, '''' || m.old || '''', '''' || m.new || '''');
    end loop;
    new_qual  := replace(new_qual,  'app_permission_old', 'app_permission');
    new_check := replace(new_check, 'app_permission_old', 'app_permission');
    stmt := format('create policy %I on %I.%I for %s to %s', p.policyname, p.schemaname, p.tablename, lower(p.cmd), p.role_list);
    if new_qual  is not null then stmt := stmt || format(' using (%s)', new_qual); end if;
    if new_check is not null then stmt := stmt || format(' with check (%s)', new_check); end if;
    execute stmt;
  end loop;
end $$;

-- ============================================================================
-- C2. Herbouw van de gedropte SQL-functies
-- ============================================================================
-- Guard is about DELETING media (spec §7); the usage overview serves the upload UI.
-- Source: 20260719190002_fased_media_usage.sql, media.manage → media.delete / media.upload.
create function public.media_is_used(p_name text)
returns boolean language sql stable security definer set search_path = '' as $$
  select (select public.authorize('media.delete'))
     and coalesce(p_name, '') <> ''
     and exists (select 1 from public.pages pg where strpos(pg.data::text, p_name) > 0);
$$;
grant execute on function public.media_is_used(text) to authenticated;

create function public.media_usage(paths text[])
returns table(media_path text, page_path text, page_title text)
language sql stable security definer set search_path = '' as $$
  select p.path, pg.path, coalesce(nullif(pg.data->'meta'->>'title', ''), pg.path)
  from unnest(paths) as p(path)
  join public.pages pg on p.path <> '' and strpos(pg.data::text, p.path) > 0
  where (select public.authorize('media.upload'));
$$;
grant execute on function public.media_usage(text[]) to authenticated;

-- Unchanged permission; recreated only because it was parse-bound to the old enum.
-- Source: 20260717150001_fase8_notifiable_members.sql.
create function public.list_notifiable_members()
returns table(id uuid, username text)
language sql stable security definer set search_path = '' as $$
  select p.id, p.username from public.profiles p
  where (select public.authorize('notifications.send'))
  order by p.username;
$$;
grant execute on function public.list_notifiable_members() to authenticated;

-- Source: 20260719140002_fasec_income.sql (nieuwste versie, met de org_income-union).
-- Beide voorkomens expenses.manage → finance.view.
create function public.finance_rollup(
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
	categorie    text,
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
		e.category::text,
		e.description,
		e.incurred_on,
		e.amount_eur,
		e.status
	from public.expenses e
	left join public.events ev on ev.id = e.event_id
	where (select public.authorize('finance.view'))
		and e.archived_at is null
		and (p_from is null or e.incurred_on >= p_from)
		and (p_to is null or e.incurred_on <= p_to)
		and (p_event_id is null or e.event_id = p_event_id)
	union all
	select
		i.id,
		'inkomst'::text,
		'inkomsten'::text,
		i.event_id,
		ev.name,
		i.category::text,
		i.description,
		i.received_on,
		i.amount_eur,
		null::public.expense_status
	from public.org_income i
	left join public.events ev on ev.id = i.event_id
	where (select public.authorize('finance.view'))
		and (p_from is null or i.received_on >= p_from)
		and (p_to is null or i.received_on <= p_to)
		and (p_event_id is null or i.event_id = p_event_id);
$$;
grant execute on function public.finance_rollup(date, date, uuid) to authenticated;

-- Source: 20260718160004_survey_response_counts.sql. surveys.manage → surveys.results.
create function public.survey_response_counts()
returns table (survey_id uuid, response_count bigint)
language sql security definer set search_path = '' as $$
	select r.survey_id, count(*)
	from public.survey_responses r
	where (select public.authorize('surveys.results'))
	group by r.survey_id;
$$;
grant execute on function public.survey_response_counts() to authenticated;

-- Source: 20260719150002_fasec_staff.sql. staff.manage → staff.view.
create function public.staff_overview()
returns table (
	user_id               uuid,
	subject_id            uuid,
	display_name          text,
	avatar_url            text,
	discord_tag           text,
	role                  public.app_role,
	next_shift_at         timestamptz,
	next_shift_event_id   uuid,
	next_shift_event_name text,
	open_warnings         integer
)
language sql stable security definer set search_path = '' as $$
	select
		ur.user_id,
		s.id as subject_id,
		coalesce(p.guild_nick, p.global_name, p.username, s.discord_name, left(ur.user_id::text, 8)) as display_name,
		p.avatar_url,
		coalesce(p.username, s.discord_name) as discord_tag,
		ur.role,
		ns.starts_at as next_shift_at,
		ns.event_id as next_shift_event_id,
		ns.event_name as next_shift_event_name,
		coalesce(w.open_warnings, 0)::integer as open_warnings
	from public.user_roles ur
	join public.profiles p on p.id = ur.user_id
	left join public.mod_subjects s on s.user_id = ur.user_id
	left join lateral (
		select sh.starts_at, e.id as event_id, e.name as event_name
		from public.event_shifts sh
		join public.events e on e.id = sh.event_id
		where sh.subject_id = s.id and sh.starts_at >= now()
		order by sh.starts_at
		limit 1
	) ns on true
	left join lateral (
		select count(*) as open_warnings
		from public.mod_warnings mw
		where mw.subject_id = s.id and mw.removed_at is null
	) w on true
	where (select public.authorize('staff.view'))
		and ur.role in ('stand-staff', 'yakuza')
	order by ur.role desc, display_name;
$$;
grant execute on function public.staff_overview() to authenticated;

-- Source: 20260719200001_fasef_team_candidates.sql. inventory.manage → staff.manage
-- (het is de picker vóór teambeheer).
create function public.team_candidates()
returns table (
	subject_id   uuid,
	display_name text
)
language sql stable security definer set search_path = '' as $$
	select
		s.id as subject_id,
		coalesce(p.guild_nick, p.global_name, p.username, s.discord_name, left(s.id::text, 8)) as display_name
	from public.mod_subjects s
	join public.profiles p on p.id = s.user_id
	join public.user_roles ur on ur.user_id = s.user_id
	where (select public.authorize('staff.manage'))
		and ur.role in ('stand-staff', 'yakuza', 'admin')
	order by display_name;
$$;
grant execute on function public.team_candidates() to authenticated;

-- ============================================================================
-- C3. plpgsql-RPC's her-gaten op het nieuwe enum
-- ============================================================================
-- plpgsql-bodies zijn niet type-gebonden en bestaan nog; alleen de literal wijzigt hier.
-- Source: 20260717100002_fase5_expenses.sql. expenses.manage → expenses.review.
create or replace function public.review_expense(p_id uuid, p_status public.expense_status, p_note text default null)
returns public.expenses language plpgsql security definer set search_path = '' as $$
declare
	rec public.expenses;
begin
	if not (select public.authorize('expenses.review')) then
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

-- Source: 20260717090011_fase3_complete_event.sql. inventory.manage → events.manage.
create or replace function public.complete_event(target_event uuid, present_subjects uuid[])
returns void language plpgsql security definer set search_path = '' as $$
begin
	if not (select public.authorize('events.manage')) then
		raise exception 'inventory.manage vereist';
	end if;

	update public.event_attendance set status = 'present'
		where event_id = target_event and subject_id = any(present_subjects) and status in ('signed_up', 'expected', 'late');
	update public.event_attendance set status = 'no_show'
		where event_id = target_event and status in ('signed_up', 'expected') and not (subject_id = any(present_subjects));

	update public.event_shifts set locked_at = now() where event_id = target_event and locked_at is null;

	insert into public.inventory_history (item_id, event_id, note, recorded_by)
		select a.item_id, a.event_id, 'Event afgerond', (select auth.uid())
		from public.event_item_assignments a where a.event_id = target_event;

	insert into public.activity_log (kind, actor_id, event_id, summary)
		values ('event.completed', (select auth.uid()), target_event, 'Event afgerond');
end;
$$;
grant execute on function public.complete_event(uuid, uuid[]) to authenticated;

-- Source: 20260717090008_fase3_shifts.sql. inventory.manage → events.manage.
create or replace function public.apply_shift_swap(request_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
	req      public.shift_swap_requests;
	ev_start date;
begin
	select * into req from public.shift_swap_requests where id = request_id for update;
	if req.id is null then raise exception 'verzoek niet gevonden'; end if;
	if req.status <> 'pending' then raise exception 'verzoek is al afgehandeld'; end if;
	if not (req.to_subject = (select public.my_subject_id()) or (select public.authorize('events.manage'))) then
		raise exception 'alleen de ontvanger of een beheerder mag de ruil toepassen';
	end if;

	select e.starts_on into ev_start
	from public.event_shifts s join public.events e on e.id = s.event_id
	where s.id = req.shift_id;
	if ev_start is not null and (now() at time zone 'Europe/Amsterdam')::date >= ev_start then
		raise exception 'ruilen kan niet meer vanaf de startdag van het event';
	end if;

	update public.event_shifts set subject_id = req.to_subject where id = req.shift_id;
	update public.shift_swap_requests set status = 'accepted', decided_at = now() where id = req.id;
end;
$$;
grant execute on function public.apply_shift_swap(uuid) to authenticated;

-- Source: 20260717090012_fase3a_review_fixes.sql (swap-beslis-RPC's, accept/decline).
-- Beide voorkomens inventory.manage → events.manage.
create or replace function public.cancel_swap(request_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare req public.shift_swap_requests;
begin
	select * into req from public.shift_swap_requests where id = request_id for update;
	if req.id is null then raise exception 'verzoek niet gevonden'; end if;
	if not (req.from_subject = (select public.my_subject_id()) or (select public.authorize('events.manage'))) then
		raise exception 'alleen de aanvrager of een beheerder mag annuleren';
	end if;
	if req.status <> 'pending' then raise exception 'verzoek is al afgehandeld'; end if;
	update public.shift_swap_requests set status = 'cancelled', decided_at = now() where id = req.id;
end;
$$;
grant execute on function public.cancel_swap(uuid) to authenticated;

create or replace function public.apply_shift_swap(request_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
	req      public.shift_swap_requests;
	sh       public.event_shifts;
	ev_start date;
begin
	select * into req from public.shift_swap_requests where id = request_id for update;
	if req.id is null then raise exception 'verzoek niet gevonden'; end if;
	if req.status <> 'pending' then raise exception 'verzoek is al afgehandeld'; end if;
	if not (req.to_subject = (select public.my_subject_id()) or (select public.authorize('events.manage'))) then
		raise exception 'alleen de ontvanger of een beheerder mag de ruil toepassen';
	end if;

	select * into sh from public.event_shifts where id = req.shift_id for update;
	if sh.id is null then raise exception 'shift niet gevonden'; end if;
	if sh.subject_id is distinct from req.from_subject then raise exception 'de shift is inmiddels gewijzigd'; end if;
	if sh.locked_at is not null then raise exception 'de shift is vergrendeld'; end if;

	select e.starts_on into ev_start from public.events e where e.id = sh.event_id;
	if ev_start is null or (now() at time zone 'Europe/Amsterdam')::date >= ev_start then
		raise exception 'ruilen kan alleen vóór de startdag van het event';
	end if;

	update public.event_shifts set subject_id = req.to_subject where id = sh.id;
	update public.shift_swap_requests set status = 'accepted', decided_at = now() where id = req.id;
end;
$$;
grant execute on function public.apply_shift_swap(uuid) to authenticated;

-- Source: 20260718160005_survey_results_extras.sql (nieuwste versie, met respondent-naam).
-- surveys.manage → surveys.results.
create or replace function public.get_survey_results(p_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
	v_survey public.surveys;
	v_hide   boolean;
begin
	if not (select public.authorize('surveys.results')) then
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
