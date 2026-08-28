-- Golf 4 heeft de lopende tekst van een blok overal dezelfde naam gegeven: `value`. Wat eerder `text`,
-- `body`, `content`, `excerpt`, `summary` of een tekst-`description` heette, heet nu `value`; het veld
-- dat een heel element klikbaar maakt heet `href` in plaats van `url` (of `link`, bij een
-- showreel-slide). Elke pagina in Supabase draagt de oude namen nog. Zod strippt onbekende sleutels,
-- dus zo'n blok raakt zijn tekst kwijt, en waar het nieuwe veld verplicht is (faqAccordion.items[].value,
-- reviews.items[].value, de `href` van een link-kaart) faalt Page.safeParse en gooit getPageByPath bij
-- de eerstvolgende build — de pagina verdwijnt dan van de site.
--
-- Deze migratie zet de conceptkolom om. De gepubliceerde kolom staat bewust in een eigen migratie
-- (20260827150000); de reden daarvoor staat daar.
--
-- Per blok-type staat hieronder precies waar het veld zit. Sommige zitten op het blok zelf
-- (hero.text, logoCloud.description), andere alleen binnen een lijst (bentoGrid.items[].body,
-- introGrid.panels[].action.url), en bij cardGrid hangt de oude naam af van `variant`. Een blinde
-- zoek-vervang over het hele document zou meta.description (SEO), een swiper-bijschrift of een
-- Action-`url` meenemen; die houden hun naam met opzet.
--
-- De fallback-`description` van bentoGrid, faqAccordion en subscribeNewsletter vervalt. Die drie deden
-- `intro={heading?.intro ?? description}` en spreaden hun heading nu rechtstreeks. Staat er nog geen
-- `heading.intro`, dan verhuist de tekst daarheen; staat die er al, dan koos de fallback hem toch al en
-- kan de description weg. Dat spiegelt wat er in src/content/pages/* is gebeurd.
--
-- Idempotent: er wordt alleen hernoemd waar de oude naam staat én de nieuwe ontbreekt. De detectie is
-- de omzetting zelf — een rij wordt geraakt als het resultaat verschilt van wat er staat — dus er is
-- geen tweede implementatie die van de eerste kan gaan afwijken, en een tweede run vindt niets meer.
-- Blokken zonder deze velden, alle andere velden en de volgorde van blokken en items blijven exact
-- zoals ze zijn.

-- Hernoemt één sleutel in één object. Blijft van het object af zodra de nieuwe naam er al staat: een
-- bestaande `value` overschrijven is nooit de bedoeling, en een achtergebleven oude sleutel wordt door
-- Zod weggestript in plaats van dat hij de validatie breekt.
create or replace function pg_temp.rename_key(obj jsonb, src text, dst text) returns jsonb
language sql immutable as $$
	select case
		when jsonb_typeof(obj) is distinct from 'object' then obj
		when not jsonb_exists(obj, src) then obj
		when jsonb_exists(obj, dst) then obj
		else (obj - src) || jsonb_build_object(dst, obj -> src)
	end;
$$;

-- Hetzelfde, maar op elk element van één lijst van het blok. De volgorde van de lijst blijft.
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

-- De vervallen fallback-`description` van bentoGrid, faqAccordion en subscribeNewsletter.
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

-- cardGrid bewaart alle varianten in één platte itemvorm, dus de oude naam volgt uit `variant`:
-- artikel = excerpt, evenement = summary, link = description (plus `url`, dat de hele kaart klikbaar
-- maakt). Een `description` op een artikel- of evenementkaart is dus niet dezelfde lading en blijft.
create or replace function pg_temp.rename_card_grid_items(block jsonb) returns jsonb
language sql immutable as $$
	select case block ->> 'variant'
		when 'article' then pg_temp.rename_in_list(block, 'items', 'excerpt', 'value')
		when 'event'   then pg_temp.rename_in_list(block, 'items', 'summary', 'value')
		when 'link'    then pg_temp.rename_in_list(pg_temp.rename_in_list(block, 'items', 'description', 'value'), 'items', 'url', 'href')
		else block
	end;
$$;

-- introGrid zit een laag dieper: het klikbaar makende veld staat op `panels[].action`.
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

-- De volledige lijst, blok voor blok. Een type dat hier niet in staat wordt niet aangeraakt.
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

-- De voorwaarde is het verschil zelf, zodat een rij die niets te migreren heeft ook niet wordt
-- herschreven: sinds 20260816160000 hangt set_updated_at aan pages, en een no-op-update zou updated_at
-- van elke pagina op de migratiedatum zetten.
update public.pages
set data = pg_temp.rename_running_text(data)
where pg_temp.needs_running_text_rename(data);

-- Een verhuisde description kan in een heading terechtkomen die nog geen `title` heeft — dat kan alleen
-- bij een blok dat helemaal geen heading had. De tekst blijft dan behouden (weggooien is erger), maar
-- zo'n heading valideert niet, dus hij wordt hier bij naam genoemd in plaats van dat de build hem later
-- vindt.
do $$
declare
	r record;
begin
	for r in
		select p.path, t.block ->> 'type' as block_type, coalesce(t.block ->> 'id', '(zonder id)') as block_id
		from public.pages p
		cross join lateral jsonb_array_elements(
			case when jsonb_typeof(p.data -> 'blocks') = 'array' then p.data -> 'blocks' else '[]'::jsonb end
		) as t(block)
		where jsonb_typeof(t.block -> 'heading') = 'object'
			and jsonb_exists(t.block -> 'heading', 'intro')
			and not jsonb_exists(t.block -> 'heading', 'title')
	loop
		raise notice 'pagina % blok %/%: heading heeft een intro maar geen title — geef die kop een titel', r.path, r.block_type, r.block_id;
	end loop;
end;
$$;
