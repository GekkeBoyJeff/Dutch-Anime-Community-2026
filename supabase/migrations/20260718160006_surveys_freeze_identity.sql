-- "Hard anonymity" leaked via mutable flags: a surveys.manage holder (incl. author) could let an
-- anonymous survey be filled in — user_id is always stored for authenticated — then flip
-- `anonymous`/`access_mode` afterward, so get_survey_results still returned names. Fix: freeze
-- anonymous + access_mode once the survey has been opened (opens_at set).
create or replace function public.survey_lock_identity_flags()
returns trigger language plpgsql set search_path = '' as $$
begin
	if old.opens_at is not null
		and (new.anonymous is distinct from old.anonymous or new.access_mode is distinct from old.access_mode) then
		raise exception 'anonimiteit/toegang zijn niet meer te wijzigen nadat de enquête is opengezet';
	end if;
	return new;
end;
$$;
create trigger surveys_lock_identity_flags before update on public.surveys
	for each row execute function public.survey_lock_identity_flags();

-- Defense-in-depth: individual submissions aren't separately deletable anywhere in the UI (only
-- the whole survey via hard_delete, which cascades). Drop the direct DELETE policies so there's
-- no DELETE ... RETURNING surface on respondent data; the cascade bypasses RLS and keeps working.
drop policy "survey_responses delete" on public.survey_responses;
drop policy "survey_answers delete" on public.survey_answers;
drop policy "survey_answer_choices delete" on public.survey_answer_choices;
