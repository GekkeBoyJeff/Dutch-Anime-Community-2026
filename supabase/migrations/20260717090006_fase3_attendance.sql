-- Fase 3 — aanwezigheid per event (incl. bezoekers via schaduwprofielen) + zelf-inschrijven binnen het
-- inschrijfvenster. De "slots open"-regel zit in RLS, niet in de UI.
create table public.event_attendance (
	id         uuid primary key default gen_random_uuid(),
	event_id   uuid not null references public.events(id) on delete cascade,
	subject_id uuid not null references public.mod_subjects(id) on delete cascade,
	status     public.attendance_status not null default 'signed_up',
	note       text,
	created_by uuid references auth.users(id),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (event_id, subject_id)
);
create trigger set_updated_at before update on public.event_attendance for each row execute function public.set_updated_at();
create trigger audit_event_attendance after insert or update or delete on public.event_attendance for each row execute function public.log_audit();

grant select, insert, update, delete on public.event_attendance to authenticated, service_role;
alter table public.event_attendance enable row level security;

-- Beheer (yakuza/admin): volledige CRUD.
create policy "attendance manage" on public.event_attendance for all to authenticated
	using ((select public.authorize('inventory.manage'))) with check ((select public.authorize('inventory.manage')));

-- Lezen: eigen rij altijd; staff-aanwezigheid (subject met staff-rol) voor inventory.view-houders;
-- bezoekers (rang 0 = schaduw/geen staff) alleen voor moderation.view.
create policy "attendance read" on public.event_attendance for select to authenticated
	using (
		subject_id = (select public.my_subject_id())
		or (select public.authorize('moderation.view'))
		or (
			(select public.authorize('inventory.view'))
			and exists (
				select 1 from public.mod_subjects s
				where s.id = event_attendance.subject_id and public.role_rank_of(s.user_id) >= 1
			)
		)
	);

-- Zelf inschrijven binnen het venster: eigen subject, status signed_up, now() tussen open/close.
create policy "attendance self signup" on public.event_attendance for insert to authenticated
	with check (
		(select public.authorize('inventory.view'))
		and subject_id = (select public.my_subject_id())
		and status = 'signed_up'
		and exists (
			select 1 from public.events e
			where e.id = event_attendance.event_id
				and e.signups_open_at is not null and now() >= e.signups_open_at
				and (e.signups_close_at is null or now() <= e.signups_close_at)
		)
	);

-- Eigen signed_up intrekken binnen het venster (na bevestiging naar expected mag alleen yakuza wijzigen).
create policy "attendance self withdraw" on public.event_attendance for delete to authenticated
	using (
		subject_id = (select public.my_subject_id())
		and status = 'signed_up'
		and exists (
			select 1 from public.events e
			where e.id = event_attendance.event_id
				and (e.signups_close_at is null or now() <= e.signups_close_at)
		)
	);
