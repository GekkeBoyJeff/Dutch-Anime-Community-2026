-- Hoort bij 20260827160000: dezelfde omzetting van `Action.label` naar `Action.value`, nu voor de
-- gepubliceerde kolommen van `pages` en `structures`. De twee kanalen worden nooit in één statement
-- geschreven — dat is precies hoe het bij de cardGrid-samenvoeging misging (20260816120000 /
-- 20260816130000).
--
-- De valkuil van toen: er hing een trigger (protect_published_columns, 20260724100001) die elke directe
-- schrijfactie op published_* stilletjes terugdraaide tenzij de sessievlag app.approving op '1' stond.
-- De migratie meldde dat hij slaagde, alleen de conceptkolom was omgezet, en /evenementen bleef op het
-- gepubliceerde kanaal een 404 zonder één signaal. Die trigger en die vlag bestaan niet meer:
-- 20260816150000 heeft ze vervangen door kolomrechten, en die beperken alleen `authenticated`, niet de
-- eigenaar die migraties draait. `set_config('app.approving', ...)` zou hier dus naar een mechanisme
-- wijzen dat er niet is.
--
-- Wat wél overeind blijft is de eis die eruit volgde: een migratie op deze kolommen mag niet stil half
-- slagen. Onderaan controleert deze migratie daarom haar eigen uitkomst, voor beide tabellen apart.
-- Slikt iets de schrijfactie alsnog in, dan faalt de migratie in plaats van de site — en bij
-- `structures` is dat verschil groot, want de footer staat op elke pagina, dus een achtergebleven
-- `label` daar laat de hele build vallen en niet één route.
--
-- Er wordt niets uit `data` overgezet: de gepubliceerde inhoud verandert alleen op de veldnaam na,
-- zodat een nog niet geaccepteerd concept niet ongemerkt live gaat.
--
-- Op welke zes plekken in een pagina en welke drie in de chrome een Action staat, waarom `label`
-- daarbuiten (een filterchip, een sorteeroptie, een bijschrift onder een getal, een social-naam,
-- navigation.cta) met rust wordt gelaten, en waarom er wordt genavigeerd in plaats van gezocht, staat
-- bij 20260827160000; de functies hieronder zijn regel voor regel dezelfde, alleen zonder die uitleg.
-- Dat geldt ook voor de parameternamen: pg_temp leeft per sessie en `create or replace function` weigert
-- een functie waarvan een parameter anders heet dan bij de vorige definitie (42P13).
--
-- Idempotent op dezelfde voorwaarde: alleen hernoemen waar `label` staat én `value` ontbreekt, en de
-- detectie is de omzetting zelf, dus een tweede run vindt niets meer.

create or replace function pg_temp.rename_key(obj jsonb, src text, dst text) returns jsonb
language sql immutable as $$
	select case
		when jsonb_typeof(obj) is distinct from 'object' then obj
		when not jsonb_exists(obj, src) then obj
		when jsonb_exists(obj, dst) then obj
		else (obj - src) || jsonb_build_object(dst, obj -> src)
	end;
$$;

create or replace function pg_temp.rename_in_list(block jsonb, list_key text, src text, dst text) returns jsonb
language sql immutable as $$
	select case
		when jsonb_typeof(block -> list_key) is distinct from 'array' then block
		else jsonb_set(block, array[list_key], (
			select coalesce(jsonb_agg(pg_temp.rename_key(item, src, dst) order by ord), '[]'::jsonb)
			from jsonb_array_elements(block -> list_key) with ordinality as t(item, ord)
		))
	end;
$$;

create or replace function pg_temp.rename_action_at(obj jsonb, action_key text, src text, dst text) returns jsonb
language sql immutable as $$
	select case
		when jsonb_typeof(obj -> action_key) is distinct from 'object' then obj
		else jsonb_set(obj, array[action_key], pg_temp.rename_key(obj -> action_key, src, dst))
	end;
$$;

create or replace function pg_temp.rename_action_at_in_list(obj jsonb, list_key text, action_key text, src text, dst text) returns jsonb
language sql immutable as $$
	select case
		when jsonb_typeof(obj -> list_key) is distinct from 'array' then obj
		else jsonb_set(obj, array[list_key], (
			select coalesce(jsonb_agg(pg_temp.rename_action_at(item, action_key, src, dst) order by ord), '[]'::jsonb)
			from jsonb_array_elements(obj -> list_key) with ordinality as t(item, ord)
		))
	end;
$$;

create or replace function pg_temp.rename_in_list_in_list(obj jsonb, list_key text, inner_key text, src text, dst text) returns jsonb
language sql immutable as $$
	select case
		when jsonb_typeof(obj -> list_key) is distinct from 'array' then obj
		else jsonb_set(obj, array[list_key], (
			select coalesce(jsonb_agg(pg_temp.rename_in_list(item, inner_key, src, dst) order by ord), '[]'::jsonb)
			from jsonb_array_elements(obj -> list_key) with ordinality as t(item, ord)
		))
	end;
$$;

create or replace function pg_temp.rename_action_label_block(block jsonb) returns jsonb
language sql immutable as $$
	select case block ->> 'type'
		when 'hero'           then pg_temp.rename_in_list(pg_temp.rename_in_list(block, 'actions', 'label', 'value'), 'socials', 'label', 'value')
		when 'titleText'      then pg_temp.rename_in_list(block, 'actions', 'label', 'value')
		when 'ctaBanner'      then pg_temp.rename_action_at(pg_temp.rename_action_at(block, 'primaryCta', 'label', 'value'), 'secondaryCta', 'label', 'value')
		when 'highlightCards' then pg_temp.rename_in_list_in_list(block, 'items', 'actions', 'label', 'value')
		when 'bentoGrid'      then pg_temp.rename_action_at_in_list(block, 'items', 'cta', 'label', 'value')
		else block
	end;
$$;

create or replace function pg_temp.rename_action_label(doc jsonb) returns jsonb
language sql immutable as $$
	select case
		when doc is null or jsonb_typeof(doc -> 'blocks') is distinct from 'array' then doc
		else jsonb_set(doc, '{blocks}', (
			select coalesce(jsonb_agg(pg_temp.rename_action_label_block(block) order by ord), '[]'::jsonb)
			from jsonb_array_elements(doc -> 'blocks') with ordinality as t(block, ord)
		))
	end;
$$;

create or replace function pg_temp.rename_footer_links(doc jsonb) returns jsonb
language sql immutable as $$
	select case
		when jsonb_typeof(doc -> 'footer') is distinct from 'object' then doc
		else jsonb_set(doc, '{footer}', pg_temp.rename_in_list(
			pg_temp.rename_in_list_in_list(doc -> 'footer', 'navColumns', 'links', 'label', 'value'),
			'legalLinks', 'label', 'value'))
	end;
$$;

create or replace function pg_temp.rename_announcement_cta(doc jsonb) returns jsonb
language sql immutable as $$
	select case
		when jsonb_typeof(doc -> 'announcementBar') is distinct from 'object' then doc
		else jsonb_set(doc, '{announcementBar}', pg_temp.rename_action_at(doc -> 'announcementBar', 'cta', 'label', 'value'))
	end;
$$;

create or replace function pg_temp.rename_action_label_structures(doc jsonb) returns jsonb
language sql immutable as $$
	select case
		when doc is null or jsonb_typeof(doc) is distinct from 'object' then doc
		else pg_temp.rename_announcement_cta(pg_temp.rename_footer_links(doc))
	end;
$$;

create or replace function pg_temp.needs_action_label_rename(doc jsonb) returns boolean
language sql immutable as $$
	select pg_temp.rename_action_label(doc) is distinct from doc;
$$;

create or replace function pg_temp.needs_action_label_rename_structures(doc jsonb) returns boolean
language sql immutable as $$
	select pg_temp.rename_action_label_structures(doc) is distinct from doc;
$$;

update public.pages
set published_data = pg_temp.rename_action_label(published_data)
where pg_temp.needs_action_label_rename(published_data);

update public.structures
set published_data = pg_temp.rename_action_label_structures(published_data)
where pg_temp.needs_action_label_rename_structures(published_data);

do $$
begin
	if exists (select 1 from public.pages where pg_temp.needs_action_label_rename(published_data)) then
		raise exception 'pages.published_data draagt nog Action.label — de schrijfactie is niet aangekomen';
	end if;
	if exists (select 1 from public.structures where pg_temp.needs_action_label_rename_structures(published_data)) then
		raise exception 'structures.published_data draagt nog Action.label — de schrijfactie is niet aangekomen';
	end if;
end;
$$;
