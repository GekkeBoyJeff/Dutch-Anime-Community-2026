-- Phase 3 — enums. SEPARATE migration: a just-added enum value can't be used in the same
-- transaction; the following migrations reference these types.
create type public.event_kind as enum ('convention', 'event');
create type public.attendance_status as enum ('signed_up', 'expected', 'present', 'late', 'cancelled_late', 'no_show');
create type public.conduct_kind as enum ('late', 'last_minute_cancel', 'gear_not_ready', 'other');
create type public.activity_venue as enum ('stand', 'booth', 'stage', 'other');
