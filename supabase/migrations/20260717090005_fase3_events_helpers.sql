-- Fase 3 — events-extensies + rang/subject-helpers (de spil voor alle Fase 3-RLS).
alter table public.events
	add column if not exists kind public.event_kind not null default 'convention',
	add column if not exists parent_event_id uuid references public.events(id) on delete set null,
	add column if not exists signups_open_at timestamptz,
	add column if not exists signups_close_at timestamptz;

-- Rang van een user: admin 3, yakuza 2, stand-staff 1, anders/onbekend 0. SECURITY DEFINER zodat het
-- user_roles kan lezen ongeacht RLS; rapporteert alleen een rang, geen escalatiepad.
create or replace function public.role_rank_of(uid uuid)
returns int language sql stable security definer set search_path = '' as $$
	select coalesce((
		select case ur.role
			when 'admin' then 3
			when 'yakuza' then 2
			when 'stand-staff' then 1
			else 0
		end
		from public.user_roles ur where ur.user_id = uid
	), 0);
$$;
grant execute on function public.role_rank_of(uuid) to authenticated;

-- Het subject-id (canoniek profiel) van de beller, voor eigen-inschrijving/-inzage.
create or replace function public.my_subject_id()
returns uuid language sql stable security definer set search_path = '' as $$
	select s.id from public.mod_subjects s where s.user_id = (select auth.uid()) limit 1;
$$;
grant execute on function public.my_subject_id() to authenticated;
