-- Phase 4 — enums (separate migration: freshly added enum values can't be used in the same transaction).
create type public.unavailability_status as enum ('active', 'requested', 'rejected');
create type public.inventory_history_kind as enum ('taken', 'returned', 'damaged', 'note');
