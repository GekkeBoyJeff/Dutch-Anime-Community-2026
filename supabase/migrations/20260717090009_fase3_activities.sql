-- Fase 3 — gehoste activiteiten op een event (stand/booth/podium), hun benodigdheden en hosts.
-- Operationele child-rijen: managers (inventory.manage) doen volledige CRUD; inventory.view leest.
create table public.event_activities (
	id          uuid primary key default gen_random_uuid(),
	event_id    uuid not null references public.events(id) on delete cascade,
	venue       public.activity_venue not null default 'other',
	title       text not null,
	description text,
	starts_at   timestamptz,
	ends_at     timestamptz,
	created_by  uuid references auth.users(id),
	created_at  timestamptz not null default now(),
	updated_at  timestamptz not null default now()
);
create trigger set_updated_at before update on public.event_activities for each row execute function public.set_updated_at();
create trigger audit_event_activities after insert or update or delete on public.event_activities for each row execute function public.log_audit();

create table public.activity_requirements (
	id          uuid primary key default gen_random_uuid(),
	activity_id uuid not null references public.event_activities(id) on delete cascade,
	item_id     uuid references public.inventory_items(id) on delete set null,
	label       text,
	quantity    int not null default 1,
	created_at  timestamptz not null default now()
);
create trigger audit_activity_requirements after insert or update or delete on public.activity_requirements for each row execute function public.log_audit();

create table public.activity_hosts (
	id          uuid primary key default gen_random_uuid(),
	activity_id uuid not null references public.event_activities(id) on delete cascade,
	subject_id  uuid not null references public.mod_subjects(id) on delete cascade,
	created_at  timestamptz not null default now(),
	unique (activity_id, subject_id)
);
create trigger audit_activity_hosts after insert or update or delete on public.activity_hosts for each row execute function public.log_audit();

grant select, insert, update, delete on public.event_activities, public.activity_requirements, public.activity_hosts to authenticated, service_role;

do $$
declare t text;
begin
	foreach t in array array['event_activities', 'activity_requirements', 'activity_hosts'] loop
		execute format('alter table public.%I enable row level security', t);
		execute format($f$create policy "%1$s manage" on public.%1$I for all to authenticated using ((select public.authorize('inventory.manage'))) with check ((select public.authorize('inventory.manage')))$f$, t);
		execute format($f$create policy "%1$s read" on public.%1$I for select to authenticated using ((select public.authorize('inventory.view')))$f$, t);
	end loop;
end $$;
