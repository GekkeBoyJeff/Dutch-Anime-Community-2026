-- Phase F — team_candidates(): the option list for the shift-assignee and activity-host pickers in
-- the event editor. Only real team members (stand-staff ∪ yakuza ∪ admin — no plain user role, no
-- shadow subjects with user_id null). Existing assignments to non-team members remain valid; only the picker list narrows.
--
-- SECURITY DEFINER + an authorize gate in the WHERE (same permission as the editor: inventory.manage,
-- not staff.manage). Without inventory.manage — or anonymous — an empty set comes back. Unlike
-- staff_overview(), admin does count here.
create or replace function public.team_candidates()
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
	where (select public.authorize('inventory.manage'))
		and ur.role in ('stand-staff', 'yakuza', 'admin')
	order by display_name;
$$;
grant execute on function public.team_candidates() to authenticated;
