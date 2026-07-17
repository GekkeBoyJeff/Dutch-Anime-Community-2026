-- Fase 3a review-fixes (fix-forward; de 3b-UI bestaat nog niet, dus geen client raakt deze tabellen).

-- FIX 1+3+5 (HIGH/med/low): shift-ruil dichttimmeren. De directe "swap cancel"-UPDATE-policy was
-- kolom-blind (from_subject kon shift_id/to_subject herrichten of status direct op 'accepted' zetten).
-- Beide mutaties (annuleren, toepassen) gaan voortaan via SECURITY DEFINER-RPC's; geen client-UPDATE meer.
drop policy if exists "swap cancel" on public.shift_swap_requests;

create or replace function public.cancel_swap(request_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare req public.shift_swap_requests;
begin
	select * into req from public.shift_swap_requests where id = request_id for update;
	if req.id is null then raise exception 'verzoek niet gevonden'; end if;
	if not (req.from_subject = (select public.my_subject_id()) or (select public.authorize('inventory.manage'))) then
		raise exception 'alleen de aanvrager of een beheerder mag annuleren';
	end if;
	if req.status <> 'pending' then raise exception 'verzoek is al afgehandeld'; end if;
	update public.shift_swap_requests set status = 'cancelled', decided_at = now() where id = req.id;
end;
$$;
grant execute on function public.cancel_swap(uuid) to authenticated;

-- apply_shift_swap: nu ook de shift met FOR UPDATE herlezen + eisen dat 'ie nog van from_subject is en
-- niet vergrendeld, en een dateless event blokkeren (conservatief).
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
	if not (req.to_subject = (select public.my_subject_id()) or (select public.authorize('inventory.manage'))) then
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

-- FIX 2 (HIGH): conduct_notes UPDATE spiegelt nu de rang-regel van INSERT (USING op de OUDE rij, WITH
-- CHECK op de NIEUWE), zodat een moderator een notitie niet kan herrichten naar of bewerken over iemand
-- van gelijke/hogere rang.
drop policy if exists "conduct update" on public.conduct_notes;
create policy "conduct update" on public.conduct_notes for update to authenticated
	using (
		(select public.authorize('moderation.manage'))
		and public.role_rank_of((select auth.uid())) >= 2
		and public.role_rank_of((select auth.uid())) > (select public.role_rank_of(s.user_id) from public.mod_subjects s where s.id = conduct_notes.subject_id)
	)
	with check (
		(select public.authorize('moderation.manage'))
		and public.role_rank_of((select auth.uid())) >= 2
		and public.role_rank_of((select auth.uid())) > (select public.role_rank_of(s.user_id) from public.mod_subjects s where s.id = conduct_notes.subject_id)
	);

-- FIX 4 (MEDIUM): packed_at niet meer via een kolom-blinde eigen-UPDATE-policy (assignee kon quantity/
-- item_id e.d. wijzigen), maar via een RPC die alléén packed_at op de eigen toewijzing zet.
drop policy if exists "assignments own packed" on public.event_item_assignments;
create or replace function public.set_packed(assignment_id uuid, packed boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
	update public.event_item_assignments
		set packed_at = case when packed then now() else null end
		where id = assignment_id and assigned_user_id = (select auth.uid());
	if not found then raise exception 'niet jouw toewijzing'; end if;
end;
$$;
grant execute on function public.set_packed(uuid, boolean) to authenticated;

-- FIX 6 (LOW): eigen signed_up niet meer intrekbaar zodra de eventstartdag is aangebroken.
drop policy if exists "attendance self withdraw" on public.event_attendance;
create policy "attendance self withdraw" on public.event_attendance for delete to authenticated
	using (
		subject_id = (select public.my_subject_id())
		and status = 'signed_up'
		and exists (
			select 1 from public.events e
			where e.id = event_attendance.event_id
				and (e.signups_close_at is null or now() <= e.signups_close_at)
				and (e.starts_on is null or (now() at time zone 'Europe/Amsterdam')::date < e.starts_on)
		)
	);

-- FIX 7 (LOW): complete_event idempotent — sla over als het event al is afgerond.
create or replace function public.complete_event(target_event uuid, present_subjects uuid[])
returns void language plpgsql security definer set search_path = '' as $$
begin
	if not (select public.authorize('inventory.manage')) then
		raise exception 'inventory.manage vereist';
	end if;
	if exists (select 1 from public.activity_log where kind = 'event.completed' and event_id = target_event) then
		return;
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
