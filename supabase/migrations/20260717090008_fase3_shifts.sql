-- Phase 3 — shifts (timestamptz, Europe/Amsterdam intended) + swap requests. Readable by all
-- inventory.view (to be able to swap); direct edits only via inventory.manage. Swap RPC runs before the event.
create table public.event_shifts (
	id         uuid primary key default gen_random_uuid(),
	event_id   uuid not null references public.events(id) on delete cascade,
	subject_id uuid references public.mod_subjects(id) on delete set null,
	starts_at  timestamptz not null,
	ends_at    timestamptz not null,
	station    text,
	note       text,
	locked_at  timestamptz,
	created_by uuid references auth.users(id),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint event_shifts_time_chk check (ends_at >= starts_at)
);
create trigger set_updated_at before update on public.event_shifts for each row execute function public.set_updated_at();
create trigger audit_event_shifts after insert or update or delete on public.event_shifts for each row execute function public.log_audit();
grant select, insert, update, delete on public.event_shifts to authenticated, service_role;
alter table public.event_shifts enable row level security;

create policy "shifts read" on public.event_shifts for select to authenticated using ((select public.authorize('inventory.view')));
create policy "shifts manage insert" on public.event_shifts for insert to authenticated with check ((select public.authorize('inventory.manage')));
create policy "shifts manage update" on public.event_shifts for update to authenticated using ((select public.authorize('inventory.manage'))) with check ((select public.authorize('inventory.manage')));
create policy "shifts manage delete" on public.event_shifts for delete to authenticated using ((select public.authorize('inventory.manage')));

create table public.shift_swap_requests (
	id           uuid primary key default gen_random_uuid(),
	shift_id     uuid not null references public.event_shifts(id) on delete cascade,
	from_subject uuid not null references public.mod_subjects(id) on delete cascade,
	to_subject   uuid not null references public.mod_subjects(id) on delete cascade,
	status       text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'cancelled')),
	created_by   uuid references auth.users(id),
	created_at   timestamptz not null default now(),
	decided_at   timestamptz
);
create trigger audit_shift_swap_requests after insert or update or delete on public.shift_swap_requests for each row execute function public.log_audit();
grant select, insert, update, delete on public.shift_swap_requests to authenticated, service_role;
alter table public.shift_swap_requests enable row level security;

-- Read: yakuza+, or an involved party (from/to). Insert: the current shift owner offers up their own shift.
create policy "swap read" on public.shift_swap_requests for select to authenticated
	using (
		(select public.authorize('inventory.manage'))
		or from_subject = (select public.my_subject_id())
		or to_subject = (select public.my_subject_id())
	);
create policy "swap insert" on public.shift_swap_requests for insert to authenticated
	with check (
		(select public.authorize('inventory.view'))
		and from_subject = (select public.my_subject_id())
		and exists (select 1 from public.event_shifts s where s.id = shift_swap_requests.shift_id and s.subject_id = (select public.my_subject_id()))
	);
-- Withdraw (cancel) by the requester; accepting goes through apply_shift_swap.
create policy "swap cancel" on public.shift_swap_requests for update to authenticated
	using (from_subject = (select public.my_subject_id()) or (select public.authorize('inventory.manage')))
	with check (from_subject = (select public.my_subject_id()) or (select public.authorize('inventory.manage')));

-- Apply swap: only the recipient (accepting) or yakuza+, request still pending (race-safe via FOR
-- UPDATE), and strictly before the event start day (Europe/Amsterdam). Reassigns the shift + marks accepted.
create or replace function public.apply_shift_swap(request_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
	req      public.shift_swap_requests;
	ev_start date;
begin
	select * into req from public.shift_swap_requests where id = request_id for update;
	if req.id is null then raise exception 'verzoek niet gevonden'; end if;
	if req.status <> 'pending' then raise exception 'verzoek is al afgehandeld'; end if;
	if not (req.to_subject = (select public.my_subject_id()) or (select public.authorize('inventory.manage'))) then
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
