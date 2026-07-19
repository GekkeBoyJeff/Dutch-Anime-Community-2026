-- Phase 5: expense management (expenses.manage) shows the claimant's name, but the profiles-read policy
-- didn't cover expenses.manage yet, so names fell back to UUIDs. Add expenses.manage (read-only username
-- access; same pattern as the logs.view addition in 110006).
drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles for select to authenticated
	using (
		id = (select auth.uid())
		or (select public.authorize('roles.manage'))
		or (select public.authorize('moderation.view'))
		or (select public.authorize('logs.view'))
		or (select public.authorize('expenses.manage'))
	);
