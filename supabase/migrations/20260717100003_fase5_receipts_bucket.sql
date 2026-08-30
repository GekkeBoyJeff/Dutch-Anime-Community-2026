-- Phase 5 — private bucket `receipts` (path <user_id>/<expense_id>/…). Mirrors the tickets bucket +
-- hardening: the claimant writes/reads only in their own folder (foldername[1] = auth.uid());
-- expenses.manage everywhere; hard delete of objects is records.delete-gated (same as tickets).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
	values ('receipts', 'receipts', false, 10485760, array['image/jpeg', 'image/png', 'application/pdf'])
	on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "receipts write" on storage.objects for insert to authenticated with check (
	bucket_id = 'receipts' and (
		((select public.authorize('expenses.view')) and (storage.foldername(name))[1] = (select auth.uid())::text)
		or (select public.authorize('expenses.manage'))
	)
);
create policy "receipts update" on storage.objects for update to authenticated
	using (bucket_id = 'receipts' and ((select public.authorize('expenses.manage')) or (storage.foldername(name))[1] = (select auth.uid())::text))
	with check (bucket_id = 'receipts' and ((select public.authorize('expenses.manage')) or (storage.foldername(name))[1] = (select auth.uid())::text));
create policy "receipts read" on storage.objects for select to authenticated
	using (bucket_id = 'receipts' and ((select public.authorize('expenses.manage')) or (storage.foldername(name))[1] = (select auth.uid())::text));
create policy "receipts delete" on storage.objects for delete to authenticated
	using (bucket_id = 'receipts' and (select public.authorize('records.delete')));
