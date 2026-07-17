-- Fase 8 — ledenlijst voor de meldingen-composer. De 'profiles read'-policy geeft alleen alle rijen aan
-- roles.manage / moderation.view / logs.view / expenses.manage; iemand met alléén notifications.send zag
-- daardoor enkel zichzelf, waardoor 'Alle leden' stil naar één ontvanger stuurde. Deze RPC geeft id +
-- username aan houders van notifications.send (SECURITY DEFINER, dus los van de tabel-RLS), zonder de
-- volledige profielrij breder open te zetten. Niet-gerechtigden krijgen een lege set.
create or replace function public.list_notifiable_members()
returns table(id uuid, username text)
language sql stable security definer set search_path = '' as $$
	select p.id, p.username from public.profiles p
	where (select public.authorize('notifications.send'))
	order by p.username;
$$;
grant execute on function public.list_notifiable_members() to authenticated;
