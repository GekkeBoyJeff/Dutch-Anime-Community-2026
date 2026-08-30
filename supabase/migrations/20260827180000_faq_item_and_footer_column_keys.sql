-- Twee hernoemingen die golf 4 wél in het schema heeft doorgevoerd maar niet in de opgeslagen JSON.
-- Allebei laten ze de eerstvolgende build vallen, want het nieuwe veld is verplicht:
--
--   pages.data       blok faqAccordion: items[].question → title, items[].answer → value
--   structures.data  footer.navColumns[].heading → title
--
-- Waarom de eerdere migraties ze misten. 20260827140000 heeft wél een faqAccordion-tak, maar die mapt
-- `items[].content` naar `value`, en zo heet het veld in de opgeslagen data niet: daar staat `answer`.
-- Die tak is voor deze inhoud dus een no-op, en `question` → `title` kwam er helemaal niet in voor.
-- 20260827160000 liep bij de footer wél door tot in `navColumns[].links[]` om `label` naar `value` te
-- brengen, maar sloeg het kopje van de kolom zelf over — FooterColumn.heading heet nu `title`, en dat
-- veld is verplicht (min 1).
--
-- De footer is de ernstigste van de twee. Hij zit in de site-structuur en wordt op élke pagina
-- geparsed, dus één achtergebleven `heading` daar laat parseContent gooien en dan valt de hele build
-- om, niet één route. Bij faqAccordion blijft de schade beperkt tot /word-lid: FaqItem eist `title` en
-- `value`, dus Page.safeParse faalt en getPageByPath gooit voor die ene pagina.
--
-- Deze migratie zet de conceptkolommen om, van beide contenttabellen. De gepubliceerde kolommen staan
-- bewust in een eigen migratie (20260827190000); de reden daarvoor staat daar.
--
-- Er wordt genavigeerd, niet gezocht — en bij `heading` is dat geen stijlkwestie maar de hele
-- veiligheid van deze migratie. Buiten de footer is `heading` juist een object
-- ({ tagline, title, size, intro }) dat aan bijna elk blok kan hangen; blind op die sleutel matchen zou
-- zo'n blokkop platslaan tot de string van een kolomkop, en 20260827120000 heeft daar net
-- `heading.value` → `heading.title` in gezet. De omzetting hieronder raakt daarom uitsluitend
-- `footer.navColumns[]` in de tabel `structures` aan; de blokken in `pages` komen er niet aan te pas.
-- Hetzelfde geldt voor `question` en `answer`: die worden alleen hernoemd binnen `items[]` van een blok
-- waarvan `type` letterlijk 'faqAccordion' is. Het type-veld is een gesloten discriminated union, dus
-- dat pad is exact.
--
-- Idempotent: er wordt alleen hernoemd waar de oude naam staat én de nieuwe ontbreekt. De detectie is
-- de omzetting zelf — een rij wordt geraakt als het resultaat verschilt van wat er staat — dus er is
-- geen tweede implementatie die van de eerste kan gaan afwijken, en een tweede run vindt niets meer.
-- Documenten zonder faqAccordion respectievelijk zonder footer, alle andere velden en de volgorde van
-- blokken, items en kolommen blijven exact zoals ze zijn.

-- Let op bij het lezen: `rename_key` en `rename_in_list` staan hier woordelijk zoals in 20260827140000,
-- parameternamen inbegrepen. Dat is geen slordigheid maar een eis — pg_temp leeft per sessie, `supabase
-- db push` draait alle migraties in dezelfde sessie, en `create or replace function` weigert een
-- functie waarvan een parameter anders heet dan bij de vorige definitie (42P13). Hernoem `block` hier
-- dus niet naar iets duidelijkers; de functies eronder hebben daarom ook eigen namen.

-- Hernoemt één sleutel in één object. Blijft van het object af zodra de nieuwe naam er al staat: een
-- bestaande `title` of `value` overschrijven is nooit de bedoeling, en een achtergebleven oude sleutel
-- wordt door Zod weggestript in plaats van dat hij de validatie breekt.
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

-- Alleen faqAccordion. Elk ander blok-type gaat er ongewijzigd doorheen, dus een `question` of `answer`
-- die ergens anders in het document staat blijft staan.
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

-- De chrome is één document met vaste sleutels in plaats van een blokkenlijst, dus hier wordt per
-- sleutel genavigeerd: alleen het kopje van elke kolom onder `footer.navColumns`. Dat was de enige
-- plek in het contentmodel waar `heading` een string droeg; overal elders is `heading` het
-- Heading-object, en dat staat in `pages`, niet in dit document. `footer.brand`, `footer.socialLinks`,
-- `footer.legalLinks` en de links binnen een kolom worden niet aangeraakt.
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

-- De voorwaarde is het verschil zelf, zodat een rij die niets te migreren heeft ook niet wordt
-- herschreven: sinds 20260816160000 hangt set_updated_at aan pages én structures, en een no-op-update
-- zou updated_at van elke rij op de migratiedatum zetten.
update public.pages
set data = pg_temp.rename_faq_item_keys(data)
where pg_temp.needs_faq_item_rename(data);

update public.structures
set data = pg_temp.rename_footer_column_titles(data)
where pg_temp.needs_footer_column_title_rename(data);
