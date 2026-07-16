-- Leesbare domein-activiteit voor inventory_items + events, zodat het Activiteit-tabblad "wat er gebeurde"
-- als één regel toont (het audit_log blijft de technische rij-historie incl. cascades). archived_at-
-- overgangen worden als archiveren/herstellen herkend i.p.v. een generieke wijziging.
create or replace function public.log_domain_activity()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
	noun   text;
	verb   text;
	act    text;
	label  text;
begin
	if tg_table_name = 'inventory_items' then noun := 'Item';
	else noun := 'Conventie';
	end if;

	if tg_op = 'INSERT' then
		act := 'created'; verb := 'aangemaakt'; label := new.name;
	elsif tg_op = 'DELETE' then
		act := 'deleted'; verb := 'definitief verwijderd'; label := old.name;
	elsif new.archived_at is not null and old.archived_at is null then
		act := 'archived'; verb := 'gearchiveerd'; label := new.name;
	elsif new.archived_at is null and old.archived_at is not null then
		act := 'restored'; verb := 'hersteld'; label := new.name;
	else
		act := 'updated'; verb := 'bewerkt'; label := new.name;
	end if;

	insert into public.activity_log (kind, actor_id, item_id, event_id, summary)
	values (
		(case when tg_table_name = 'inventory_items' then 'item.' else 'convention.' end) || act,
		auth.uid(),
		case when tg_table_name = 'inventory_items' and tg_op <> 'DELETE' then new.id else null end,
		case when tg_table_name = 'events' and tg_op <> 'DELETE' then new.id else null end,
		format('%s "%s" %s', noun, coalesce(label, '—'), verb)
	);
	return null;
end;
$$;

drop trigger if exists activity_inventory_items on public.inventory_items;
create trigger activity_inventory_items after insert or update or delete on public.inventory_items for each row execute function public.log_domain_activity();

drop trigger if exists activity_events on public.events;
create trigger activity_events after insert or update or delete on public.events for each row execute function public.log_domain_activity();
