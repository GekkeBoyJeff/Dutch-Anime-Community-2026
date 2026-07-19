-- Phase 1 — new permissions. SEPARATE migration: Postgres forbids using a freshly-added enum value
-- in the same transaction; the following migrations (…110002 onward) seed/use these values.
alter type public.app_permission add value if not exists 'expenses.view';
alter type public.app_permission add value if not exists 'expenses.manage';
alter type public.app_permission add value if not exists 'logs.view';
alter type public.app_permission add value if not exists 'badges.manage';
alter type public.app_permission add value if not exists 'records.delete';
alter type public.app_permission add value if not exists 'notifications.send';
