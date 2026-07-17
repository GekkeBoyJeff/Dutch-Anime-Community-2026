-- Fase 3 — gedragsnotities met rang-regel. Noteren vereist rang ≥ yakuza én strikt hoger dan het doelwit
-- (stand-staff noteert dus niemand; op yakuza noteren mag alleen admin). Betrokkene ziet 'dát' er iets is
-- via my_conduct_notes() — kind + datum + event, geen body (kolomniveau-afscherming → RPC i.p.v. policy).
create table public.conduct_notes (
	id         uuid primary key default gen_random_uuid(),
	subject_id uuid not null references public.mod_subjects(id) on delete cascade,
	event_id   uuid references public.events(id) on delete set null,
	kind       public.conduct_kind not null default 'other',
	body       text not null,
	created_by uuid references auth.users(id),
	created_at timestamptz not null default now()
);
create trigger audit_conduct_notes after insert or update or delete on public.conduct_notes for each row execute function public.log_audit();
grant select, insert, update, delete on public.conduct_notes to authenticated, service_role;
alter table public.conduct_notes enable row level security;

create policy "conduct read" on public.conduct_notes for select to authenticated
	using ((select public.authorize('moderation.view')));
create policy "conduct write" on public.conduct_notes for insert to authenticated
	with check (
		public.role_rank_of((select auth.uid())) >= 2
		and public.role_rank_of((select auth.uid())) > (
			select public.role_rank_of(s.user_id) from public.mod_subjects s where s.id = conduct_notes.subject_id
		)
	);
create policy "conduct update" on public.conduct_notes for update to authenticated
	using ((select public.authorize('moderation.manage'))) with check ((select public.authorize('moderation.manage')));
create policy "conduct delete" on public.conduct_notes for delete to authenticated
	using ((select public.authorize('records.delete')));

create or replace function public.my_conduct_notes()
returns table (kind public.conduct_kind, event_id uuid, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
	select cn.kind, cn.event_id, cn.created_at
	from public.conduct_notes cn
	where cn.subject_id = (select public.my_subject_id())
	order by cn.created_at desc;
$$;
grant execute on function public.my_conduct_notes() to authenticated;
