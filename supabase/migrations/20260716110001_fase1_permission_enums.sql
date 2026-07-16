-- Fase 1 — nieuwe permissies. APARTE migratie: Postgres verbiedt een net-toegevoegde enum-waarde in
-- dezelfde transactie te gebruiken; de volgende migraties (…110002 e.v.) seeden/gebruiken deze waarden.
alter type public.app_permission add value if not exists 'expenses.view';
alter type public.app_permission add value if not exists 'expenses.manage';
alter type public.app_permission add value if not exists 'logs.view';
alter type public.app_permission add value if not exists 'badges.manage';
alter type public.app_permission add value if not exists 'records.delete';
alter type public.app_permission add value if not exists 'notifications.send';
