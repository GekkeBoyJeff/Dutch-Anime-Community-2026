-- Fase 5c — declaratie-categorieën (aparte migratie: een net-aangemaakte enum-waarde mag niet in dezelfde
-- transactie als kolomtype gebruikt worden). Engelse identifiers; Nederlandse labels in de UI.
create type public.expense_category as enum ('travel', 'materials', 'food', 'stand', 'other');
