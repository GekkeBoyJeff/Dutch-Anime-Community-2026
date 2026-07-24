-- The role is a preset pointer: ANY role change must re-materialise the user's permission set,
-- no matter where the change came from (set_user_role RPC, SQL editor, Supabase table editor).
-- Without this, a direct table edit changes the label but leaves the old materialised set behind.
create or replace function public.apply_role_preset()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  delete from public.user_permissions where user_id = new.user_id;
  insert into public.user_permissions (user_id, permission)
    select new.user_id, rp.permission from public.role_permissions rp where rp.role = new.role;
  return null;
end;
$$;
revoke execute on function public.apply_role_preset() from public;

-- AFTER trigger on insert + update-of-role. New signups (handle_new_user inserts role 'user')
-- hit an empty preset: no-op. The permission DELETEs this trigger causes still revoke sessions
-- via the user_permissions trigger; its INSERTs deliberately don't (grant = no forced re-login).
drop trigger if exists on_user_roles_apply_preset on public.user_roles;
create trigger on_user_roles_apply_preset
  after insert or update of role on public.user_roles
  for each row execute function public.apply_role_preset();
