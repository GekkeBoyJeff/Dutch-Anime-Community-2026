-- Hoort bij 20260827120000: dezelfde omzetting van `heading.value` naar `heading.title`, nu voor de
-- gepubliceerde kolom. De twee kanalen worden nooit in één statement geschreven — dat is precies hoe
-- het bij de cardGrid-samenvoeging misging (20260816120000 / 20260816130000).
--
-- De valkuil van toen: er hing een trigger (protect_published_columns, 20260724100001) die elke
-- directe schrijfactie op published_* stilletjes terugdraaide tenzij de sessievlag app.approving op
-- '1' stond. De migratie meldde dat hij slaagde, alleen de conceptkolom was omgezet, en /evenementen
-- bleef op het gepubliceerde kanaal een 404 zonder één signaal. Die trigger en die vlag bestaan niet
-- meer: 20260816150000 heeft ze vervangen door kolomrechten, en die beperken alleen `authenticated`,
-- niet de eigenaar die migraties draait. `set_config('app.approving', ...)` zou hier dus naar een
-- mechanisme wijzen dat er niet is.
--
-- Wat wél overeind blijft is de eis die eruit volgde: een migratie op deze kolom mag niet stil half
-- slagen. Onderaan controleert deze migratie daarom haar eigen uitkomst, zoals 20260816150000 dat ook
-- doet. Slikt iets de schrijfactie alsnog in, dan faalt de migratie in plaats van de site.
--
-- Er wordt niets uit `data` overgezet: de gepubliceerde inhoud verandert alleen op de veldnaam na,
-- zodat een nog niet geaccepteerd concept niet ongemerkt live gaat.
--
-- Idempotent op dezelfde voorwaarde als 20260827120000: alleen waar `heading.value` staat én
-- `heading.title` ontbreekt.

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

update public.pages
set published_data = pg_temp.rename_heading_value(published_data)
where pg_temp.has_heading_value(published_data);

do $$
begin
	if exists (select 1 from public.pages where pg_temp.has_heading_value(published_data)) then
		raise exception 'published_data bevat nog heading.value — de schrijfactie is niet aangekomen';
	end if;
end;
$$;
