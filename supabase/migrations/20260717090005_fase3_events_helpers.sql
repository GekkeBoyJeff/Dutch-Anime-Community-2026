-- Phase 3 — events extensions + rank/subject helpers (the pivot for all Phase 3 RLS).
alter table public.events
	add column if not exists kind public.event_kind not null default 'convention',
	add column if not exists parent_event_id uuid references public.events(id) on delete set null,
	add column if not exists signups_open_at timestamptz,
	add column if not exists signups_close_at timestamptz;

-- Rank of a user: admin 3, yakuza 2, stand-staff 1, else/unknown 0. SECURITY DEFINER so it can
-- read user_roles regardless of RLS; reports only a rank, no escalation path.
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

-- The caller's subject id (canonical profile), for self-signup/self-view.
create or replace function public.my_subject_id()
returns uuid language sql stable security definer set search_path = '' as $$
	select s.id from public.mod_subjects s where s.user_id = (select auth.uid()) limit 1;
$$;
grant execute on function public.my_subject_id() to authenticated;
