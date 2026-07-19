-- Phase 3 — a ticket can link to multiple profiles + a packing status per assignment. (The
-- storage-path convention <ticket_id>/ vs <user_id>/ migrates with the 3b ticket UI rebuild, along
-- with the existing objects; the current tickets pdf read policy stays unchanged until then.)
create table public.event_ticket_subjects (
	id         uuid primary key default gen_random_uuid(),
	ticket_id  uuid not null references public.event_tickets(id) on delete cascade,
	subject_id uuid not null references public.mod_subjects(id) on delete cascade,
	created_at timestamptz not null default now(),
	unique (ticket_id, subject_id)
);
create trigger audit_event_ticket_subjects after insert or update or delete on public.event_ticket_subjects for each row execute function public.log_audit();
grant select, insert, update, delete on public.event_ticket_subjects to authenticated, service_role;
alter table public.event_ticket_subjects enable row level security;

create policy "ticket_subjects manage" on public.event_ticket_subjects for all to authenticated
	using ((select public.authorize('inventory.manage'))) with check ((select public.authorize('inventory.manage')));
create policy "ticket_subjects own read" on public.event_ticket_subjects for select to authenticated
	using ((select public.authorize('inventory.view')) and subject_id = (select public.my_subject_id()));

-- packed_at: set by the assignee themself ("check your bags"). Own assignment may update packed_at.
alter table public.event_item_assignments add column if not exists packed_at timestamptz;
create policy "assignments own packed" on public.event_item_assignments for update to authenticated
	using ((select public.authorize('inventory.view')) and assigned_user_id = (select auth.uid()))
	with check ((select public.authorize('inventory.view')) and assigned_user_id = (select auth.uid()));
