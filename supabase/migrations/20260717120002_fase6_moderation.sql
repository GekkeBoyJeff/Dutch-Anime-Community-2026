-- Fase 6 — moderatie: merge (zonder rijen om te hangen), links + linkbewijs, bans, rang-regel op
-- warnings/bans, eigen-warnings-RPC, activity-logging en hard_delete-uitbreiding.

-- === Merge: merged_into + canonical-resolutie ===
-- Rijen worden NIET omgehangen (anders botst o.a. unique(event_id, subject_id) op attendance); alle
-- leespaden resolven via canonical_subject_id(). merged_into wijst naar het overlevende subject.
alter table public.mod_subjects add column if not exists merged_into uuid references public.mod_subjects(id) on delete set null;

create or replace function public.canonical_subject_id(p_id uuid)
returns uuid language plpgsql stable security definer set search_path = '' as $$
declare
	cur  uuid := p_id;
	nxt  uuid;
	hops int := 0;
begin
	if p_id is null then return null; end if;
	loop
		select merged_into into nxt from public.mod_subjects where id = cur;
		if nxt is null then return cur; end if;
		hops := hops + 1;
		if hops > 20 then return cur; end if; -- cyclus-guard
		cur := nxt;
	end loop;
end;
$$;
grant execute on function public.canonical_subject_id(uuid) to authenticated;

create or replace function public.merge_subjects(p_from uuid, p_into uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
	if not (select public.authorize('moderation.manage')) then
		raise exception 'moderation.manage vereist';
	end if;
	if p_from = p_into then
		raise exception 'kan een profiel niet in zichzelf samenvoegen';
	end if;
	if public.canonical_subject_id(p_into) = p_from then
		raise exception 'samenvoegen zou een cyclus maken';
	end if;
	update public.mod_subjects set merged_into = p_into, updated_at = now() where id = p_from;
	insert into public.activity_log (kind, actor_id, subject_id, summary)
	values ('subject.merged', (select auth.uid()), p_from, 'Profiel samengevoegd met een ander profiel');
end;
$$;
grant execute on function public.merge_subjects(uuid, uuid) to authenticated;

create or replace function public.unmerge_subject(p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
	if not (select public.authorize('moderation.manage')) then
		raise exception 'moderation.manage vereist';
	end if;
	update public.mod_subjects set merged_into = null, updated_at = now() where id = p_id;
	insert into public.activity_log (kind, actor_id, subject_id, summary)
	values ('subject.unmerged', (select auth.uid()), p_id, 'Profiel losgekoppeld');
end;
$$;
grant execute on function public.unmerge_subject(uuid) to authenticated;

-- === Links: status + reviewer + linkbewijs ===
alter table public.mod_subject_links add column if not exists status public.mod_link_status not null default 'suspected';
alter table public.mod_subject_links add column if not exists reviewed_by uuid references auth.users(id);
alter table public.mod_subject_links add column if not exists reviewed_at timestamptz;

create table public.mod_link_evidence (
	id           uuid primary key default gen_random_uuid(),
	link_id      uuid not null references public.mod_subject_links(id) on delete cascade,
	kind         text not null check (kind in ('image', 'link', 'text')),
	storage_path text,
	url          text,
	body         text,
	created_by   uuid references auth.users(id),
	created_at   timestamptz not null default now()
);
create trigger audit_mod_link_evidence after insert or update or delete on public.mod_link_evidence for each row execute function public.log_audit();
grant select, insert, update, delete on public.mod_link_evidence to authenticated, service_role;
alter table public.mod_link_evidence enable row level security;
create policy "link evidence view" on public.mod_link_evidence for select to authenticated using ((select public.authorize('moderation.view')));
create policy "link evidence insert" on public.mod_link_evidence for insert to authenticated with check ((select public.authorize('moderation.manage')));
create policy "link evidence update" on public.mod_link_evidence for update to authenticated using ((select public.authorize('moderation.manage'))) with check ((select public.authorize('moderation.manage')));
create policy "link evidence delete" on public.mod_link_evidence for delete to authenticated using ((select public.authorize('records.delete')));

-- === Rang-regel op warnings (was: enkel moderation.manage) ===
-- Schrijven vereist rang ≥ yakuza (2) én strikt hoger dan het doelwit; op een yakuza/admin dus alleen door
-- admin. Shadow-subjects (user_id null) rangen 0 → elke yakuza+ mag. Spiegelt conduct_notes.
drop policy if exists "mod insert mod_warnings" on public.mod_warnings;
drop policy if exists "mod update mod_warnings" on public.mod_warnings;
create policy "warnings write" on public.mod_warnings for insert to authenticated
	with check (
		public.role_rank_of((select auth.uid())) >= 2
		and public.role_rank_of((select auth.uid())) > (select public.role_rank_of(s.user_id) from public.mod_subjects s where s.id = mod_warnings.subject_id)
	);
create policy "warnings update" on public.mod_warnings for update to authenticated
	using (
		(select public.authorize('moderation.manage'))
		and public.role_rank_of((select auth.uid())) >= 2
		and public.role_rank_of((select auth.uid())) > (select public.role_rank_of(s.user_id) from public.mod_subjects s where s.id = mod_warnings.subject_id)
	)
	with check (
		(select public.authorize('moderation.manage'))
		and public.role_rank_of((select auth.uid())) >= 2
		and public.role_rank_of((select auth.uid())) > (select public.role_rank_of(s.user_id) from public.mod_subjects s where s.id = mod_warnings.subject_id)
	);

create or replace function public.log_warning_activity() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
	if tg_op = 'INSERT' then
		insert into public.activity_log (kind, actor_id, subject_id, summary)
		values ('warning.issued', coalesce(new.issued_by, (select auth.uid())), new.subject_id, format('%s warning uitgedeeld', new.color));
	elsif tg_op = 'UPDATE' and old.removed_at is null and new.removed_at is not null then
		insert into public.activity_log (kind, actor_id, subject_id, summary)
		values ('warning.removed', coalesce(new.removed_by, (select auth.uid())), new.subject_id, 'Warning ingetrokken');
	end if;
	return null;
end;
$$;
create trigger activity_mod_warnings after insert or update on public.mod_warnings for each row execute function public.log_warning_activity();

-- === Bans ===
create table public.mod_bans (
	id         uuid primary key default gen_random_uuid(),
	subject_id uuid not null references public.mod_subjects(id) on delete cascade,
	scope      public.mod_ban_scope not null,
	reason     text not null,
	issued_by  uuid references auth.users(id),
	issued_at  timestamptz not null default now(),
	expires_at timestamptz,
	lifted_at  timestamptz,
	lifted_by  uuid references auth.users(id),
	created_at timestamptz not null default now()
);
create trigger audit_mod_bans after insert or update or delete on public.mod_bans for each row execute function public.log_audit();
grant select, insert, update, delete on public.mod_bans to authenticated, service_role;
alter table public.mod_bans enable row level security;
-- Lezen: moderation.view (GEEN self-read → een eigen ban is niet zichtbaar). Schrijven/wijzigen: rang-regel.
create policy "bans read" on public.mod_bans for select to authenticated using ((select public.authorize('moderation.view')));
create policy "bans write" on public.mod_bans for insert to authenticated
	with check (
		public.role_rank_of((select auth.uid())) >= 2
		and public.role_rank_of((select auth.uid())) > (select public.role_rank_of(s.user_id) from public.mod_subjects s where s.id = mod_bans.subject_id)
	);
create policy "bans update" on public.mod_bans for update to authenticated
	using (
		(select public.authorize('moderation.manage'))
		and public.role_rank_of((select auth.uid())) >= 2
		and public.role_rank_of((select auth.uid())) > (select public.role_rank_of(s.user_id) from public.mod_subjects s where s.id = mod_bans.subject_id)
	)
	with check (
		(select public.authorize('moderation.manage'))
		and public.role_rank_of((select auth.uid())) >= 2
		and public.role_rank_of((select auth.uid())) > (select public.role_rank_of(s.user_id) from public.mod_subjects s where s.id = mod_bans.subject_id)
	);
create policy "bans delete" on public.mod_bans for delete to authenticated using ((select public.authorize('records.delete')));

create or replace function public.log_ban_activity() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
	if tg_op = 'INSERT' then
		insert into public.activity_log (kind, actor_id, subject_id, summary)
		values ('ban.issued', coalesce(new.issued_by, (select auth.uid())), new.subject_id, format('Ban uitgedeeld (%s)', new.scope));
	elsif tg_op = 'UPDATE' and old.lifted_at is null and new.lifted_at is not null then
		insert into public.activity_log (kind, actor_id, subject_id, summary)
		values ('ban.lifted', coalesce(new.lifted_by, (select auth.uid())), new.subject_id, 'Ban ingetrokken');
	end if;
	return null;
end;
$$;
create trigger activity_mod_bans after insert or update on public.mod_bans for each row execute function public.log_ban_activity();

-- === Eigen warnings inzien (kolom-afgeschermd, volgt merges) ===
create or replace function public.my_warnings()
returns table (color public.mod_warn_color, reason text, issued_at timestamptz)
language sql stable security definer set search_path = '' as $$
	select w.color, w.reason, w.issued_at
	from public.mod_warnings w
	where w.removed_at is null
		and public.canonical_subject_id(w.subject_id) = public.canonical_subject_id((select public.my_subject_id()))
		and public.canonical_subject_id((select public.my_subject_id())) is not null
	order by w.issued_at desc;
$$;
grant execute on function public.my_warnings() to authenticated;

-- === hard_delete uitbreiden (bans + links; mod_subjects geeft nu óók link-bewijs terug) ===
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
