-- Fase C — ticket-transcripts: parsed Discord Ticket-Tool exports gekoppeld aan moderatie-profielen.
-- GEEN ruwe HTML, GEEN transcript-images in storage — alleen gestructureerde tekst + attachment-
-- METADATA (originele Discord-CDN-URL). RLS spiegelt de mod_*-tabellen: lezen = moderation.view,
-- schrijven/archiveren = moderation.manage (yakuza+admin), hard delete = records.delete (admin) via
-- de bestaande hard_delete-RPC. Additief/idempotent.

create table if not exists public.tickets (
	id             uuid primary key default gen_random_uuid(),
	ticket_number  text not null,                    -- kanaalnaam uit de export, bv. "closed-0334"
	server_id      text,
	server_name    text,
	channel_id     text,
	channel_name   text,
	opened_at      timestamptz,                       -- eerste bericht in de export (indien aanwezig)
	closed_at      timestamptz,                       -- laatste bericht in de export (indien aanwezig)
	message_count  integer not null default 0,
	note           text,
	uploaded_by    uuid references auth.users(id),
	uploaded_at    timestamptz not null default now(),
	archived_at    timestamptz,
	archived_by    uuid references auth.users(id)
);

create table if not exists public.ticket_messages (
	id                 uuid primary key default gen_random_uuid(),
	ticket_id          uuid not null references public.tickets(id) on delete cascade,
	seq                integer not null,              -- volgorde binnen het transcript
	discord_id         text,                          -- origineel Discord bericht-ID (reply-resolutie)
	sent_at            timestamptz,
	edited             boolean not null default false,
	author_discord_id  text not null,
	author_name        text not null,
	author_nick        text,
	author_avatar_url  text,                          -- Discord-CDN, kan verlopen (viewer valt terug op initialen)
	is_bot             boolean not null default false,
	content            text not null default '',
	reply_to_discord_id text,                         -- verwijst naar een ander bericht-ID in dit ticket
	embeds             jsonb not null default '[]'::jsonb,
	attachments        jsonb not null default '[]'::jsonb  -- {name, url, size, width, height} — metadata only
);
create index if not exists ticket_messages_ticket_seq on public.ticket_messages (ticket_id, seq);

create table if not exists public.ticket_participants (
	id          uuid primary key default gen_random_uuid(),
	ticket_id   uuid not null references public.tickets(id) on delete cascade,
	discord_id  text not null,
	name        text,
	is_bot      boolean not null default false,
	subject_id  uuid references public.mod_subjects(id) on delete set null,  -- null = niet gekoppeld
	unique (ticket_id, discord_id)
);
create index if not exists ticket_participants_subject on public.ticket_participants (subject_id);

grant select, insert, update, delete on public.tickets             to authenticated, service_role;
grant select, insert, update, delete on public.ticket_messages     to authenticated, service_role;
grant select, insert, update, delete on public.ticket_participants to authenticated, service_role;

do $$
declare t text;
begin
	foreach t in array array['tickets', 'ticket_messages', 'ticket_participants'] loop
		execute format('alter table public.%I enable row level security', t);
		execute format($f$create policy "tickets view %1$s" on public.%1$I for select to authenticated using ((select public.authorize('moderation.view')))$f$, t);
		execute format($f$create policy "tickets insert %1$s" on public.%1$I for insert to authenticated with check ((select public.authorize('moderation.manage')))$f$, t);
		execute format($f$create policy "tickets update %1$s" on public.%1$I for update to authenticated using ((select public.authorize('moderation.manage'))) with check ((select public.authorize('moderation.manage')))$f$, t);
		execute format($f$create policy "tickets delete %1$s" on public.%1$I for delete to authenticated using ((select public.authorize('records.delete')))$f$, t);
	end loop;
end $$;

-- hard_delete uitbreiden met een tickets-branch. Metadata-only, dus geen storage-paden terug; de FK
-- on delete cascade ruimt ticket_messages + ticket_participants op.
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

	elsif target_table = 'tickets' then
		delete from public.tickets where id = target_id;  -- cascade ruimt messages + participants

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
