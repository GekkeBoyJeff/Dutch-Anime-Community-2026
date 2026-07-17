-- Fase 7 — badges. Toegekend aan een subject (volgt merges via canonical). Afbeelding in een PUBLIEKE
-- bucket (badges staan op profielen/accountpagina, geen signed URL nodig). Lezen: moderation.view (voor de
-- moderatie-UI); een lid ziet z'n eigen badges via my_badges() (kolom-net, volgt merges). Schrijven:
-- badges.manage (admin/yakuza). Verwijderen: records.delete.

create table public.badges (
	id          uuid primary key default gen_random_uuid(),
	subject_id  uuid not null references public.mod_subjects(id) on delete cascade,
	title       text not null,
	description text,
	awarded_on  date not null default current_date,
	image_path  text,
	awarded_by  uuid references auth.users(id),
	archived_at timestamptz,
	archived_by uuid references auth.users(id),
	created_at  timestamptz not null default now()
);
create trigger audit_badges after insert or update or delete on public.badges for each row execute function public.log_audit();
grant select, insert, update, delete on public.badges to authenticated, service_role;
alter table public.badges enable row level security;
create policy "badges read" on public.badges for select to authenticated using ((select public.authorize('moderation.view')));
create policy "badges insert" on public.badges for insert to authenticated with check ((select public.authorize('badges.manage')));
create policy "badges update" on public.badges for update to authenticated using ((select public.authorize('badges.manage'))) with check ((select public.authorize('badges.manage')));
create policy "badges delete" on public.badges for delete to authenticated using ((select public.authorize('records.delete')));

-- Publieke badge-bucket (afbeeldingen zijn niet gevoelig). Schrijven = badges.manage, verwijderen =
-- records.delete; plus een self-delete-orphan zodat de uploader een mislukte upload kan opruimen.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
	values ('badges', 'badges', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
	on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
create policy "badges image write" on storage.objects for insert to authenticated with check (bucket_id = 'badges' and (select public.authorize('badges.manage')));
create policy "badges image update" on storage.objects for update to authenticated using (bucket_id = 'badges' and (select public.authorize('badges.manage'))) with check (bucket_id = 'badges' and (select public.authorize('badges.manage')));
create policy "badges image delete" on storage.objects for delete to authenticated using (bucket_id = 'badges' and (select public.authorize('records.delete')));
create policy "badges image self delete orphan" on storage.objects for delete to authenticated using (
	bucket_id = 'badges'
	and owner = (select auth.uid())
	and (select public.authorize('badges.manage'))
	and not exists (select 1 from public.badges b where b.image_path = storage.objects.name)
);

-- Eigen badges (volgt merges), voor de accountpagina.
create or replace function public.my_badges()
returns table (title text, description text, awarded_on date, image_path text)
language sql stable security definer set search_path = '' as $$
	select b.title, b.description, b.awarded_on, b.image_path
	from public.badges b
	where b.archived_at is null
		and public.canonical_subject_id(b.subject_id) = public.canonical_subject_id((select public.my_subject_id()))
		and public.canonical_subject_id((select public.my_subject_id())) is not null
	order by b.awarded_on desc;
$$;
grant execute on function public.my_badges() to authenticated;

-- hard_delete uitgebreid met een badges-tak (publieke bucket-afbeelding opruimen). Alle bestaande takken
-- ongewijzigd overgenomen.
create or replace function public.hard_delete(target_table text, target_id uuid)
returns table (bucket_id text, path text)
language plpgsql security definer set search_path = '' as $$
begin
	if not (select public.authorize('records.delete')) then
		raise exception 'records.delete vereist';
	end if;

	if target_table = 'events' then
		return query
			select 'tickets'::text, t.ticket_pdf_path
			from public.event_tickets t
			where t.event_id = target_id and t.ticket_pdf_path is not null;
		delete from public.events where id = target_id;

	elsif target_table = 'inventory_items' then
		delete from public.inventory_items where id = target_id;

	elsif target_table = 'mod_subjects' then
		return query
			select 'mod-evidence'::text, e.storage_path
			from public.mod_evidence e
			join public.mod_warnings w on w.id = e.warning_id
			where w.subject_id = target_id and e.storage_path is not null;
		return query
			select 'mod-evidence'::text, le.storage_path
			from public.mod_link_evidence le
			join public.mod_subject_links l on l.id = le.link_id
			where (l.subject_low = target_id or l.subject_high = target_id) and le.storage_path is not null;
		return query
			select 'badges'::text, b.image_path
			from public.badges b
			where b.subject_id = target_id and b.image_path is not null;
		delete from public.mod_subjects where id = target_id;

	elsif target_table = 'mod_warnings' then
		return query
			select 'mod-evidence'::text, e.storage_path
			from public.mod_evidence e
			where e.warning_id = target_id and e.storage_path is not null;
		delete from public.mod_warnings where id = target_id;

	elsif target_table = 'mod_subject_links' then
		return query
			select 'mod-evidence'::text, le.storage_path
			from public.mod_link_evidence le
			where le.link_id = target_id and le.storage_path is not null;
		delete from public.mod_subject_links where id = target_id;

	elsif target_table = 'mod_bans' then
		delete from public.mod_bans where id = target_id;

	elsif target_table = 'badges' then
		return query
			select 'badges'::text, b.image_path
			from public.badges b
			where b.id = target_id and b.image_path is not null;
		delete from public.badges where id = target_id;

	elsif target_table = 'expenses' then
		return query
			select 'receipts'::text, e.receipt_path
			from public.expenses e
			where e.id = target_id and e.receipt_path is not null;
		return query
			select 'receipts'::text, r.path
			from public.expense_receipts r
			where r.expense_id = target_id and r.path is not null;
		delete from public.expenses where id = target_id;

	else
		raise exception 'hard_delete: niet-ondersteunde tabel %', target_table;
	end if;
end;
$$;
