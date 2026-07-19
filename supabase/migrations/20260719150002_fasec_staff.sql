-- Fase C — Team-sectie: staff.manage-grant + één-round-trip roster voor het conventieteam.
-- Yakuza (organisatoren) beheren het team; admin's bundel somt elke permissie expliciet op (zie
-- access_control-seed), dus staff.manage wordt óók expliciet aan admin toegekend — niet impliciet geërfd.
insert into public.role_permissions (role, permission) values
	('admin', 'staff.manage'), ('yakuza', 'staff.manage')
on conflict (role, permission) do nothing;

-- staff_overview(): het conventieteam (stand-staff ∪ yakuza) in één trip — naam, avatar, Discord-tag,
-- rol, eerstvolgende shift (datum + event) en open warnings. SECURITY DEFINER + een authorize-gate in de
-- WHERE (net als list_notifiable_members): zonder staff.manage — of anoniem — komt er een lege set terug,
-- niet de mod_*/profielvelden. search_path='' → alles volledig gekwalificeerd.
create or replace function public.staff_overview()
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
	where (select public.authorize('staff.manage'))
		and ur.role in ('stand-staff', 'yakuza')
	order by ur.role desc, display_name;
$$;
grant execute on function public.staff_overview() to authenticated;
