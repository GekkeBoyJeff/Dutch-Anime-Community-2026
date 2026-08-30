-- articleCardGrid / eventCardGrid / linkCardGrid zijn samengevoegd tot één `cardGrid`-blok met een
-- `variant`. Pagina's die nog een van de oude types bevatten falen op Page.safeParse en zouden dus
-- stilletjes uit de site verdwijnen — deze migratie schrijft ze om.
--
-- Idempotent: een tweede run vindt geen oude types meer. Raakt alleen blokken met een van de drie
-- types; al het andere blijft byte-voor-byte staan.

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

update public.pages
set
	data = pg_temp.migrate_card_grid(data),
	published_data = pg_temp.migrate_card_grid(published_data)
where
	data::text like '%CardGrid"%'
	or published_data::text like '%CardGrid"%';
