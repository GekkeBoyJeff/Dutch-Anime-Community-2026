-- Hoort bij 20260827200000: dezelfde herstructurering van ctaBanner — de losse `tagline`, `headline` en
-- `subline` naar één genest `heading`-object ({ tagline, title, intro }) — nu voor de gepubliceerde
-- kolom. De twee kanalen worden nooit in één statement geschreven; dat is precies hoe het bij de
-- cardGrid-samenvoeging misging (20260816120000 / 20260816130000).
--
-- De valkuil van toen: er hing een trigger (protect_published_columns, 20260724100001) die elke directe
-- schrijfactie op published_* stilletjes terugdraaide tenzij de sessievlag app.approving op '1' stond.
-- De migratie meldde dat hij slaagde, alleen de conceptkolom was omgezet, en /evenementen bleef op het
-- gepubliceerde kanaal kapot zonder één signaal. Die trigger en die vlag bestaan niet meer:
-- 20260816150000 heeft ze vervangen door kolomrechten, en die beperken alleen `authenticated`, niet de
-- eigenaar die migraties draait. `set_config('app.approving', ...)` zou hier dus naar een mechanisme
-- wijzen dat er niet is.
--
-- Wat wél overeind blijft is de eis die eruit volgde: een migratie op deze kolom mag niet stil half
-- slagen. Onderaan controleert deze migratie daarom haar eigen uitkomst. Dat weegt hier zwaarder dan
-- gewoonlijk, want dit is precies het kanaal waar het probleem zichtbaar is: `published_data` voedt de
-- live site, en daar staat nu op vier pagina's een leeg CTA-blok.
--
-- Waarom deze herstructurering nodig is terwijl de acht migraties van golf 4 er al langs kwamen — die
-- hernoemen sleutels op dezelfde diepte, terwijl hier drie velden een niveau naar beneden verhuizen én
-- van naam veranderen — en waarom een blok zonder niet-lege `headline` met rust wordt gelaten (Heading.title
-- is `.min(1)`, dus een heading zonder titel laat Page.safeParse falen en dan verdwijnt de hele pagina in
-- plaats van dat er één blok leeg staat), staat bij 20260827200000. De functies hieronder zijn regel voor
-- regel dezelfde, alleen zonder die uitleg — parameternamen inbegrepen, want pg_temp leeft per sessie en
-- `create or replace function` weigert een functie waarvan een parameter anders heet dan bij de vorige
-- definitie (42P13).
--
-- Er wordt niets uit `data` overgezet: de gepubliceerde inhoud verandert alleen van vorm, zodat een nog
-- niet geaccepteerd concept niet ongemerkt live gaat.
--
-- Idempotent op dezelfde voorwaarde: alleen omzetten waar een niet-lege `headline` staat én `heading`
-- ontbreekt, en de detectie is de omzetting zelf, dus een tweede run vindt niets meer.

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

update public.pages
set published_data = pg_temp.lift_cta_banner_heading(published_data)
where pg_temp.needs_cta_banner_heading_lift(published_data);

-- Controle op de eigen uitkomst: slikt iets de schrijfactie alsnog in, dan faalt de migratie in plaats
-- van de site. De check dekt exact wat deze migratie belooft — blokken die zij overslaat (geen niet-lege
-- `headline`) tellen niet mee, want die zijn met opzet blijven staan.
do $$
begin
	if exists (select 1 from public.pages where pg_temp.needs_cta_banner_heading_lift(published_data)) then
		raise exception 'pages.published_data draagt nog ctaBanner-blokken met losse headline/tagline/subline — de schrijfactie is niet aangekomen';
	end if;
end;
$$;

-- Wat er is overgeslagen, hardop: ctaBanner-blokken die nog een oude sleutel dragen maar geen bruikbare
-- `headline`. Die houden die sleutels, blijven zonder `heading` en renderen leeg op de live site. Een
-- ctaBanner zonder een van de drie oude sleutels telt niet mee — dat is gewoon een blok zonder kop. Geen
-- exception: dat is de situatie zoals hij nu al is. Maar het moet iemand opvallen, want alleen een mens
-- kan er een titel bij bedenken.
do $$
declare
	overgeslagen int;
begin
	select count(*) into overgeslagen
	from public.pages p
	cross join lateral jsonb_array_elements(
		case when jsonb_typeof(p.published_data -> 'blocks') = 'array' then p.published_data -> 'blocks' else '[]'::jsonb end
	) as t(block)
	where block ->> 'type' = 'ctaBanner'
		and not jsonb_exists(block, 'heading')
		and coalesce(block ->> 'headline', '') = ''
		and (jsonb_exists(block, 'tagline') or jsonb_exists(block, 'subline') or jsonb_exists(block, 'headline'));

	if overgeslagen > 0 then
		raise notice 'pages.published_data: % ctaBanner-blok(ken) zonder headline overgeslagen — die blijven zonder heading en renderen leeg; geef ze met de hand een titel', overgeslagen;
	end if;
end;
$$;
