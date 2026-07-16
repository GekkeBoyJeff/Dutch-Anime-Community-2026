-- New role + inventory permissions. Standalone migration: Postgres forbids using a freshly-added enum
-- value in the same transaction that adds it, and the next migration (20260716100002) references these.
alter type public.app_role add value if not exists 'stand-staff';
alter type public.app_permission add value if not exists 'inventory.view';
alter type public.app_permission add value if not exists 'inventory.manage';
