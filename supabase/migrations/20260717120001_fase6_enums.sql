-- Fase 6 — moderatie-enums (aparte migratie: net-aangemaakte enum-waarden mogen niet in dezelfde
-- transactie als kolomtype gebruikt worden). Engelse identifiers; Nederlandse labels in de UI.
create type public.mod_link_status as enum ('suspected', 'confirmed', 'rejected');
create type public.mod_ban_scope as enum ('discord', 'convention', 'site');
