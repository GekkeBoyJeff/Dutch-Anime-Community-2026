-- De colorset die `light` heette was wit; hij heet nu `white`. De naam `light` is doorgeschoven naar
-- de getinte set die eerder `soft` heette. Opgeslagen blokken dragen nog de oude betekenis: een blok
-- met `colorset: 'light'` bedoelt wit.
--
-- Waarom dit stil misgaat zonder migratie. `light` blijft een geldige waarde, dus Zod keurt zo'n blok
-- goed en de build slaagt — de sectie rendert alleen crème in plaats van wit. Geen foutmelding, geen
-- log, alleen 14 blokken die er anders uitzien. Daarom moet deze migratie samen met de code mee.
--
-- Volgorde is kritisch als er ooit `soft` in de data zou staan: eerst light → white, dán soft → light.
-- Bij het schrijven hiervan stond er nul keer `soft` in `data` en `published_data`, dus die tweede
-- stap zit hier niet in. Komt hij later alsnog, dan is dat een eigen migratie.
--
-- Idempotent: draai hem twee keer en er verandert niets, want `white` matcht de voorwaarde niet.

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
	set data = pg_temp.recolor_document(data)
	where data is not null
	  and data -> 'blocks' @> '[{"colorset": "light"}]'::jsonb;

	get diagnostics touched = row_count;
	raise notice 'colorset light -> white: % pagina''s bijgewerkt in data', touched;
end
$$;
