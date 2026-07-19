-- Phase C — income. Enum kept separate (as with expense_category in phase 5c): some clients can't use
-- a just-created type as a column type in the same transaction. Mirrors public.expense_category, but
-- with income-specific values — donations, stand sales, sponsorship — that don't fit the expense categories.
create type public.income_category as enum ('donation', 'sale', 'sponsorship', 'other');
