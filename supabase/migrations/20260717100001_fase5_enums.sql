-- Phase 5 — expenses/reimbursements. Enum kept separate (a freshly created type can't be used as a
-- column type in the same transaction for some clients). These four values match the existing
-- StatusBadge `expense` domain exactly (submitted/approved/rejected/reimbursed).
create type public.expense_status as enum ('submitted', 'approved', 'rejected', 'reimbursed');
