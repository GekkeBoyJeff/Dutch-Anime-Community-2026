-- Fase 5: het declaratie-beheer (expenses.manage) toont de naam van de declarant, maar de profiles-read-
-- policy dekte expenses.manage nog niet → namen vielen terug op UUID's. Voeg expenses.manage toe (alleen
-- lezen van username; zelfde patroon als de logs.view-toevoeging in 110006).
drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles for select to authenticated
	using (
		id = (select auth.uid())
		or (select public.authorize('roles.manage'))
		or (select public.authorize('moderation.view'))
		or (select public.authorize('logs.view'))
		or (select public.authorize('expenses.manage'))
	);
