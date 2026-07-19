-- Phase 5b review-fix: on a failed insert the client cleans up the just-uploaded orphan receipt via
-- storage.remove(), but the only DELETE policy on the receipts bucket requires records.delete (which a
-- claimant lacks), so the cleanup was dead code and left private orphans behind. Let a claimant delete
-- their OWN receipt, but ONLY if no claim still references it (a true orphan) — a receipt belonging to a
-- submitted/reviewed claim stays untouchable (audit). Additive alongside the existing records.delete
-- policy (permissive policies are OR'd).
create policy "receipts self delete orphan" on storage.objects for delete to authenticated using (
	bucket_id = 'receipts'
	and (storage.foldername(name))[1] = (select auth.uid())::text
	and not exists (select 1 from public.expenses e where e.receipt_path = storage.objects.name)
	and not exists (select 1 from public.expense_receipts r where r.path = storage.objects.name)
);
