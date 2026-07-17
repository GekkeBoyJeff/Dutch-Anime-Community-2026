-- Fase 4 — enums (aparte migratie: net-toegevoegde waarden mogen niet in dezelfde transactie gebruikt).
create type public.unavailability_status as enum ('active', 'requested', 'rejected');
create type public.inventory_history_kind as enum ('taken', 'returned', 'damaged', 'note');
