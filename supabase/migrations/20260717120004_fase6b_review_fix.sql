-- Phase 6b review fix: on a failed evidence insert the client cleans up the just-uploaded orphan via
-- storage.remove(), but the only mod-evidence DELETE policy requires records.delete (admin), leaving
-- orphans behind. Let the UPLOADER delete their OWN object, but only if no evidence row references it.
create policy "mod-evidence self delete orphan" on storage.objects for delete to authenticated using (
	bucket_id = 'mod-evidence'
	and owner = (select auth.uid())
	and (select public.authorize('moderation.manage'))
	and not exists (select 1 from public.mod_evidence e where e.storage_path = storage.objects.name)
	and not exists (select 1 from public.mod_link_evidence le where le.storage_path = storage.objects.name)
);
