-- Phase 2 — auth.users triggers (DEFENSIVE: exception wrapper → login must never break) + backfill.
-- Discord ID lives under provider_id or sub; global_name under custom_claims.global_name (or top-level).
-- Links shadow-profile→account on the immutable discord_id, not on username.

-- New account: profile (with discord_id/global_name) + default role + canonical subject (link or create).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
	did   text;
	uname text;
	gname text;
begin
	did   := coalesce(new.raw_user_meta_data ->> 'provider_id', new.raw_user_meta_data ->> 'sub');
	uname := coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'user_name');
	gname := coalesce(new.raw_user_meta_data -> 'custom_claims' ->> 'global_name', new.raw_user_meta_data ->> 'global_name');

	insert into public.profiles (id, username, avatar_url, discord_id, global_name, synced_at)
	values (new.id, uname, new.raw_user_meta_data ->> 'avatar_url', did, gname, now())
	on conflict (id) do nothing;

	insert into public.user_roles (user_id, role) values (new.id, 'user') on conflict (user_id) do nothing;

	if did is not null then
		insert into public.mod_subjects (discord_id, discord_name, user_id) values (did, uname, new.id) on conflict (discord_id) do nothing;
		update public.mod_subjects set user_id = new.id where discord_id = did and user_id is null;
	elsif not exists (select 1 from public.mod_subjects s where s.user_id = new.id) then
		insert into public.mod_subjects (user_id) values (new.id);
	end if;

	return new;
exception when others then
	return new;  -- login must NEVER break because of this trigger
end;
$$;

-- On every login gotrue refreshes raw_user_meta_data → sync to profiles, log name change + alias,
-- link shadow profile. Only fires when raw_user_meta_data changes.
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
		update public.mod_subjects set user_id = new.id where discord_id = did and user_id is null;
	end if;

	return new;
exception when others then
	return new;  -- login must NEVER break because of this trigger
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated after update of raw_user_meta_data on auth.users
	for each row execute function public.handle_user_metadata_update();

-- Backfill: existing accounts get discord_id/global_name + a linked subject (triggers only catch
-- new accounts/logins). Idempotent.
do $$
declare
	u     record;
	did   text;
	uname text;
	gname text;
begin
	for u in select id, raw_user_meta_data as meta from auth.users loop
		did   := coalesce(u.meta ->> 'provider_id', u.meta ->> 'sub');
		uname := coalesce(u.meta ->> 'full_name', u.meta ->> 'name', u.meta ->> 'user_name');
		gname := coalesce(u.meta -> 'custom_claims' ->> 'global_name', u.meta ->> 'global_name');

		update public.profiles set
			discord_id  = coalesce(discord_id, did),
			global_name = coalesce(global_name, gname),
			synced_at   = coalesce(synced_at, now())
		where id = u.id;

		if did is not null then
			insert into public.mod_subjects (discord_id, discord_name, user_id) values (did, uname, u.id) on conflict (discord_id) do nothing;
			update public.mod_subjects set user_id = u.id where discord_id = did and user_id is null;
		elsif not exists (select 1 from public.mod_subjects s where s.user_id = u.id) then
			insert into public.mod_subjects (user_id) values (u.id);
		end if;
	end loop;
end $$;
