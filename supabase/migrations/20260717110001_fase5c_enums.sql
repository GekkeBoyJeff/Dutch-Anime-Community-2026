-- Phase 5c — expense categories (separate migration: a freshly created enum value can't be used as a
-- column type in the same transaction). English identifiers; Dutch labels in the UI.
create type public.expense_category as enum ('travel', 'materials', 'food', 'stand', 'other');
