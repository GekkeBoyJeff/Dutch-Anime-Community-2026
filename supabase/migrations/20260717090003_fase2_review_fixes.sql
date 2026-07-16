-- Fase 2 review-fixes.

-- FIX A (medium, privacy): subject_names had geen WHERE → een definer-view granted aan elke authenticated
-- lekte ALLE mod_subjects, inclusief schaduwprofielen van niet-consenterende, gemodereerde personen
-- (RLS-bypass). Beperk tot echte accounts; schaduw-/bezoekernamen blijven moderation-only (Fase 3-lijn:
-- bezoekers-attendance is alleen leesbaar met moderation.view).
create or replace view public.subject_names
with (security_invoker = false) as
	select s.id,
		coalesce(p.guild_nick, p.global_name, p.username, s.discord_name, left(s.id::text, 8)) as display_name,
		p.avatar_url
	from public.mod_subjects s
	join public.profiles p on p.id = s.user_id;
grant select on public.subject_names to authenticated;

-- FIX B (low, defense-in-depth): profiles had table-brede UPDATE voor authenticated → een user kon eigen
-- guild_roles/guild_nick/global_name/discord_id vervalsen (geen consument nu, maar latente escalatie zodra
-- een latere fase daarop authz baseert). De client schrijft alléén terms_* (TermsGate); triggers (definer)
-- en de discord-sync-EF (service role) schrijven de rest. Zelfde patroon als 110006 voor notifications.
revoke update on public.profiles from authenticated;
grant update (terms_accepted_at, terms_version) on public.profiles to authenticated;

-- FIX (low): hardening van de login-trigger — isoleer de subject-koppeling in een eigen savepoint zodat een
-- (theoretische) botsing met de partial unique index de profielsync/naamhistorie niet terugdraait, en
-- voorkom de botsing met een not-exists-guard.
create or replace function public.handle_user_metadata_update()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
	did       text;
	new_uname text;
	gname     text;
	old_uname text;
begin
	did       := coalesce(new.raw_user_meta_data ->> 'provider_id', new.raw_user_meta_data ->> 'sub');
	new_uname := coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'user_name');
	gname     := coalesce(new.raw_user_meta_data -> 'custom_claims' ->> 'global_name', new.raw_user_meta_data ->> 'global_name');

	select p.username into old_uname from public.profiles p where p.id = new.id;

	if new_uname is not null and new_uname is distinct from old_uname then
		insert into public.profile_name_history (user_id, old_name, new_name) values (new.id, old_uname, new_uname);
		if did is not null and old_uname is not null then
			insert into public.mod_subject_aliases (subject_id, alias, kind, source)
			select s.id, old_uname, 'username', 'discord-login' from public.mod_subjects s where s.discord_id = did
			on conflict (subject_id, alias) do update set last_seen = now();
		end if;
	end if;

	update public.profiles set
		username    = coalesce(new_uname, username),
		avatar_url  = coalesce(new.raw_user_meta_data ->> 'avatar_url', avatar_url),
		global_name = coalesce(gname, global_name),
		discord_id  = coalesce(discord_id, did),
		synced_at   = now()
	where id = new.id;

	if did is not null then
		begin
			update public.mod_subjects set user_id = new.id
			where discord_id = did and user_id is null
				and not exists (select 1 from public.mod_subjects x where x.user_id = new.id);
		exception when others then null;
		end;
	end if;

	return new;
exception when others then
	return new;  -- login mag NOOIT breken door deze trigger
end;
$$;
