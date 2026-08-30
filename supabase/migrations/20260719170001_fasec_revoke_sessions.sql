-- Role/permission change → forced logout. RLS already cuts data access live (authorize() reads the
-- tables per request, no JWT claim caching), so this closes only the session/UX gap: a demoted user
-- must not be able to renew their JWT. Revoking the target's auth.sessions cascades to their
-- auth.refresh_tokens (ON DELETE CASCADE), so the browser client can no longer refresh.
create or replace function public.revoke_sessions_on_access_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  -- Acts on the TARGET user (new on insert/update, old on delete) — never the admin who made the
  -- change, since roles.manage RLS forbids self-edits (user_id <> auth.uid()).
  delete from auth.sessions where user_id = coalesce(new.user_id, old.user_id);
  return null;
end;
$$;

-- Trigger functions are fired by the engine, not called via PostgREST; revoke the default PUBLIC
-- execute so it is never an exposed endpoint (does not affect trigger firing).
revoke execute on function public.revoke_sessions_on_access_change() from public;

drop trigger if exists on_user_roles_access_change on public.user_roles;
create trigger on_user_roles_access_change
  after insert or update or delete on public.user_roles
  for each row execute function public.revoke_sessions_on_access_change();

drop trigger if exists on_user_permissions_access_change on public.user_permissions;
create trigger on_user_permissions_access_change
  after insert or update or delete on public.user_permissions
  for each row execute function public.revoke_sessions_on_access_change();
