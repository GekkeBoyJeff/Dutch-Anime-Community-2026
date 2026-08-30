-- Phase C — Team section. Separate migration for the enum value: Postgres forbids using a
-- just-added enum value in the same transaction; ...150002 seeds the grant and builds the RPC on it.
alter type public.app_permission add value if not exists 'staff.manage';
