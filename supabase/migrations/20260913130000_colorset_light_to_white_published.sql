-- Dezelfde omzetting als 20260913120000, nu voor de gepubliceerde kolom. Die staat los van `data`:
-- de live site leest `published_data` (CONTENT_CHANNEL=published), de builder `data`. Eén van beide
-- migreren laat de andere achter met de oude betekenis.

create or replace function pg_temp.colorset_light_to_white(block jsonb) returns jsonb
language sql immutable as $$
	select case
		when block ->> 'colorset' = 'light' then jsonb_set(block, '{colorset}', '"white"'::jsonb)
		else block
	end;
$$;

create or replace function pg_temp.recolor_document(doc jsonb) returns jsonb
language sql immutable as $$
	select case
		when doc -> 'blocks' is null or jsonb_typeof(doc -> 'blocks') <> 'array' then doc
		else jsonb_set(doc, '{blocks}', (
			select coalesce(jsonb_agg(pg_temp.colorset_light_to_white(block) order by ord), '[]'::jsonb)
			from jsonb_array_elements(doc -> 'blocks') with ordinality as t(block, ord)
		))
	end;
$$;

do $$
declare
	touched integer;
begin
	update public.pages
	set published_data = pg_temp.recolor_document(published_data)
	where published_data is not null
	  and published_data -> 'blocks' @> '[{"colorset": "light"}]'::jsonb;

	get diagnostics touched = row_count;
	raise notice 'colorset light -> white: % pagina''s bijgewerkt in published_data', touched;
end
$$;
