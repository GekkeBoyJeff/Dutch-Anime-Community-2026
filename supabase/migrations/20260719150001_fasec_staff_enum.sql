-- Fase C — Team-sectie. APARTE migratie voor de enum-waarde: Postgres verbiedt een net-toegevoegde
-- enum-waarde in dezelfde transactie te gebruiken; ...150002 seedt de grant en bouwt de RPC erop.
alter type public.app_permission add value if not exists 'staff.manage';
