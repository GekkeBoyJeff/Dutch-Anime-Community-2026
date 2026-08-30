-- Het Heading-primitive heeft zijn tekstveld hernoemd van `value` naar `title`, zodat een blok zijn
-- heading rechtstreeks kan spreaden (<HeadingGroup {...heading} />) in plaats van hem veld voor veld
-- over te mappen. `title` is verplicht in het schema, dus elke pagina in Supabase die nog
-- `heading.value` heeft faalt op Page.safeParse en laat getPageByPath gooien bij de eerstvolgende
-- build — die pagina verdwijnt dan van de site in plaats van dat er een verkeerde kop staat.
--
-- Deze migratie zet de conceptkolom om. De gepubliceerde kolom staat bewust in een eigen migratie
-- (20260827130000); de reden daarvoor staat daar.
--
-- Idempotent: er wordt alleen omgezet waar `heading.value` staat én `heading.title` ontbreekt, dus een
-- tweede run vindt niets meer. Een heading die beide velden heeft blijft ongemoeid — een bestaande
-- `title` overschrijven is nooit de bedoeling, en een achtergebleven `value` wordt door Zod weggestript
-- in plaats van dat hij de validatie breekt. Blokken zonder `heading`, documenten zonder `blocks`-array,
-- elk ander veld en de volgorde van de blokken blijven exact zoals ze zijn.

create or replace function pg_temp.rename_heading_value(doc jsonb) returns jsonb
language sql immutable as $$
	select case
		when doc is null or jsonb_typeof(doc -> 'blocks') is distinct from 'array' then doc
		else jsonb_set(doc, '{blocks}', (
			select coalesce(jsonb_agg(
				case
					when jsonb_typeof(block -> 'heading') = 'object'
						and jsonb_exists(block -> 'heading', 'value')
						and not jsonb_exists(block -> 'heading', 'title')
					then jsonb_set(block, '{heading}',
						((block -> 'heading') - 'value')
						|| jsonb_build_object('title', block -> 'heading' -> 'value'))
					else block
				end
				order by ord
			), '[]'::jsonb)
			from jsonb_array_elements(doc -> 'blocks') with ordinality as t(block, ord)
		))
	end;
$$;

create or replace function pg_temp.has_heading_value(doc jsonb) returns boolean
language sql immutable as $$
	select case
		when doc is null or jsonb_typeof(doc -> 'blocks') is distinct from 'array' then false
		else coalesce((
			select bool_or(jsonb_typeof(block -> 'heading') = 'object'
				and jsonb_exists(block -> 'heading', 'value')
				and not jsonb_exists(block -> 'heading', 'title'))
			from jsonb_array_elements(doc -> 'blocks') as t(block)
		), false)
	end;
$$;

-- Dezelfde voorwaarde als in de omzetting zelf, zodat een rij die niets te migreren heeft ook niet
-- wordt herschreven: sinds 20260816160000 hangt set_updated_at aan pages, en een no-op-update zou
-- updated_at van elke pagina op de migratiedatum zetten.
update public.pages
set data = pg_temp.rename_heading_value(data)
where pg_temp.has_heading_value(data);
