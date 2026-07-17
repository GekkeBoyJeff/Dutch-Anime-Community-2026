-- Fase 5 — kosten/declaraties. Enum apart (een net-aangemaakt type mag in dezelfde transactie nog niet
-- als kolomtype gebruikt worden bij sommige clients; aparte migratie houdt het simpel). Deze vier waarden
-- matchen exact het bestaande StatusBadge `expense`-domein (submitted/approved/rejected/reimbursed).
create type public.expense_status as enum ('submitted', 'approved', 'rejected', 'reimbursed');
