-- Fase 4b review-fix.
--
-- (1) HIGH-impact boundary-gat: de eigenaar (stand-staff) kon de yakuza-goedkeuringsflow volledig
-- omzeilen door inventory_items.available direct op false te zetten i.p.v. een onbeschikbaarheids-
-- venster aan te vragen. item_available_on() = available AND geen actief venster, dus available=false
-- maakt een item op ELKE datum onbeschikbaar — óók tijdens een event waarvoor erop gerekend wordt,
-- zonder verzoek, zonder beslissing. RLS ('inv items own update') laat de eigenaar zijn eigen rij
-- kolom-onbeperkt bewerken, dus dit moet met een trigger dicht (een UI-fix is omzeilbaar).
-- Voortaan: wie géén inventory.manage heeft mag available niet true->false zetten zolang het item is
-- toegewezen aan een aankomend/lopend event; die moet via request_item_unavailability() (verzoek → yakuza).
create or replace function public.guard_item_available()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
	if old.available = true and new.available = false
		and not (select public.authorize('inventory.manage'))
		and exists (
			select 1
			from public.event_item_assignments a
			join public.events e on e.id = a.event_id
			where a.item_id = new.id
				and e.starts_on is not null
				and coalesce(e.ends_on, e.starts_on) >= current_date
		) then
		raise exception 'Dit item is toegewezen aan een aankomend event. Meld het onbeschikbaar via een verzoek — de yakuza beslist.';
	end if;
	return new;
end;
$$;
create trigger guard_item_available before update on public.inventory_items
	for each row execute function public.guard_item_available();

-- (2) Eigenaar/aanvrager kon een eigen venster niet meer intrekken: verwijderen vereist inventory.manage
-- ('unavail manage'). Een stand-staff die per ongeluk (of onterecht) onbeschikbaarheid meldde, of een
-- aangevraagd venster wil terugtrekken, kan dat nu zelf via deze RPC. Alleen de aanvrager óf de eigenaar
-- van het item mag intrekken (SECURITY DEFINER zodat een view-only houder de rij mag wissen).
create or replace function public.cancel_own_item_unavailability(p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
	rec       public.item_unavailability;
	item_name text;
begin
	if not (select public.authorize('inventory.view')) then
		raise exception 'inventory.view vereist';
	end if;
	select * into rec from public.item_unavailability where id = p_id for update;
	if rec.id is null then
		raise exception 'venster niet gevonden';
	end if;
	if rec.requested_by <> (select auth.uid())
		and not exists (select 1 from public.inventory_items i where i.id = rec.item_id and i.owner_user_id = (select auth.uid())) then
		raise exception 'je mag dit venster niet intrekken';
	end if;

	delete from public.item_unavailability where id = p_id;

	select i.name into item_name from public.inventory_items i where i.id = rec.item_id;
	insert into public.activity_log (kind, actor_id, item_id, summary)
	values ('item.unavailability_cancelled', (select auth.uid()), rec.item_id,
		format('Onbeschikbaarheid voor "%s" ingetrokken', coalesce(item_name, '—')));
end;
$$;
grant execute on function public.cancel_own_item_unavailability(uuid) to authenticated;
