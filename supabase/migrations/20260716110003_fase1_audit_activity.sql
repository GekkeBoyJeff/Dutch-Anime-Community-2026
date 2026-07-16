-- Generieke audit-trail: elke INSERT/UPDATE/DELETE op een beheertabel logt oud/nieuw + actor.
-- Custom i.p.v. supa_audit (gearchiveerd, logt geen actor). SECURITY DEFINER → de trigger schrijft
-- ongeacht de RLS van de beller; er zijn geen client-write-policies.
create table public.audit_log (
	id         bigint generated always as identity primary key,
	table_name text not null,
	record_id  uuid,
	op         text not null check (op in ('INSERT', 'UPDATE', 'DELETE')),
	old_data   jsonb,
	new_data   jsonb,
	actor_id   uuid default auth.uid(),
	created_at timestamptz not null default now()
);

create or replace function public.log_audit()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
	insert into public.audit_log (table_name, record_id, op, old_data, new_data, actor_id)
	values (
		tg_table_name,
		case when tg_op = 'DELETE' then old.id else new.id end,
		tg_op,
		case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
		case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end,
		auth.uid()
	);
	return null;  -- AFTER-trigger: returnwaarde wordt genegeerd
end;
$$;

-- Aanhaken op alle beheertabellen met een uuid `id`. profiles krijgt GEEN update-audit: elke OAuth-login
-- ververst username/avatar_url → dat zou het log vervuilen (fase 2 voegt een audit-UPDATE mét
-- WHEN-conditie toe zodra er niet-sync-kolommen zijn).
do $$
declare t text;
begin
	foreach t in array array[
		'user_roles', 'user_permissions', 'mod_subjects', 'mod_warnings', 'mod_evidence', 'mod_notes',
		'mod_subject_links', 'inventory_items', 'events', 'event_item_assignments', 'event_tickets', 'inventory_history'
	] loop
		execute format('drop trigger if exists audit_%1$s on public.%1$I', t);
		execute format('create trigger audit_%1$s after insert or update or delete on public.%1$I for each row execute function public.log_audit()', t);
	end loop;
end $$;

drop trigger if exists audit_profiles on public.profiles;
create trigger audit_profiles after insert or delete on public.profiles for each row execute function public.log_audit();

-- Leesbaar domein-log: "rol gewijzigd", "warning uitgedeeld", enz. Geschreven door domein-triggers/RPC's
-- (latere fases vullen dit verder). Refs zijn nullable — niet elke regel raakt een subject/event/item.
create table public.activity_log (
	id         bigint generated always as identity primary key,
	kind       text not null,
	actor_id   uuid default auth.uid(),
	subject_id uuid references public.mod_subjects(id) on delete set null,
	event_id   uuid references public.events(id) on delete set null,
	item_id    uuid references public.inventory_items(id) on delete set null,
	summary    text not null,
	created_at timestamptz not null default now()
);

-- Fase-1-domeinregel: rolwijzigingen leesbaar loggen (Toegang is nu al live). Andere domeinregels
-- (warnings, bans, verzoeken) komen in hun eigen fase.
create or replace function public.log_role_activity()
returns trigger language plpgsql security definer set search_path = '' as $$
declare who text;
begin
	select coalesce(p.username, left(new.user_id::text, 8)) into who from public.profiles p where p.id = new.user_id;
	insert into public.activity_log (kind, actor_id, summary)
	values ('role.changed', auth.uid(), format('Rol van %s gewijzigd naar %s', coalesce(who, left(new.user_id::text, 8)), new.role));
	return null;
end;
$$;

drop trigger if exists activity_user_roles on public.user_roles;
create trigger activity_user_roles after insert or update of role on public.user_roles for each row execute function public.log_role_activity();

-- Indexen: BRIN op created_at (tijdreeks, goedkoop), btree voor "toon historie van record X".
create index audit_log_created_brin on public.audit_log using brin (created_at);
create index audit_log_table_record on public.audit_log (table_name, record_id);
create index activity_log_created_brin on public.activity_log using brin (created_at);

-- Grants + RLS: alleen lezen met logs.view; geen client-writes (triggers zijn definer).
grant select on public.audit_log to authenticated;
grant select on public.activity_log to authenticated;
grant select, insert on public.audit_log to service_role;
grant select, insert on public.activity_log to service_role;

alter table public.audit_log enable row level security;
alter table public.activity_log enable row level security;
create policy "audit_log read" on public.audit_log for select to authenticated using ((select public.authorize('logs.view')));
create policy "activity_log read" on public.activity_log for select to authenticated using ((select public.authorize('logs.view')));
