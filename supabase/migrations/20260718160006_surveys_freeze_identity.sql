-- Adversarial-review-fix (Brok D): "harde anonimiteit" lekte via muteerbare vlaggen. Een surveys.manage-
-- houder (incl. author) kon een anonieme enquête laten invullen — user_id wordt bij authenticated altijd
-- opgeslagen — en daarna `anonymous`/`access_mode` omzetten, waarna get_survey_results de namen alsnog gaf.
-- Fix: bevries anonymous + access_mode zodra de enquête is opengezet (opens_at gezet).
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

-- Defense-in-depth: individuele inzendingen zijn nergens los verwijderbaar in de UI (alleen de hele
-- enquête via hard_delete, dat cascadeert). Haal de directe DELETE-policies weg zodat er geen
-- DELETE ... RETURNING-oppervlak op respondent-data bestaat; de cascade omzeilt RLS en blijft werken.
drop policy "survey_responses delete" on public.survey_responses;
drop policy "survey_answers delete" on public.survey_answers;
drop policy "survey_answer_choices delete" on public.survey_answer_choices;
