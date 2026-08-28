-- Hoort bij 20260827180000: dezelfde twee hernoemingen — faqAccordion.items[].question → title en
-- items[].answer → value in `pages`, footer.navColumns[].heading → title in `structures` — nu voor de
-- gepubliceerde kolommen. De twee kanalen worden nooit in één statement geschreven; dat is precies hoe
-- het bij de cardGrid-samenvoeging misging (20260816120000 / 20260816130000).
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
-- `heading` daar laat de hele build vallen en niet één route.
--
-- Er wordt niets uit `data` overgezet: de gepubliceerde inhoud verandert alleen op de veldnamen na,
-- zodat een nog niet geaccepteerd concept niet ongemerkt live gaat.
--
-- Waarom deze twee hernoemingen nodig waren terwijl 20260827140000 en 20260827160000 er al langs
-- kwamen — de faqAccordion-tak daar mapt `content`, een sleutel die in deze data niet bestaat, en de
-- footer-tak stopte bij `navColumns[].links[]` — en waarom er wordt genavigeerd in plaats van gezocht,
-- staat bij 20260827180000. Kort: `heading` is buiten de footer juist een object en mag nooit blind op
-- sleutelnaam worden geraakt, dus de omzetting komt alleen binnen `footer.navColumns[]`. De functies
-- hieronder zijn regel voor regel dezelfde, alleen zonder die uitleg. Dat geldt ook voor de
-- parameternamen: pg_temp leeft per sessie en `create or replace function` weigert een functie waarvan
-- een parameter anders heet dan bij de vorige definitie (42P13).
--
-- Idempotent op dezelfde voorwaarde: alleen hernoemen waar de oude naam staat én de nieuwe ontbreekt,
-- en de detectie is de omzetting zelf, dus een tweede run vindt niets meer.

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

create or replace function pg_temp.rename_faq_item_keys_block(block jsonb) returns jsonb
language sql immutable as $$
	select case
		when block ->> 'type' is distinct from 'faqAccordion' then block
		else pg_temp.rename_in_list(
			pg_temp.rename_in_list(block, 'items', 'question', 'title'),
			'items', 'answer', 'value')
	end;
$$;

create or replace function pg_temp.rename_faq_item_keys(doc jsonb) returns jsonb
language sql immutable as $$
	select case
		when doc is null or jsonb_typeof(doc -> 'blocks') is distinct from 'array' then doc
		else jsonb_set(doc, '{blocks}', (
			select coalesce(jsonb_agg(pg_temp.rename_faq_item_keys_block(block) order by ord), '[]'::jsonb)
			from jsonb_array_elements(doc -> 'blocks') with ordinality as t(block, ord)
		))
	end;
$$;

create or replace function pg_temp.rename_footer_column_titles(doc jsonb) returns jsonb
language sql immutable as $$
	select case
		when doc is null or jsonb_typeof(doc -> 'footer') is distinct from 'object' then doc
		else jsonb_set(doc, '{footer}', pg_temp.rename_in_list(doc -> 'footer', 'navColumns', 'heading', 'title'))
	end;
$$;

create or replace function pg_temp.needs_faq_item_rename(doc jsonb) returns boolean
language sql immutable as $$
	select pg_temp.rename_faq_item_keys(doc) is distinct from doc;
$$;

create or replace function pg_temp.needs_footer_column_title_rename(doc jsonb) returns boolean
language sql immutable as $$
	select pg_temp.rename_footer_column_titles(doc) is distinct from doc;
$$;

update public.pages
set published_data = pg_temp.rename_faq_item_keys(published_data)
where pg_temp.needs_faq_item_rename(published_data);

update public.structures
set published_data = pg_temp.rename_footer_column_titles(published_data)
where pg_temp.needs_footer_column_title_rename(published_data);

do $$
begin
	if exists (select 1 from public.pages where pg_temp.needs_faq_item_rename(published_data)) then
		raise exception 'pages.published_data draagt nog faqAccordion-items met question/answer — de schrijfactie is niet aangekomen';
	end if;
	if exists (select 1 from public.structures where pg_temp.needs_footer_column_title_rename(published_data)) then
		raise exception 'structures.published_data draagt nog footer.navColumns[].heading — de schrijfactie is niet aangekomen';
	end if;
end;
$$;
