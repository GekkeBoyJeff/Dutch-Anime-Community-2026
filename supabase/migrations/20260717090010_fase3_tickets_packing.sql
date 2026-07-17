-- Fase 3 — ticket koppelbaar aan meerdere profielen + inpak-status per toewijzing. (De storage-pad-
-- conventie <ticket_id>/ i.p.v. <user_id>/ wordt met de ticket-UI-herbouw in 3b gemigreerd, samen met de
-- bestaande objecten; de huidige tickets pdf read-policy blijft tot dan ongewijzigd.)
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

-- packed_at: door de assignee zelf gezet ("check your bags"). Eigen toewijzing mag packed_at bijwerken.
alter table public.event_item_assignments add column if not exists packed_at timestamptz;
create policy "assignments own packed" on public.event_item_assignments for update to authenticated
	using ((select public.authorize('inventory.view')) and assigned_user_id = (select auth.uid()))
	with check ((select public.authorize('inventory.view')) and assigned_user_id = (select auth.uid()));
