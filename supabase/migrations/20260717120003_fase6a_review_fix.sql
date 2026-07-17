-- Fase 6a review-fix (2× HIGH, merge-integriteit).

-- FIX 1 (HIGH): de rang-regel las de rang van het LETTERLIJKE subject i.p.v. de merge-cluster. Een yakuza
-- kon zo een schaduw (rang 0) mergen ín het subject van een yakuza/admin en die schaduw warnen/bannen — de
-- warning/ban komt via canonical_subject_id() op het slachtoffer terecht (zichtbaar in my_warnings). Voortaan
-- telt de HOOGSTE rang over de héle merge-cluster (mergen kán ook een echt subject ín een schaduw, waardoor
-- de canonical-rij zelf rang 0 zou zijn — max over de cluster dekt beide richtingen af).
create or replace function public.subject_cluster_rank(p_subject uuid)
returns int language sql stable security definer set search_path = '' as $$
	select coalesce(max(public.role_rank_of(s.user_id)), 0)
	from public.mod_subjects s
	where public.canonical_subject_id(s.id) = public.canonical_subject_id(p_subject);
$$;
grant execute on function public.subject_cluster_rank(uuid) to authenticated;

drop policy if exists "warnings write" on public.mod_warnings;
create policy "warnings write" on public.mod_warnings for insert to authenticated
	with check (
		public.role_rank_of((select auth.uid())) >= 2
		and public.role_rank_of((select auth.uid())) > public.subject_cluster_rank(mod_warnings.subject_id)
	);
drop policy if exists "warnings update" on public.mod_warnings;
create policy "warnings update" on public.mod_warnings for update to authenticated
	using (
		(select public.authorize('moderation.manage'))
		and public.role_rank_of((select auth.uid())) >= 2
		and public.role_rank_of((select auth.uid())) > public.subject_cluster_rank(mod_warnings.subject_id)
	)
	with check (
		(select public.authorize('moderation.manage'))
		and public.role_rank_of((select auth.uid())) >= 2
		and public.role_rank_of((select auth.uid())) > public.subject_cluster_rank(mod_warnings.subject_id)
	);

drop policy if exists "bans write" on public.mod_bans;
create policy "bans write" on public.mod_bans for insert to authenticated
	with check (
		public.role_rank_of((select auth.uid())) >= 2
		and public.role_rank_of((select auth.uid())) > public.subject_cluster_rank(mod_bans.subject_id)
	);
drop policy if exists "bans update" on public.mod_bans;
create policy "bans update" on public.mod_bans for update to authenticated
	using (
		(select public.authorize('moderation.manage'))
		and public.role_rank_of((select auth.uid())) >= 2
		and public.role_rank_of((select auth.uid())) > public.subject_cluster_rank(mod_bans.subject_id)
	)
	with check (
		(select public.authorize('moderation.manage'))
		and public.role_rank_of((select auth.uid())) >= 2
		and public.role_rank_of((select auth.uid())) > public.subject_cluster_rank(mod_bans.subject_id)
	);

-- conduct_notes erft dezelfde merge-transparantie-gap (rang-regel op letterlijk subject) → zelfde fix.
drop policy if exists "conduct write" on public.conduct_notes;
create policy "conduct write" on public.conduct_notes for insert to authenticated
	with check (
		public.role_rank_of((select auth.uid())) >= 2
		and public.role_rank_of((select auth.uid())) > public.subject_cluster_rank(conduct_notes.subject_id)
	);
drop policy if exists "conduct update" on public.conduct_notes;
create policy "conduct update" on public.conduct_notes for update to authenticated
	using (
		(select public.authorize('moderation.manage'))
		and public.role_rank_of((select auth.uid())) >= 2
		and public.role_rank_of((select auth.uid())) > public.subject_cluster_rank(conduct_notes.subject_id)
	)
	with check (
		(select public.authorize('moderation.manage'))
		and public.role_rank_of((select auth.uid())) >= 2
		and public.role_rank_of((select auth.uid())) > public.subject_cluster_rank(conduct_notes.subject_id)
	);

-- FIX 2 (HIGH): de cyclus-guard (`canonical(p_into) = p_from`) ving p_from alléén als TERMINALE root van
-- p_into's keten, niet als tussenknoop; en een al-gemergde bron kon opnieuw gemerged worden → meerhops-
-- cyclus → canonical_subject_id() geeft verkeerde roots → my_warnings() breekt. Voortaan: bron moet nog
-- ongemerged zijn, en we lopen p_into's héle keten af en weigeren als p_from er ergens in zit.
create or replace function public.merge_subjects(p_from uuid, p_into uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
	cur  uuid := p_into;
	hops int := 0;
begin
	if not (select public.authorize('moderation.manage')) then
		raise exception 'moderation.manage vereist';
	end if;
	if p_from = p_into then
		raise exception 'kan een profiel niet in zichzelf samenvoegen';
	end if;
	if exists (select 1 from public.mod_subjects where id = p_from and merged_into is not null) then
		raise exception 'dit profiel is al samengevoegd; koppel het eerst los';
	end if;
	loop
		if cur is null then exit; end if;
		if cur = p_from then
			raise exception 'samenvoegen zou een cyclus maken';
		end if;
		select merged_into into cur from public.mod_subjects where id = cur;
		hops := hops + 1;
		if hops > 20 then exit; end if;
	end loop;

	update public.mod_subjects set merged_into = p_into, updated_at = now() where id = p_from;
	insert into public.activity_log (kind, actor_id, subject_id, summary)
	values ('subject.merged', (select auth.uid()), p_from, 'Profiel samengevoegd met een ander profiel');
end;
$$;
