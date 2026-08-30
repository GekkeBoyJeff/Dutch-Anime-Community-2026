-- Belated re-gate for the rechtenfundament migration (20260724100001). Its dynamic policy rebuild
-- (section C) only remapped tables matching the 'event%' pattern, and a couple of read-paths needed
-- a broader grant than the mechanical old->new permission remap produced.

-- ============================================================================
-- 1. shift_swap_requests — the table name doesn't match 'event%', so these two policies kept their
-- inventory.* literals through the big migration untouched.
-- NB: the source migration's "swap cancel" UPDATE policy was already dropped for good in
-- 20260717090012_fase3a_review_fixes.sql (it was column-blind — a HIGH-severity fix) and is
-- intentionally NOT recreated here; cancelling goes exclusively through cancel_swap(), whose
-- authorize() literal is already events.manage.
-- ============================================================================
drop policy if exists "swap read" on public.shift_swap_requests;
create policy "swap read" on public.shift_swap_requests for select to authenticated
	using (
		(select public.authorize('events.manage'))
		or from_subject = (select public.my_subject_id())
		or to_subject = (select public.my_subject_id())
	);

drop policy if exists "swap insert" on public.shift_swap_requests;
create policy "swap insert" on public.shift_swap_requests for insert to authenticated
	with check (
		(select public.authorize('events.view'))
		and from_subject = (select public.my_subject_id())
		and exists (select 1 from public.event_shifts s where s.id = shift_swap_requests.shift_id and s.subject_id = (select public.my_subject_id()))
	);

-- ============================================================================
-- 2. expenses / expense_receipts — finance.view (read-only treasurer access) can now read claims and
-- receipts alongside expenses.review; every other clause is kept verbatim.
-- ============================================================================
drop policy if exists "expenses read" on public.expenses;
create policy "expenses read" on public.expenses for select to authenticated
	using (user_id = (select auth.uid()) or (select public.authorize('expenses.review')) or (select public.authorize('finance.view')));

drop policy if exists "receipts read" on public.expense_receipts;
create policy "receipts read" on public.expense_receipts for select to authenticated
	using (exists (select 1 from public.expenses e where e.id = expense_id
		and (e.user_id = (select auth.uid()) or (select public.authorize('expenses.review')) or (select public.authorize('finance.view')))));

-- ============================================================================
-- 3. notification_types — the mechanical table-wide literal replace also turned the read policy's
-- notifications.send into notifications.manage, locking out plain senders. Split into a read policy
-- open to either permission, and manage-only write policies (was a single FOR ALL policy).
-- ============================================================================
drop policy if exists "notification types read" on public.notification_types;
create policy "notification types read" on public.notification_types for select to authenticated
	using ((select public.authorize('notifications.send')) or (select public.authorize('notifications.manage')));

drop policy if exists "notification types manage" on public.notification_types;
create policy "notification types manage insert" on public.notification_types for insert to authenticated
	with check ((select public.authorize('notifications.manage')));
create policy "notification types manage update" on public.notification_types for update to authenticated
	using ((select public.authorize('notifications.manage'))) with check ((select public.authorize('notifications.manage')));
create policy "notification types manage delete" on public.notification_types for delete to authenticated
	using ((select public.authorize('notifications.manage')));

-- ============================================================================
-- 4. org_income — read-only finance.view can see the income rollup; mutations stay finance.manage.
-- ============================================================================
drop policy if exists "income read" on public.org_income;
create policy "income read" on public.org_income for select to authenticated
	using ((select public.authorize('finance.view')));

-- ============================================================================
-- 5. Nothing on shift_swap_requests may still gate on an inventory.* permission.
-- ============================================================================
do $$
declare bad text;
begin
	select string_agg(policyname, ', ') into bad
	from pg_policies
	where schemaname = 'public' and tablename = 'shift_swap_requests'
		and coalesce(qual, '') || coalesce(with_check, '') like '%''inventory.%';
	if bad is not null then
		raise exception 'shift_swap_requests policies nog op inventory.*: %', bad;
	end if;
end $$;
