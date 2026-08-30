-- Golf 4 heeft ctaBanner niet hernoemd maar geherstructureerd: de drie losse velden `tagline`,
-- `headline` en `subline` zijn vervangen door één genest `heading`-object uit het gedeelde
-- Heading-primitive ({ title, size, tagline, intro }). De opgeslagen blokken dragen nog de oude vorm:
-- { id, type: 'ctaBanner', media, subline, tagline, colorset, headline }.
--
-- Waarom de acht eerdere migraties (20260827120000 t/m 20260827190000) dit misten. Die zetten allemaal
-- één sleutelnaam om naar een andere sleutelnaam op dezelfde diepte — heading.value → heading.title,
-- runningText.content → value, action.label → value, faqItem.question/answer, footer.navColumns[].heading.
-- Hier verhuizen drie velden een niveau naar beneden én veranderen ze van naam; geen van die migraties
-- had daar een tak voor, en `headline` komt in geen van hun bestanden voor.
--
-- Waarom het niemand opviel. ctaBanner.heading is `.optional()`, dus Zod strípt de onbekende sleutels
-- `tagline`, `headline` en `subline` zonder te klagen: `heading` blijft undefined en HeadingGroup rendert
-- null. Geen gefaalde build, geen foutmelding — alleen een leeg blok bovenaan de live site. Dat is precies
-- het verschil met de vorige golf, waar het nieuwe veld verplicht was en de pagina hard omviel; daar was
-- de schade luid, hier is hij stil.
--
-- Gemeten omvang: 36 sleutels over 12 blokken, in `data` en `published_data` samen — /, /community en
-- /evenementen hebben er elk twee, /word-lid één.
--
-- LET OP bij het lezen: Heading.title is `.min(1)` en dus verplicht. Een blok zonder niet-lege `headline`
-- krijgt daarom géén heading-object. Een half gevuld `{ tagline, intro }` zou er geldig uitzien maar
-- Page.safeParse alsnog laten falen, en dan verdwijnt de hele pagina in plaats van dat er één blok leeg
-- staat. Zo'n blok blijft ongemoeid met zijn oude sleutels — Zod strípt ze toch — en wordt onderaan als
-- notice gemeld, zodat er met de hand een titel bij kan.
--
-- Alleen `pages`: ctaBanner is een pagina-blok. Het chrome-document in `structures` heeft geen
-- blocks-array en komt er niet aan te pas.
--
-- Deze migratie zet de conceptkolom om. De gepubliceerde kolom staat bewust in een eigen migratie
-- (20260827210000); de reden daarvoor staat daar.
--
-- Idempotent: er wordt alleen omgezet waar een niet-lege `headline` staat én `heading` ontbreekt. Na de
-- eerste run bestaat `heading`, dus een tweede run vindt niets meer. De detectie is de omzetting zelf —
-- een rij wordt geraakt als het resultaat verschilt van wat er staat — dus er is geen tweede
-- implementatie die van de eerste kan gaan afwijken. Documenten zonder ctaBanner, alle andere blokken en
-- velden, en de volgorde van de blokken blijven exact zoals ze zijn.

-- Twee dingen om in de gaten te houden bij het bewerken hieronder:
--
-- 1. De functienamen zijn nieuw en komen in geen eerdere migratie voor. Dat is met opzet: pg_temp leeft
--    per sessie, `supabase db push` draait alle migraties in dezelfde sessie, en `create or replace
--    function` weigert een functie waarvan een parameter anders heet dan bij een vorige definitie
--    (42P13). Een eigen naam is de simpelste manier om daar niet tegenaan te lopen.
-- 2. Haakjes om elke jsonb-aftrekking. Binair `-` bindt in Postgres sterker dan `->`, dus
--    `block -> 'heading' - 'value'` wordt gelezen als `block -> ('heading' - 'value')` en geeft
--    `operator is not unique: unknown - unknown` (42725). Die fout heeft eerder een hele push laten vallen.

-- Zet één ctaBanner-blok om. Elk ander blok-type gaat er ongewijzigd doorheen, dus een `headline`,
-- `tagline` of `subline` die in een ander bloktype voorkomt blijft staan. `type` is een gesloten
-- discriminated union, dus dat pad is exact.
--
-- De volgorde van de voorwaarden is de veiligheid:
--   * staat er al een `heading`, dan blijft het blok zoals het is — een reeds omgezet blok mag nooit
--     worden overschreven, en dat maakt de tweede run vanzelf een no-op;
--   * is `headline` afwezig, JSON null of leeg, dan blijft het blok óók zoals het is, want `title` is
--     verplicht en een heading zonder titel breekt de hele pagina in plaats van dit ene blok.
-- jsonb_strip_nulls haalt daarna `tagline` en `intro` weg als ze ontbraken; `title` staat er dan altijd.
create or replace function pg_temp.lift_cta_banner_heading_block(block jsonb) returns jsonb
language sql immutable as $$
	select case
		when block ->> 'type' is distinct from 'ctaBanner' then block
		when jsonb_exists(block, 'heading') then block
		when coalesce(block ->> 'headline', '') = '' then block
		else (block - 'tagline' - 'headline' - 'subline')
			|| jsonb_build_object('heading', jsonb_strip_nulls(jsonb_build_object(
				'tagline', block -> 'tagline',
				'title',   block -> 'headline',
				'intro',   block -> 'subline'
			)))
	end;
$$;

create or replace function pg_temp.lift_cta_banner_heading(doc jsonb) returns jsonb
language sql immutable as $$
	select case
		when doc is null or jsonb_typeof(doc -> 'blocks') is distinct from 'array' then doc
		else jsonb_set(doc, '{blocks}', (
			select coalesce(jsonb_agg(pg_temp.lift_cta_banner_heading_block(block) order by ord), '[]'::jsonb)
			from jsonb_array_elements(doc -> 'blocks') with ordinality as t(block, ord)
		))
	end;
$$;

create or replace function pg_temp.needs_cta_banner_heading_lift(doc jsonb) returns boolean
language sql immutable as $$
	select pg_temp.lift_cta_banner_heading(doc) is distinct from doc;
$$;

-- De voorwaarde is het verschil zelf, zodat een rij die niets te migreren heeft ook niet wordt
-- herschreven: sinds 20260816160000 hangt set_updated_at aan pages, en een no-op-update zou updated_at
-- van elke rij op de migratiedatum zetten.
update public.pages
set data = pg_temp.lift_cta_banner_heading(data)
where pg_temp.needs_cta_banner_heading_lift(data);

-- Wat er is overgeslagen, hardop. Dit zijn ctaBanner-blokken die nog een oude sleutel dragen maar geen
-- bruikbare `headline`: ze houden die sleutels, blijven zonder `heading` en renderen dus leeg. Een
-- ctaBanner die helemaal geen van de drie oude sleutels heeft telt niet mee — dat is gewoon een blok
-- zonder kop, en dat mag. Geen exception: de site draait ermee door, precies zoals nu. Maar het moet wel
-- iemand opvallen, want alleen een mens kan er een titel bij bedenken.
do $$
declare
	overgeslagen int;
begin
	select count(*) into overgeslagen
	from public.pages p
	cross join lateral jsonb_array_elements(
		case when jsonb_typeof(p.data -> 'blocks') = 'array' then p.data -> 'blocks' else '[]'::jsonb end
	) as t(block)
	where block ->> 'type' = 'ctaBanner'
		and not jsonb_exists(block, 'heading')
		and coalesce(block ->> 'headline', '') = ''
		and (jsonb_exists(block, 'tagline') or jsonb_exists(block, 'subline') or jsonb_exists(block, 'headline'));

	if overgeslagen > 0 then
		raise notice 'pages.data: % ctaBanner-blok(ken) zonder headline overgeslagen — die blijven zonder heading en renderen leeg; geef ze met de hand een titel', overgeslagen;
	end if;
end;
$$;
