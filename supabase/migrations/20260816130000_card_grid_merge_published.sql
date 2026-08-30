-- Nagekomen op 20260816120000: die migratie schreef ook `published_data`, maar de trigger
-- protect_published_columns (20260724100001) draait elke directe schrijfactie op die kolom
-- stilletjes terug tenzij app.approving = '1'. De concept-kolom werd dus omgezet en de
-- gepubliceerde niet — waardoor /evenementen op de gepubliceerde kanaal bleef falen op
-- Page.safeParse en als 404 uitkwam.
--
-- Dezelfde omzetting, nu mét de vlag die de trigger verwacht. Er wordt niets uit `data`
-- overgezet: de gepubliceerde inhoud blijft ongewijzigd op het bloktype na, zodat een nog
-- niet geaccepteerd concept niet ongemerkt live gaat.
--
-- Idempotent: een tweede run vindt geen oude types meer.

create or replace function pg_temp.migrate_card_grid(doc jsonb) returns jsonb
language sql immutable as $$
	select case
		when doc is null or jsonb_typeof(doc -> 'blocks') is distinct from 'array' then doc
		else jsonb_set(doc, '{blocks}', (
			select coalesce(jsonb_agg(
				case block ->> 'type'
					when 'articleCardGrid' then
						(block - 'articles' - 'type')
						|| jsonb_build_object('type', 'cardGrid', 'variant', 'article',
							'items', coalesce(block -> 'articles', '[]'::jsonb))
					when 'eventCardGrid' then
						(block - 'events' - 'type')
						|| jsonb_build_object('type', 'cardGrid', 'variant', 'event',
							'items', coalesce(block -> 'events', '[]'::jsonb))
					-- linkCardGrid gebruikte `items` al; alleen het type en de variant wijzigen.
					when 'linkCardGrid' then
						(block - 'type')
						|| jsonb_build_object('type', 'cardGrid', 'variant', 'link')
					else block
				end
				order by ord
			), '[]'::jsonb)
			from jsonb_array_elements(doc -> 'blocks') with ordinality as t(block, ord)
		))
	end;
$$;

do $$
begin
	perform set_config('app.approving', '1', true);

	update public.pages
	set published_data = pg_temp.migrate_card_grid(published_data)
	where published_data::text like '%CardGrid"%';

	perform set_config('app.approving', '0', true);
end;
$$;
