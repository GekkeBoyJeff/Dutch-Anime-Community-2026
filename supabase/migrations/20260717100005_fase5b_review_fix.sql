-- Fase 5b review-fix: bij een mislukte insert ruimt de client de zojuist geüploade wees-bon op via
-- storage.remove(), maar de enige DELETE-policy op de receipts-bucket vereist records.delete (die een
-- declarant niet heeft) → de cleanup was dode code en liet privé-wezen achter. Sta een declarant toe zijn
-- ÉIGEN bon te verwijderen, maar ALLEEN als geen enkele declaratie er nog naar verwijst (een echte wees) —
-- zo blijft een bon van een ingediende/beoordeelde declaratie onaanraakbaar (audit). Additief naast de
-- bestaande records.delete-policy (permissieve policies worden ge-OR'd).
create policy "receipts self delete orphan" on storage.objects for delete to authenticated using (
	bucket_id = 'receipts'
	and (storage.foldername(name))[1] = (select auth.uid())::text
	and not exists (select 1 from public.expenses e where e.receipt_path = storage.objects.name)
	and not exists (select 1 from public.expense_receipts r where r.path = storage.objects.name)
);
