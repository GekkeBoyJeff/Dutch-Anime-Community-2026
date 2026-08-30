-- set_updated_at() bestaat sinds 20260716110002, maar werd aangehangen met een handmatige tabellijst
-- ('profiles', 'mod_subjects', 'inventory_items', 'events'). Tabellen die daarna kwamen kregen hem soms
-- wel (event_attendance, event_activities) en meestal niet — pages en structures bijvoorbeeld niet,
-- waardoor /evenementen op zijn insert-datum van 2026-07-16 bleef staan terwijl er vandaag naar
-- geschreven is.
--
-- Een conventie die op een handgeschreven lijst leunt loopt vanzelf achter. Deze migratie leidt hem af
-- uit de catalogus: elke tabel met een updated_at-kolom krijgt de trigger. Idempotent — een tweede run
-- vindt niets meer, en een nieuwe tabel is een kwestie van deze migratie opnieuw draaien.
--
-- mod_subjects zet updated_at in twee RPC's ook expliciet; dat blijft kloppen, de trigger schrijft
-- dezelfde now() erover.

do $$
declare t text;
begin
	for t in
		select c.relname
		from pg_class c
		join pg_namespace n on n.oid = c.relnamespace
		join pg_attribute a on a.attrelid = c.oid and a.attname = 'updated_at' and not a.attisdropped
		where n.nspname = 'public'
			and c.relkind = 'r'
			and not exists (
				select 1
				from pg_trigger g
				where g.tgrelid = c.oid and g.tgname = 'set_updated_at' and not g.tgisinternal
			)
		order by c.relname
	loop
		execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
		raise notice 'set_updated_at aangehangen: %', t;
	end loop;
end $$;
