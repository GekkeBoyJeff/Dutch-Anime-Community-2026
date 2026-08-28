-- Het Action-primitive heeft zijn tekstveld hernoemd van `label` naar `value`, gelijk aan wat `value`
-- overal betekent: de eigen lading van dit ding. `value` is verplicht in het schema, dus elke pagina in
-- Supabase die nog `label` draagt raakt op zijn best de knoptekst kwijt (Zod strippt de onbekende
-- sleutel) en faalt in het gewone geval op Page.safeParse, waarna getPageByPath gooit bij de
-- eerstvolgende build — die pagina verdwijnt dan van de site.
--
-- Deze migratie zet de conceptkolom om, van beide contenttabellen: `pages` (de blokken) en
-- `structures` (de chrome). De footer hoort er echt bij — FooterLink is `Action.pick({ value: true })`,
-- dus hij erft de hernoeming rechtstreeks, en de footer staat op élke pagina: één achtergebleven
-- `label` daar laat parseContent gooien en dan valt de hele build om, niet één route. De gepubliceerde
-- kolommen staan bewust in een eigen migratie (20260827170000); de reden daarvoor staat daar.
--
-- Waar een Action precies zit, is per plek uitgezocht en hieronder bij naam benoemd. Dat is de kern van
-- deze migratie: `label` is in dit document een veelgebruikte naam die meestal iets ánders is dan een
-- knoptekst — een filterchip, een sorteeroptie, een bijschrift onder een getal, de toegankelijke naam
-- van een social-icoon. Er wordt daarom nooit gezocht naar `label`; er wordt genavigeerd naar de zes
-- plekken in een pagina en de drie in de chrome waar het schema een Action toestaat, en alleen daar
-- hernoemd. Het `type`-veld van een blok is een gesloten discriminated union, dus dat pad is exact:
--
--   pages.data
--     hero.actions[]                      HeroAction (Action.pick)
--     hero.socials[]                      Action     — let op: profileCards.items[].socials[] is
--                                                      ProfileSocial en houdt zijn `label`
--     titleText.actions[]                 Action
--     ctaBanner.primaryCta                Action
--     ctaBanner.secondaryCta              Action
--     highlightCards.items[].actions[]    Action
--     bentoGrid.items[].cta               Action
--   structures.data
--     footer.navColumns[].links[]         FooterLink — footer.socialLinks[] is FooterSocial en houdt
--                                                      zijn `label` (dat is een a11y-naam)
--     footer.legalLinks[]                 FooterLink
--     announcementBar.cta                 Action     — let op: navigation.cta is NavCta en houdt zijn
--                                                      `label`, terwijl het veld net zo heet
--
-- Niet meegenomen, met reden: introGrid.panels[].action is een eigen slank label/href/icon en geen
-- Action (dat staat ook zo in introGrid.ts); TimelineItem.actions[] is wél een Action-lijst, maar
-- Timeline is een component zonder blok, dus die vorm kan niet in opgeslagen JSON voorkomen; cardGrid
-- en itemCardGrid hebben een `cta`, maar dat is een kale string, geen object.
--
-- Idempotent: er wordt alleen hernoemd waar `label` staat én `value` ontbreekt. De detectie is de
-- omzetting zelf — een rij wordt geraakt als het resultaat verschilt van wat er staat — dus er is geen
-- tweede implementatie die van de eerste kan gaan afwijken, en een tweede run vindt niets meer.
-- Blokken zonder Actions, alle andere velden en de volgorde van blokken, items en links blijven exact
-- zoals ze zijn.

-- Let op bij het lezen: `rename_key` en `rename_in_list` staan hier woordelijk zoals in 20260827140000,
-- parameternamen inbegrepen. Dat is geen slordigheid maar een eis — pg_temp leeft per sessie, `supabase
-- db push` draait beide migraties in dezelfde sessie, en `create or replace function` weigert een
-- functie waarvan een parameter anders heet dan bij de vorige definitie (42P13). Hernoem `block` hier
-- dus niet naar iets duidelijkers; de nieuwe helpers eronder hebben daarom ook eigen namen.

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

-- Eén enkelvoudige Action die als eigen veld onder een object hangt (ctaBanner.primaryCta,
-- announcementBar.cta). Staat er geen object onder die sleutel, dan gebeurt er niets.
create or replace function pg_temp.rename_action_at(obj jsonb, action_key text, src text, dst text) returns jsonb
language sql immutable as $$
	select case
		when jsonb_typeof(obj -> action_key) is distinct from 'object' then obj
		else jsonb_set(obj, array[action_key], pg_temp.rename_key(obj -> action_key, src, dst))
	end;
$$;

-- Een enkelvoudige Action die een laag dieper zit, onder een veld van elk lijstelement
-- (bentoGrid.items[].cta).
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

-- Een lijst Actions binnen elk element van een lijst (highlightCards.items[].actions[],
-- footer.navColumns[].links[]). Beide volgordes blijven.
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

-- De volledige lijst, blok voor blok. Een type dat hier niet in staat wordt niet aangeraakt — en dat
-- is precies wat hero.socials[] van profileCards.items[].socials[] scheidt.
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

-- De chrome is één document met vaste sleutels in plaats van een blokkenlijst, dus hier wordt per
-- sleutel genavigeerd. `footer.socialLinks[]` en `navigation` komen er bewust niet in voor.
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

-- De voorwaarde is het verschil zelf, zodat een rij die niets te migreren heeft ook niet wordt
-- herschreven: sinds 20260816160000 hangt set_updated_at aan pages én structures, en een no-op-update
-- zou updated_at van elke pagina op de migratiedatum zetten.
update public.pages
set data = pg_temp.rename_action_label(data)
where pg_temp.needs_action_label_rename(data);

update public.structures
set data = pg_temp.rename_action_label_structures(data)
where pg_temp.needs_action_label_rename_structures(data);
