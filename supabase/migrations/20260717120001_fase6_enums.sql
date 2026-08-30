-- Phase 6 — moderation enums (separate migration: a freshly created enum value can't be used as a
-- column type in the same transaction). English identifiers; Dutch labels stay in the UI.
create type public.mod_link_status as enum ('suspected', 'confirmed', 'rejected');
create type public.mod_ban_scope as enum ('discord', 'convention', 'site');
