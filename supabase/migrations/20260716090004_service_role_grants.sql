-- Since 2026-04-28 Supabase no longer auto-grants new public tables to the built-in roles — not even
-- service_role. The secret key (sb_secret_…) maps to service_role, which the seed script and the
-- static build use to read/write content; it bypasses RLS but still needs table privileges. Grant it
-- full CRUD on every CMS/RBAC/moderation table. anon (the publishable key) is deliberately left
-- ungranted — no grant + RLS keeps it locked out entirely.
grant usage on schema public to service_role;
grant select, insert, update, delete on
  public.profiles, public.user_roles, public.role_permissions, public.user_permissions,
  public.pages, public.structures,
  public.mod_subjects, public.mod_warnings, public.mod_evidence, public.mod_notes, public.mod_subject_links
to service_role;
grant execute on function public.authorize(public.app_permission) to service_role;
grant execute on function public.my_permissions() to service_role;
