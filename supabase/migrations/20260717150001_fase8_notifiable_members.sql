-- Phase 8 — member list for the notifications composer. The 'profiles read' policy only grants all
-- rows to roles.manage/moderation.view/logs.view/expenses.manage, so a notifications.send-only holder
-- saw just themselves. This RPC gives id + username to notifications.send holders without widening
-- profiles read access; unauthorized callers get an empty set.
create or replace function public.list_notifiable_members()
returns table(id uuid, username text)
language sql stable security definer set search_path = '' as $$
	select p.id, p.username from public.profiles p
	where (select public.authorize('notifications.send'))
	order by p.username;
$$;
grant execute on function public.list_notifiable_members() to authenticated;
