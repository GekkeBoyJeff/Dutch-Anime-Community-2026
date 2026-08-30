-- Hoort bij 20260827140000: dezelfde omzetting van de oude namen voor lopende tekst (`text`, `body`,
-- `content`, `excerpt`, `summary`, de tekst-`description`) naar `value`, en van het klikbaar makende
-- `url`/`link` naar `href`, nu voor de gepubliceerde kolom. De twee kanalen worden nooit in één
-- statement geschreven — dat is precies hoe het bij de cardGrid-samenvoeging misging (20260816120000 /
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
-- Wat wél overeind blijft is de eis die eruit volgde: een migratie op deze kolom mag niet stil half
-- slagen. Onderaan controleert deze migratie daarom haar eigen uitkomst. Slikt iets de schrijfactie
-- alsnog in, dan faalt de migratie in plaats van de site.
--
-- Er wordt niets uit `data` overgezet: de gepubliceerde inhoud verandert alleen op de veldnamen na,
-- zodat een nog niet geaccepteerd concept niet ongemerkt live gaat.
--
-- Welk veld bij welk blok-type hoort, waarom een blinde zoek-vervang fout is en hoe de vervallen
-- fallback-`description` van bentoGrid, faqAccordion en subscribeNewsletter wordt afgehandeld, staat
-- bij 20260827140000; de functies hieronder zijn regel voor regel dezelfde, alleen zonder die uitleg.
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

create or replace function pg_temp.move_fallback_description(block jsonb) returns jsonb
language sql immutable as $$
	select case
		when not jsonb_exists(block, 'description') then block
		when jsonb_typeof(block -> 'heading') = 'object' and jsonb_exists(block -> 'heading', 'intro')
			then block - 'description'
		else (block - 'description') || jsonb_build_object('heading',
			(case when jsonb_typeof(block -> 'heading') = 'object' then block -> 'heading' else '{}'::jsonb end)
			|| jsonb_build_object('intro', block -> 'description'))
	end;
$$;

create or replace function pg_temp.rename_card_grid_items(block jsonb) returns jsonb
language sql immutable as $$
	select case block ->> 'variant'
		when 'article' then pg_temp.rename_in_list(block, 'items', 'excerpt', 'value')
		when 'event'   then pg_temp.rename_in_list(block, 'items', 'summary', 'value')
		when 'link'    then pg_temp.rename_in_list(pg_temp.rename_in_list(block, 'items', 'description', 'value'), 'items', 'url', 'href')
		else block
	end;
$$;

create or replace function pg_temp.rename_intro_grid_actions(block jsonb) returns jsonb
language sql immutable as $$
	select case
		when jsonb_typeof(block -> 'panels') is distinct from 'array' then block
		else jsonb_set(block, '{panels}', (
			select coalesce(jsonb_agg(
				case
					when jsonb_typeof(panel -> 'action') = 'object'
					then jsonb_set(panel, '{action}', pg_temp.rename_key(panel -> 'action', 'url', 'href'))
					else panel
				end
				order by ord
			), '[]'::jsonb)
			from jsonb_array_elements(block -> 'panels') with ordinality as t(panel, ord)
		))
	end;
$$;

create or replace function pg_temp.rename_running_text_block(block jsonb) returns jsonb
language sql immutable as $$
	select case block ->> 'type'
		when 'hero'           then pg_temp.rename_key(block, 'text', 'value')
		when 'textMedia'      then pg_temp.rename_key(block, 'text', 'value')
		when 'titleText'      then pg_temp.rename_key(block, 'text', 'value')
		when 'logoCloud'      then pg_temp.rename_key(block, 'description', 'value')
		when 'eventTeaser'    then pg_temp.rename_in_list(pg_temp.rename_key(block, 'description', 'value'), 'events', 'summary', 'value')
		when 'chatPreview'    then pg_temp.rename_in_list(block, 'messages', 'text', 'value')
		when 'highlightCards' then pg_temp.rename_in_list(block, 'items', 'text', 'value')
		when 'profileCards'   then pg_temp.rename_in_list(block, 'items', 'text', 'value')
		when 'featureCards'   then pg_temp.rename_in_list(block, 'items', 'body', 'value')
		when 'reviews'        then pg_temp.rename_in_list(block, 'items', 'body', 'value')
		when 'steps'          then pg_temp.rename_in_list(block, 'items', 'body', 'value')
		when 'stickyShowcase' then pg_temp.rename_in_list(block, 'steps', 'body', 'value')
		when 'showreel'       then pg_temp.rename_in_list(block, 'slides', 'link', 'href')
		when 'faqAccordion'   then pg_temp.move_fallback_description(pg_temp.rename_in_list(block, 'items', 'content', 'value'))
		when 'subscribeNewsletter' then pg_temp.move_fallback_description(block)
		when 'bentoGrid'      then pg_temp.move_fallback_description(
			pg_temp.rename_in_list(pg_temp.rename_in_list(block, 'items', 'body', 'value'), 'items', 'url', 'href'))
		when 'introGrid'      then pg_temp.rename_intro_grid_actions(block)
		when 'cardGrid'       then pg_temp.rename_card_grid_items(block)
		else block
	end;
$$;

create or replace function pg_temp.rename_running_text(doc jsonb) returns jsonb
language sql immutable as $$
	select case
		when doc is null or jsonb_typeof(doc -> 'blocks') is distinct from 'array' then doc
		else jsonb_set(doc, '{blocks}', (
			select coalesce(jsonb_agg(pg_temp.rename_running_text_block(block) order by ord), '[]'::jsonb)
			from jsonb_array_elements(doc -> 'blocks') with ordinality as t(block, ord)
		))
	end;
$$;

create or replace function pg_temp.needs_running_text_rename(doc jsonb) returns boolean
language sql immutable as $$
	select pg_temp.rename_running_text(doc) is distinct from doc;
$$;

update public.pages
set published_data = pg_temp.rename_running_text(published_data)
where pg_temp.needs_running_text_rename(published_data);

do $$
begin
	if exists (select 1 from public.pages where pg_temp.needs_running_text_rename(published_data)) then
		raise exception 'published_data draagt nog oude veldnamen — de schrijfactie is niet aangekomen';
	end if;
end;
$$;

-- Zoals bij 20260827140000: een verhuisde description kan in een heading zonder `title` belanden, en
-- dat kan alleen bij een blok dat helemaal geen heading had. De tekst blijft behouden, maar zo'n
-- heading valideert niet, dus hij wordt hier bij naam genoemd.
do $$
declare
	r record;
begin
	for r in
		select p.path, t.block ->> 'type' as block_type, coalesce(t.block ->> 'id', '(zonder id)') as block_id
		from public.pages p
		cross join lateral jsonb_array_elements(
			case when jsonb_typeof(p.published_data -> 'blocks') = 'array' then p.published_data -> 'blocks' else '[]'::jsonb end
		) as t(block)
		where jsonb_typeof(t.block -> 'heading') = 'object'
			and jsonb_exists(t.block -> 'heading', 'intro')
			and not jsonb_exists(t.block -> 'heading', 'title')
	loop
		raise notice 'pagina % blok %/%: gepubliceerde heading heeft een intro maar geen title — geef die kop een titel', r.path, r.block_type, r.block_id;
	end loop;
end;
$$;
