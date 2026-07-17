-- Fase 6b review-fix: bij een mislukte evidence-insert ruimt de client de zojuist geüploade wees op via
-- storage.remove(), maar de enige mod-evidence DELETE-policy vereist records.delete (admin) → dode code en
-- een achtergelaten privé-wees. Sta de UPLOADER toe zijn EIGEN mod-evidence-object te verwijderen, maar
-- ALLEEN als geen enkele evidence-rij ernaar verwijst (een echte wees) — zo blijft bewijs van bestaande
-- warnings/links onaanraakbaar (audit). Het pad is <fk>/<bestand>, niet <uid>/…, dus scopen op de owner-
-- kolom (de uploader) i.p.v. foldername. Additief naast de records.delete-policy (permissief = ge-OR'd).
create policy "mod-evidence self delete orphan" on storage.objects for delete to authenticated using (
	bucket_id = 'mod-evidence'
	and owner = (select auth.uid())
	and (select public.authorize('moderation.manage'))
	and not exists (select 1 from public.mod_evidence e where e.storage_path = storage.objects.name)
	and not exists (select 1 from public.mod_link_evidence le where le.storage_path = storage.objects.name)
);
