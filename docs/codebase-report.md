# Codebase-rapport — Dutch Anime Community 2026

> Gegenereerde technische documentatie van de `dac-website` codebase. Uitsluitend
> gebaseerd op wat in de code is aangetroffen (Next.js App Router + Supabase).
> Waar iets onduidelijk of afwezig was, is dat expliciet gemarkeerd.
>
> **Peildatum:** 2026-07-17 · **Branch:** `main`

---

## Inhoudsopgave

1. [Overzicht & architectuur](#1-overzicht--architectuur)
2. [Tech-stack](#2-tech-stack)
3. [Mappenstructuur](#3-mappenstructuur)
4. [Routes & pagina's (`src/app`)](#4-routes--paginas-srcapp)
5. [API-routes](#5-api-routes)
6. [Componenten & hooks](#6-componenten--hooks)
7. [Lib / logica-laag (`src/lib`)](#7-lib--logica-laag-srclib)
8. [Content-laag (`src/content`) & scripts](#8-content-laag-srccontent--scripts)
9. [Database (Supabase)](#9-database-supabase)
10. [Edge Functions](#10-edge-functions)
11. [Deploy, security & PWA](#11-deploy-security--pwa)
12. [Losse eindjes & aandachtspunten](#12-losse-eindjes--aandachtspunten)

---

## 1. Overzicht & architectuur

De **Dutch Anime Community (DAC)** website is een moderne merk-site (geen forum) met
één conversiedoel: bezoekers naar de Discord leiden. De codebase is echter twee dingen
tegelijk:

1. **Een schema-gevalideerde content-site** — voortgekomen uit de `NEXT_TS_SETUP`-starter.
   Pagina's zijn *data* (`{ meta, blocks }`), gevalideerd met Zod bij het laden. Een
   visuele **Puck**-editor (dev-only) wordt uit exact dezelfde schema's gegenereerd en
   kan dus niet afwijken van het contract.
2. **Een volledig Supabase-RBAC-beheerplatform** — daaroverheen gebouwd in ~8 fases:
   een `/dashboard` met rollen & permissies, moderatie, inventaris/conventiebeheer,
   declaraties (met PDF), badges en push-meldingen. Alle beveiliging leunt op Postgres
   **Row Level Security** + `SECURITY DEFINER`-RPC's.

**Router:** puur **App Router** (`src/app/`), geen Pages Router. Twee route groups:
- `(website)` — de publieke site (home + catch-all `[...slug]`).
- `(admin)` — het beveiligde dashboard + media-upload.

**Twee deploy-targets uit één codebase**, geschakeld via `HOST_TYPE`:
- `server` (default) — een Node-host met de dynamische features (API-routes, headers).
- `static` — `output: 'export'` statische export voor een statische host (DirectAdmin/
  GitHub Pages). De publieke pagina-data wordt bij **build-time** via de service-role
  uit Supabase gelezen en meegebakken; het dashboard blijft een client-side SPA die op
  runtime tegen Supabase praat.

**Kernprincipes die telkens terugkomen:**
- **Content is data.** Een pagina selecteert per block een component; secties toevoegen =
  data bewerken. De accessors (`src/lib/content`) zijn al `async`, zodat de databron
  inruilen voor een CMS-fetch een wijziging *binnen* `lib/content` is.
- **Eén contract, geen drift.** De Zod-schema's zijn de single source of truth; alle
  TypeScript-types worden eruit geïnfereerd, en de render-registry én de builder leiden
  eruit af. Een mis-wire is een compile-error.
- **RLS is de échte grens.** UI-permissiechecks (`usePermissions`, `useDashboardGuard`)
  zijn puur UX; de database dwingt af. Er zijn **geen Next.js server actions** — alle
  runtime-mutaties lopen client-side via de browser-client onder RLS + RPC's.

---

## 2. Tech-stack

Uit `package.json` (`"type": "module"`, `engines.node >= 22`):

| Categorie | Pakket / versie | Rol |
| --- | --- | --- |
| Framework | `next ^16.2.9` (App Router) | SSR/SSG + static export |
| UI-runtime | `react ^19.2`, `react-dom ^19.2` | — |
| Taal | `typescript ^5.7` | strict + `noUncheckedIndexedAccess` |
| Backend/DB | `@supabase/supabase-js ^2.109` | Postgres, Auth (Discord OAuth), Storage, Realtime |
| Validatie | `zod ^4.4` | content-contract + env-contract |
| Env | `@t3-oss/env-nextjs ^0.13` | getypeerd env, server/client-grens |
| CMS/builder | `@puckeditor/core ^0.22` + `plugin-heading-analyzer` | dev-only visuele editor |
| Forms | `react-hook-form ^7.80` + `@hookform/resolvers ^5.4` | formulieren |
| UI-primitieven | `@base-ui/react ^1.6`, `lucide-react ^1.21`, `cmdk ^1.1`, `embla-carousel-react ^8.6` | a11y-widgets, iconen, command palette, carousels |
| Styling | `sass` / `sass-embedded ^1.1` | SCSS, token-driven theming |
| PWA | `serwist` + `@serwist/next ^9.5` | opt-in service worker (`ENABLE_PWA=true`) |
| PDF | `@react-pdf/renderer ^4.5`, `pdf-lib ^1.17` | declaratie-rapporten & bon-compressie |
| Images | `sharp ^0.35` (build), `browser-image-compression ^2.0`, `heic-to ^1.5` | optimalisatie & upload-voorbewerking |
| Sanitisatie | `isomorphic-dompurify ^3.18`, `html-react-parser ^6.1` | veilige richtext |
| Overig | `web-haptics ^0.0.6`, `server-only ^0.0.1` | haptics, server/client-grens |
| Dev/docs | `storybook ^10.4` (+ addons), `eslint ^9.39` (flat config), `tsx ^4.23`, `vite ^8` | component-workshop, lint, scripts |

**Scripts (`package.json`):**

| Script | Doet |
| --- | --- |
| `npm run dev` | Dev-server (Turbopack), incl. `/builder` |
| `npm run build` | `npm run images` → `ENABLE_PWA=true next build --webpack` (PWA-build) |
| `npm run build:plain` | `npm run images` → `next build` (plain Turbopack, geen SW) |
| `npm run start` | Serve productiebuild |
| `npm run lint` | ESLint (flat config, `eslint-config-next`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run storybook` / `build-storybook` | Component-workshop + developer-docs |
| `npm run images` | `optimize-images.mjs` + `generate-builder-manifest.mjs` |
| `npm run seed` | `tsx scripts/seed-supabase.ts` — TS-content → Supabase |

---

## 3. Mappenstructuur

```
src/
├── app/                    75 ts/tsx — App Router: routes, layouts, API, dashboard
│   ├── (website)/          publieke site: home + [...slug] catch-all
│   ├── (admin)/            dashboard/* + upload  (beveiligd)
│   ├── account/            ledenpagina (meldingen, badges, push)
│   ├── auth/callback/      Discord OAuth-return
│   ├── login/              Discord-login
│   ├── builder/            Puck visuele editor (dev/opt-in)
│   ├── api/                5 route handlers (og, revalidate, draft, …)
│   ├── _components/        PageView, TermsGate
│   └── *.ts(x)             layout, error, sitemap, robots, manifest, opengraph-image
├── components/            134 tsx — 5 tiers (basics, components, contentBlocks, forms, structures)
├── hooks/                  6 client-hooks
├── lib/                   153 ts/tsx — auth (RBAC), supabase, content(-schema), puck, pdf, …
│   └── content/schema/     Zod-contract: basics/ blocks/ components/ forms/ structures/
├── content/                7 — concrete pagina-data (home, community, evenementen, …)
├── styles/                 SCSS, mirror van de componentmappen (token-driven)
└── types/                  require-context.d.ts

supabase/
├── migrations/            48 SQL-bestanden (gefaseerd: access, cms, moderation, inventory, fase1..8)
├── functions/             3 Edge Functions (deploy, discord-sync, send-push)
└── config.toml

scripts/   optimize-images.mjs · generate-builder-manifest.mjs · seed-supabase.ts · check-scss.mjs
docs/      dit rapport + superpowers/plans + specs
```

**Alias:** `@/*` → `./src/*` (`tsconfig.json`).

---

## 4. Routes & pagina's (`src/app`)

> Alle Supabase-toegang in de UI loopt via `getBrowserClient()` (browser-client onder de
> JWT van de gebruiker). RLS is telkens de échte grens; UI-checks zijn UX. Omdat productie
> een statische export is, gebruiken dashboard-detailschermen **query-param routing
> (`?id=`)** i.p.v. `[id]`, en staat `useSearchParams` overal achter `<Suspense>`.

### Root `src/app/`

| Bestand | Type | Wat |
| --- | --- | --- |
| `layout.tsx` | Server | RootLayout (`<html lang=nl data-theme=dac>` / `<body data-colorset=light>`), self-host Manrope+Poppins, `metadata`/`viewport`, rendert `<JsonLd>` (organization) + `<ServiceWorker>` (PWA opt-in). |
| `error.tsx` | **Client** | Route error boundary (`error`, `reset`); toont retry + `error.digest`. |
| `global-error.tsx` | **Client** | Vangt fouten in de root-layout zelf; self-contained `<html>/<body>` met **inline** styles. |
| `loading.tsx` | Server | Triviale Suspense-fallback. |
| `not-found.tsx` | Server (async) | Custom 404; laadt copy uit content-layer, wrapt zich in eigen `<SiteChrome>`. |
| `manifest.ts` | Server (`force-static`) | Web app manifest; houdt rekening met `NEXT_PUBLIC_BASE_PATH`. |
| `robots.ts` | Server (`force-static`) | robots.txt + sitemap-link. |
| `sitemap.ts` | Server (`force-static`, async) | sitemap.xml uit `getAllPagePaths()` (home prio 1, rest 0.8). |
| `opengraph-image.tsx` | Server (`force-static`) | Site-brede default OG-kaart (fallback voor routes zonder eigen image). |

**`_components/`**
- **`PageView.tsx`** — Server (async). Prop `path`. Gedeelde render-plumbing: `getPageByPath` → `notFound()` of `<Blocks>` + JSON-LD.
- **`TermsGate.tsx`** — Client. Exporteert `TERMS_VERSION = '2026-07-17'`. Ingelogde user moet actuele voorwaarden accepteren (`profiles.terms_accepted_at/terms_version`) vóór dashboard/account bruikbaar zijn.

### `(website)/` — publieke site

| Bestand | Type | Details |
| --- | --- | --- |
| `layout.tsx` | Server (async) | `resolveChrome(getSiteStructures())` → `.page-frame > .page-frame-scroll` (dé scroll-container) met `<SiteChrome>`. Overlays (ScrollProgress, SearchPalette, CookieConsent, RevealObserver) hier (niet in SiteChrome) zodat de builder-preview ze niet krijgt. |
| `page.tsx` | Server | Home `/`; `generateMetadata` → `pageMetadata('/')`; `<PageView path="/">`. |
| `[...slug]/page.tsx` | Server (async) | **Catch-all**. `generateStaticParams` = alle content-paden behalve `/` (statisch geprerenderd). `dynamicParams = false` → onbekend pad 404't. `<PageView path={pathFromSlug(slug)}>`. |

### Auth-flow (`login/`, `auth/callback/`, `account/`)

| Bestand | Type | Details |
| --- | --- | --- |
| `login/_components/LoginForm.tsx` | Client | Leest `?next` (default `/dashboard`), knop → `signInWithDiscord(next)`. |
| `auth/callback/_components/CallbackInner.tsx` | Client | Wisselt OAuth-`code`→session; `router.replace(safeNext(next))` (open-redirect-guard); firet éénmalig Edge Function `discord-sync` met `provider_token`. |
| `account/_components/AccountPanel.tsx` | Client | Ledenpagina: `profiles.username`, RPC `my_warnings`/`my_badges`, badges, `<NotificationsList>`, `<PushToggle>`, uitloggen. |
| `account/_components/NotificationsList.tsx` | Client | Eigen `notifications` (RLS eigen rijen), **realtime** via `postgres_changes`; markeer gelezen (`read_at`). |
| `account/_components/PushToggle.tsx` | Client | Web-push aan/uit via `@/lib/push`. |

### `(admin)/` — beheer

**Shell** (`dashboard/_components/`): `(admin)/layout.tsx` → `<AdminShell>` (`data-theme=admin`, `NotificationProvider`, `<DashboardChrome>`, toast-outlet). `DashboardNav` filtert `DASHBOARD_SECTIONS` op permissie; `DashboardShell` is de staf-hub (`useDashboardGuard(undefined)` — elke permissie ontgrendelt; 0 → `/account`). `PersonPicker` = herbruikbare owner/assignee-picker.

**Dashboard-secties** (elke `page.tsx` = thin Server wrapper met noindex-`metadata`; logica in `_components`):

| Sectie | Permissie | Belangrijkste component & DB-raakvlak |
| --- | --- | --- |
| **access/** | `roles.manage` | `AccessManager` — rollen + per-user grants: `user_roles`, `user_permissions`, `role_permissions`, `profiles`. Self-editing gedisabled. |
| **events/** | `inventory.manage` | `EventEditor` + tabs `AgendaTab` (shifts + RPC `apply_shift_swap`/`cancel_swap`), `ActivitiesTab`, `CostsTab` (declaraties enkel bij `expenses.manage`). |
| **inventory/** | `inventory.manage` | `InventoryManager` — `inventory_items` + `events` + `item_unavailability`; verwijderen via RPC `hard_delete`. `EventDetail` (assignments/tickets), `ItemAvailabilityDrawer` (RPC `decide_item_unavailability`). |
| **my-inventory/** | `inventory.view` | `MyInventory` — **scopet expliciet op `session.user.id`**; RPC's `my_subject_id`, `set_packed`, `request_item_unavailability`, `cancel_own_item_unavailability`, `my_assignment_item_names`. |
| **expenses/** | `expenses.view` (+`.manage`) | `MyExpenses` (indienen, verplicht bonnetje), `ExpensesReview` (RPC `review_expense`, PDF-export), `ExpensesOverview`, `PayoutDetailsDrawer` (IBAN in `payout_details`). |
| **moderation/** | `moderation.view` (+`.manage`, `records.delete`, `badges.manage`) | `ModerationManager` → `ProfileList`/`ProfileDetail` met tabs Warnings/Bans/Notes/Links (RPC `merge_subjects`)/Badges + `EvidenceDrawer` (privé `mod-evidence`-bucket). |
| **logs/** | `logs.view` | `LogsViewer` — read-only `activity_log` + `audit_log` (veld-diff), `.limit(300)`. |
| **notifications/** | `notifications.send` | `NotificationsComposer` — leden via RPC `list_notifiable_members`, verstuurt via Edge Function `send-push`. |

**`upload/`** (permissie `media.manage`): `Uploader` — media naar publieke `media`-bucket (webp voor beelden, PDF as-is).

### `builder/` — visuele CMS-editor (gate `pages.edit`)
- `PuckEditor.tsx` (Client) — Puck-editor-island; laadt pagina + structures uit Supabase; publiceren = Zod-validatie (`Page`/`SiteStructures`) + `sanitizePage` → upsert. Bronnen: bestaande pagina / nieuw / template. Heading-analyzer audit-panel.
- `BlockDrawer.tsx` + `presetBridge.ts` — component-drawer met Storybook-preset-varianten; module-level hand-off tussen de aparte React-trees (15s-TTL).

---

## 5. API-routes

Vijf route handlers onder `src/app/api/`. Bij de **statische export** worden deze niet
meegebouwd; ze bestaan voor de server-mode / dev.

| Route | Methode | Wat / gating |
| --- | --- | --- |
| `builder/images/route.ts` | GET (`force-dynamic`) | Dev-only media-picker (`readdir` van `/public`). **404 in production.** |
| `draft/route.ts` | GET | Toggelt Next Draft Mode. Gate: niet-prod **of** `x-debug-secret`/`?secret` == `DEBUG_SECRET`; anders 404. |
| `get-page-by-path/route.ts` | GET (`force-dynamic`) | Content-inspector (`getPageByPath(?path)` → JSON). Gate: niet-prod **of** draftMode **of** `DEBUG_SECRET`; anders 404. |
| `og/route.tsx` | GET | Per-pagina OG-kaart (`<OgCard>`); onbekend pad → site-fallback. Query nooit in image getekend (geen injectie). Publiek. |
| `revalidate/route.ts` | POST | On-demand `revalidatePath(?path)`. Gate: `x-revalidate-secret`/`?secret` == `REVALIDATE_SECRET`; anders 404. Tag-based revalidation bewust nog niet gewired. |

---

## 6. Componenten & hooks

### Conventiepatronen (gelden overal)
- **Barrel per tier**: elke submap heeft een `index.ts` die default-exports als named exports her-exporteert; een compositie wordt *ná* zijn onderdelen geëxporteerd. In `'use client'`-bestanden importeer je direct, niet via de barrel.
- **Props uit Zod-schema's**: ~64 van de ~134 componenten leiden hun props af van `@/lib/content/schema/<tier>/<naam>` (`XSchemaProps`), aangevuld met niet-serialiseerbare extra's (`onClick`, `children`, `ref`).
- **Server-first**: default Server Components; `'use client'` zo klein mogelijk (kleine islands).
- **Styling niet co-located**: 0 SCSS naast componenten — alle styling in `src/styles/`, gedreven via classNames, `data-*` en `colorset` (styling-bij-de-consumer).
- **Base UI als basis**: interactieve widgets zijn dunne, gethemede wrappers over Base UI (a11y/keyboard/ARIA).

### Hooks (`src/hooks/*`) — alle 6 client-only

| Hook | Doet | Return |
| --- | --- | --- |
| `useDashboardGuard(permission?, options?)` | Auth/redirect/loading-gate voor dashboard | `{ ready, fallback, session, permissions }` |
| `useHaptics()` | Haptische + geluidsfeedback (singleton engine) | `{ haptic, trigger, cancel, isSupported }` |
| `useHotkey(shortcut, handler)` | Toetsen-chord op één gedeelde globale keydown-listener | `void` |
| `useOverlay(isOpen, onClose?, opts)` | Overlay-lifecycle: scroll-lock (`.page-frame-scroll` + body) + Escape-to-close | `void` |
| `usePagination({ totalPages, … })` | Pure paginarange met ellipsis (Mantine-vorm) | `{ pages, active, setPage, next, previous, … }` |
| `useReducedMotion()` | `prefers-reduced-motion` via `useSyncExternalStore` | `boolean` |

### Componenten — 5 tiers (S = Server, C = Client)

**`basics/` (36)** — atomaire primitives (typografie, layout-grid, knoppen/links, media, iconen, statusindicatoren, skeletons). Overwegend Server. Kern: `Interactive` (C, polymorfe `<button>`/`<a>` waar Button/Pill/Link/Menu doorheen renderen), `Button` (S, de enige CTA-face), `Section` (S, draagt `colorset`), `Columns`/`Column` (S, 12-grid), `Title`/`Content`/`HeadingGroup` (S, type-scale), `Media` (S, beeld/embed per provider), `StatusBadge` (S, domain+status → kleur/label voor beheer), `Icon` (S, lucide-map), `JsonLd` (S, veilige `<script>`-serialisatie). Client-eilanden: `Accordion(Item)`, `Collapsible`, `CountUp`, `RevealObserver`, `ServiceWorker`.

**`components/` (45)** — samengestelde widgets met eigen interactie/state. Veelal Client, veel Base UI/Embla-wrappers. O.a.: `Card`/`ArticleCard`/`EventCard`/`EmptyState` (S), `Modal`/`ConfirmDialog`/`Drawer`/`Popover`/`Menu`/`Combobox` (C, Base UI), `DataTable` (C, sorteerbaar+gepagineerd generic), `Table`/`ScrollArea`/`Gallery`/`ImageList`/`MarqueeTicker`/`Timeline` (S), `FilterBar`/`SearchPalette`/`FileUpload`/`Swiper`/`VideoLightbox` (C), form-controls `CheckboxGroup`/`RadioGroup`/`ToggleGroup`/`Switch`/`Slider`/`NumberField`/`Toggle`/`Tooltip` (C), `Notification(Provider)` (C, toast-stack), `CookieConsent`/`CustomCursor`/`ScrollProgress`/`ScrollytellingTimeline` (C), `Form` (C, react-hook-form wrapper), `PermissionGroups` (C, permissie-vocabulaire per domein met Switch — drijft de AccessManager-UI).

**`contentBlocks/` (~30)** — hele paginasecties; krijgen alle data via props (fetchen nooit zelf), dragen vaak een `colorset`. `Blocks` (S) is de **dispatcher** (block-`type` → renderer). O.a. `Hero`, `PageHeader`, `TitleText`, `TextMedia`, `Prose`, `CTABanner`, `FeatureCards`, `HighlightCards`, `IntroGrid`, `LinkCardGrid`, `BentoGrid`, `ProfileCards`, `Reviews`, `PhotoMosaic`, `LogoCloud`, `StatBand`, `Steps`, `FaqAccordion`, `SpotlightQuote`, `Showreel`, `EventTeaser`, `ErrorState` (alle S), plus Client-eilanden `ItemCardGrid`/`ArticleCardGrid`/`EventCardGrid` (filterbaar/gepagineerd), `StickyShowcase`, en het server/client-paar `SubscribeToNewsletter`(S)/`NewsletterForm`(C).

**`forms/` (12)** — form-field-primitives, gethemede wrappers over Base UI **Field/Form**. `Field` (C) bezit alle a11y-plumbing (id, `htmlFor`, `aria-describedby`, `aria-invalid`); losse controls pikken dat op binnen een `<Field>`. `FieldGroup` (S, layout + container-query-context). Verder `FieldSet`/`FieldLegend`/`FieldLabel`/`FieldDescription`/`FieldError`, en controls `TextInput`/`TextArea`/`Select`/`Checkbox`/`Radio` (alle C). De barrel exporteert ook types (`RadioOption`, `SelectOption`, …).

**`structures/` (5)** — de site-shell, gemount door de `(website)`-layout via **`SiteChrome`** (S, één implementatie voor site én builder-preview). `Navigation` (C, floating pill-nav met sliding tracker, eigen focus-trap, mobiel-overlay, scroll-to-top per navigatie, `useOverlay` scroll-lock), `Footer` (S, brand + kolommen + copyright-jaar server-side), `AnnouncementBar` (S) + `AnnouncementDismiss` (C, per-`id` localStorage-persistentie via `useSyncExternalStore`, cross-tab `storage`-event).

---

## 7. Lib / logica-laag (`src/lib`)

### `auth/` — het RBAC-model
- **`permissions.ts`** (`'use client'`) — het fundament. `APP_PERMISSIONS` (16 permissies, single source, gespiegeld aan DB-enum `app_permission`) → type `Permission`. `APP_ROLES` = `user, author, yakuza, stand-staff, admin` → `AppRole`. `safeNext(raw)` (open-redirect guard). `signInWithDiscord(next)` (Discord OAuth/PKCE, scopes `identify email guilds guilds.members.read`). `signOut()` (ruimt eerst push-abonnement op). Hooks: `useSession()` (live via `onAuthStateChange`), `usePermissions()` (via RPC `my_permissions()`, memoized `ReadonlySet<Permission>`).
- **`permission-groups.ts`** — `PERMISSION_GROUPS` (8 domeingroepen met NL-titels) voor het "Toegang"-detail.
- **`dashboard-sections.ts`** — `DASHBOARD_SECTIONS` (9 secties → één `permission` + `href`/labels); dashboard rendert een sectie alleen bij die permissie.

### `supabase/` — clients
- **`client.ts`** (`'use client'`) — `getBrowserClient()`: gecachte singleton (anon key), `flowType: 'pkce'`, `persistSession`, `detectSessionInUrl`.
- **`admin.ts`** (`import 'server-only'`) — `getAdminClient()`: service-role client die **RLS bypasst**, voor build-time reads + seed. `server-only` maakt import vanuit client-code een build-error → key blijft uit de bundle.

### `content/` — accessors
- **`index.ts`** — publieke surface: re-export schema + `getPageByPath`, `getAllPagePaths`, `getNotFoundPage`, `getSiteStructures`.
- **`pages.ts`** / **`structures.ts`** (`server-only`, async) — dual-source: bij gezette `SUPABASE_SERVICE_ROLE_KEY` → uit Supabase (`pages`/`structures`-tabel via admin-client, per rij `safeParse`), anders gevalideerde statische registry. `getAllPagePaths` gooit bij DB-error (nooit lege site deployen).
- **`validate.ts`** — `parseContent(schema, raw, opts)`: Zod safeParse, bij falen bron-aware leesbare error (verschijnt bovenaan `next build`).

### `content/schema/` — het Zod content-contract (groep)
Eén block-/component-type per bestand. Patroon: `XProps` Zod-object (met `.describe()` +
`.meta({ editor })`-hints) → `type XProps = z.infer<...>` → voor render-blocks
`XBlock = XProps.extend({ type: z.literal('x'), id })`. Elke submap heeft een barrel.
Aantallen: **basics/** 32, **blocks/** 27, **components/** 43, **forms/** 11, **structures/** 7.
- `blocks/index.ts` — de kern: `Block = z.discriminatedUnion('type', [...24 blocks...])`. Nieuw block = bestand + import + toevoegen aan de union.
- `document.ts` — `Page = { meta, blocks: z.array(Block) }` + `PageMeta` + `StructuredDataNode` (open schema.org-node).
- `primitives.ts` — gedeelde value-objects (`Colorset`, `Id`, `Media` met refines, `Action`, `Heading`, …). **Belangrijk neveneffect:** `z.config({ jitless: true })` schakelt Zod v4's JIT (`new Function`) uit zodat de strikte CSP zonder `unsafe-eval` niet breekt.
- `structures/site.ts` — `SiteStructures`: het tweede gevalideerde documenttype (chrome).

### `puck/` — visual builder wiring
- **`config.tsx`** (Client) — Puck-config gegenereerd uit dezelfde Zod-schema's + render-`REGISTRY`; `componentEntries()` loopt over `Block.options`, mapt shape → velden via `fieldFor`, defaults uit `defaultPresetFor(type)`.
- **`fields.tsx`** (Client) — Zod → Puck field-mapping (op schema-types + `.meta({editor})`-hints, nooit op veldnamen). `fieldFor`, `defaultValueFor`, `humanise`, `fileField` (picker over de `media`-bucket).
- **`presets.ts`** — block-presets uit de Storybook-stories (`require.context`); `sanitise()` dropt functies/JSX. Houdt builder-mockdata en workshop in sync.
- **`templates.ts`** — pagina-templates (Landingspagina/Blogartikel/FAQ), gevalideerd met `Page.safeParse`.
- **`transform.ts`** — round-trip content-contract ⇄ Puck-data (`toPuckData`/`fromPuckData` met `safeParse` + NL-issues; `structuresChanged` via `stableStringify`).

### `images/`
- **`index.ts`** — manifest-accessor: `compileSizes`, `getImage(src)`, `withBasePath(url)` (prefixt subpad omdat plain `<img>` niet door Next herschreven wordt), `variantsToSrcSet`.
- **`manifest.json`** — gegenereerd door `optimize-images.mjs` (URL → `{width,height,hash,variants[]}`).

### `expenses/`, `receipts/`, `pdf/` — declaratie-PDF (client-side)
- **`expenses/types.ts`** — domeintypes (`ExpenseStatus`, `ExpenseCategory`, `Expense`) + NL-labelmaps, `quarterOf`, `formatEur`.
- **`expenses/pdf/ExpenseReport.tsx`** — `@react-pdf/renderer`-document (liggend A4, Helvetica).
- **`expenses/pdf/renderExpensePdf.tsx`** — `renderExpensePdf(data): Promise<Blob>`; laadt `@react-pdf/renderer` (~471 kB) uitsluitend dynamisch (buiten hoofdbundle).
- **`receipts/prepareReceipt.ts`** — `prepareReceipt(file)`: PDF→compress, afbeelding→JPEG-compressie, HEIC→lazy `heic-to`→JPEG.
- **`pdf/compressPdf.ts`** — best-effort `pdf-lib`-optimalisatie (>1,5 MB); origineel terug bij fout.

### `moderation/types.ts`
Domeintypes + NL-labelmaps (`WarnColor`, `LinkStatus`, `BanScope`; interfaces `Subject`, `Warning`, `Ban`, `Alias`, `ConductNote`, `Badge`, …), gespiegeld aan de DB-rijen.

### Losse utils
| Bestand | Functie |
| --- | --- |
| `classNames.ts` | `classNames(...)` — joint truthy classes. |
| `env.ts` | Het env-contract (T3 Env + Zod). `env`-export (server/shared/client). Export `isStatic`. |
| `formatDate.ts` | Deterministische nl-NL/UTC-formattering (voorkomt hydration-mismatch). |
| `ogImage.tsx` | Gedeelde OG-card-componenten (`ogSize` 1200×630, `OgCard`); kleuren uit `brand`. |
| `push.ts` | Web-push (client): `pushSupported`, `subscribePush`, `unsubscribePush`; schrijft `push_subscriptions` (RLS op `auth.uid()`), rolt browserstaat terug bij DB-fout. |
| `sanitize.ts` | `sanitizeHtml` (DOMPurify-allowlist voor Puck-richtext) + `sanitizePage` (deep-sanitize vóór DB-write). Isomorf. |
| `seo.ts` | `pageMetadata(path)`, `ogImageMeta`, JSON-LD-builders (`organizationJsonLd`, `pageJsonLd` met per-block builders → één `@graph`). |
| `site.ts` | Centrale site-data: `site`, `brand` (kleur-mirror van SCSS-tokens), `routes`, `resolveChrome`. |
| `uuid.ts` | `genUuid()` met fallback voor niet-secure HTTP-contexten. |

---

## 8. Content-laag (`src/content`) & scripts

### `src/content/` — pure data (de CMS-seam)
- **`pages/index.ts`** — registry `Record<string, Page>` (`/`→home, `/community`, `/evenementen`, `/word-lid`).
- **`pages/home.ts`** (229 r), **`evenementen.ts`** (187 r), **`community.ts`** (103 r), **`word-lid.ts`** (89 r), **`notFound.ts`** (23 r) — concrete `Page`-objecten (meta + blocks), getypeerd tegen het schema.
- **`structures.ts`** (75 r) — de site-chrome als env-vrije `SiteStructures`-data (navigation incl. tijdelijke `Dashboard`-link, footer). Bewust géén import van `site.ts` (content blijft puur).

### `scripts/`
- **`optimize-images.mjs`** — build-time `sharp`-optimizer: webp-varianten (320–1536 + intrinsieke breedte, quality 80) voor `public/media/*` → `_opt/` + schrijft `manifest.json`. Idempotent (SHA-1-cache), prunet wezen.
- **`generate-builder-manifest.mjs`** — indexeert media in `public/` → `public/builder-images.json` voor de builder-picker.
- **`seed-supabase.ts`** — one-off migratie TS-content → Supabase via plain `fetch` (PostgREST, geen supabase-js). Idempotent (`Prefer: resolution=merge-duplicates`), valideert elke rij vóór upsert naar `pages`/`structures`. Vereist service-role env.
- **`check-scss.mjs`** — compileert elke niet-partial `.scss` in `src/styles` (lint-gate, exit 1 bij fouten).

---

## 9. Database (Supabase)

Bron: 48 gefaseerde migraties, 3 Edge Functions, `config.toml`. Alle tabellen in schema
`public`; FK's naar `auth.users(id)` zijn de Supabase-authtabel. Vrijwel elke tabel heeft
`created_at timestamptz default now()` (niet telkens herhaald).

### 9.1 Tabellen per domein

**Access control / RBAC**
- **profiles** — PK `id uuid` → `auth.users` (1-op-1, cascade). `username`, `avatar_url`, `updated_at`; Fase 2: `discord_id text unique`, `global_name`, `guild_nick`, `guild_roles jsonb`, `guild_joined_at`, `synced_at`, `terms_accepted_at`, `terms_version`. **Dé identiteitstabel.**
- **user_roles** — `user_id uuid unique` → auth.users (1-op-1), `role app_role default 'user'`.
- **role_permissions** — `role app_role`, `permission app_permission`, `unique(role,permission)`. Seed-tabel (rol→permissie-bundels).
- **user_permissions** — `user_id`, `permission`, `granted_by`, `unique(user_id,permission)`. Per-user grants bovenop de rol. *Effectieve permissies = rol-bundel ∪ user-grants.*

**CMS**
- **pages** — PK `path text`, `data jsonb`, `updated_at`. Puck-content per route.
- **structures** — PK `id int default 1` met `check(id=1)` (singleton), `data jsonb`.

**Identity / profielhistorie**
- **profile_name_history** — `user_id` → auth.users, `old_name`, `new_name`, `changed_at`.
- **subject_names** — *VIEW* (geen tabel): `INNER JOIN` profiles → toont alleen echte accounts (schaduwprofielen bewust uitgesloten, privacylek voorkomen).

**Moderation**
- **mod_subjects** — PK `id uuid`; `discord_id unique`, `discord_name`, `user_id` → auth.users (`set null`; null = schaduwprofiel), `merged_into uuid` → mod_subjects (self-ref merge). Partial unique op `user_id`.
- **mod_warnings** — `subject_id` → mod_subjects (cascade), `color mod_warn_color`, `reason`, `issued_at/by`, `removed_at/by`.
- **mod_evidence** — `warning_id` → mod_warnings, `kind (image|link|text)`, `storage_path` (privé `mod-evidence`), `url`, `body`.
- **mod_notes** — `subject_id`, `body`, `archived_at/by`.
- **mod_subject_links** — `subject_low`/`subject_high` → mod_subjects (junction, `low<high`, unique), `status mod_link_status`, `reviewed_by/at`.
- **mod_subject_aliases** — `subject_id`, `alias`, `kind`, `source`, `first/last_seen`, `unique(subject_id,alias)`.
- **mod_link_evidence** — `link_id` → mod_subject_links.
- **mod_bans** — `subject_id`, `scope mod_ban_scope`, `reason`, `issued_by/at`, `expires_at`, `lifted_at/by`.
- **conduct_notes** — `subject_id`, `event_id` → events (set null), `kind conduct_kind`, `body`.

**Inventory / conventions**
- **inventory_items** — `name`, `owner_user_id` → auth.users (set null), `owner_label`, `quantity`, `value_eur numeric(10,2)`, `available bool`, `archived_at/by`.
- **events** — `name`, `location`, `starts_on`/`ends_on date`, `kind event_kind default convention`, `parent_event_id` → events (self-ref), `signups_open/close_at`, `budget_eur numeric(10,2) check(>=0)`, `archived_at/by`. Dubbelrol: conventie/evenement + inventory-context.
- **event_item_assignments** — `event_id` + `item_id` (junction event↔item), `assigned_user_id`, `quantity`, `expected_to_bring`, `packed_at`.
- **event_tickets** — `event_id`, `day date`, `assigned_user_id`, `ticket_pdf_path` (privé `tickets`-bucket).
- **event_ticket_subjects** — `ticket_id` + `subject_id` (junction, unique).
- **inventory_history** — `item_id`, `event_id` (set null), `kind inventory_history_kind`.
- **item_unavailability** — `item_id`, `starts_on`/`ends_on`, `status unavailability_status`, `requested_by`, `decided_by/at`.
- **event_activities** — `event_id`, `venue activity_venue`, `title`, `starts/ends_at`.
- **activity_requirements** — `activity_id`, `item_id` (set null), `label`, `quantity`.
- **activity_hosts** — `activity_id` + `subject_id` (junction, unique).
- **event_attendance** — `event_id` + `subject_id` (junction, unique), `status attendance_status`.
- **event_shifts** — `event_id`, `subject_id` (set null), `starts/ends_at`, `station`, `locked_at`.
- **shift_swap_requests** — `shift_id`, `from_subject`/`to_subject`, `status (pending|accepted|rejected|cancelled)`.

**Expenses / declaraties**
- **expenses** — `user_id` → auth.users (declarant), `event_id`/`activity_id` (set null), `amount_eur numeric(10,2) check(>0)`, `incurred_on`, `status expense_status`, `receipt_path text NOT NULL` (verplicht bonnetje, DB-afgedwongen), `reviewed_by/at`, `review_note`, `category expense_category`, `iban`, `account_holder`, `archived_at/by`.
- **expense_receipts** — `expense_id`, `path` (extra bonnen).
- **payout_details** — PK `user_id uuid` → auth.users (1-op-1), `iban`, `account_holder`. **Geen** audit-trigger (PII).

**Badges** · **badges** — `subject_id` → mod_subjects, `title`, `awarded_on`, `image_path` (publieke `badges`-bucket), `awarded_by`, `archived_at/by`.

**Notifications / push**
- **notifications** — `user_id`, `kind`, `title`, `body`, `payload jsonb`, `read_at`. In `supabase_realtime`-publicatie.
- **push_subscriptions** — `user_id`, `endpoint text unique`, `p256dh`, `auth`. Web-push-tokens.

**Audit / logging**
- **audit_log** — `table_name`, `record_id`, `op (INSERT|UPDATE|DELETE)`, `old_data`/`new_data jsonb`, `actor_id`. BRIN op `created_at`.
- **activity_log** — `kind`, `actor_id`, `subject_id`/`event_id`/`item_id`/`expense_id` (alle set null), `summary`. Leesbaar domein-log.

**Belangrijke ENUM-types:** `app_role` (user, author, yakuza, stand-staff, admin), `app_permission` (16 waarden), `mod_warn_color`, `mod_link_status`, `mod_ban_scope`, `event_kind`, `attendance_status`, `conduct_kind`, `activity_venue`, `unavailability_status`, `inventory_history_kind`, `expense_status`, `expense_category`.

### 9.2 Relatie-overzicht (tekstueel)

```
profiles.id                       → auth.users.id            1-op-1 (cascade)
user_roles.user_id                → auth.users.id            1-op-1 (unique)
user_permissions.user_id          → auth.users.id            1-op-veel
role_permissions (role,permission)→ enums                    seed (veel-op-veel rol↔permissie)
profile_name_history.user_id      → auth.users.id            1-op-veel

mod_subjects.user_id              → auth.users.id            1-op-1 (partial unique; null=schaduw)
mod_subjects.merged_into          → mod_subjects.id          self-ref (merge-keten)
mod_warnings.subject_id           → mod_subjects.id          1-op-veel (cascade)
mod_evidence.warning_id           → mod_warnings.id          1-op-veel (cascade)
mod_notes.subject_id              → mod_subjects.id          1-op-veel (cascade)
mod_subject_aliases.subject_id    → mod_subjects.id          1-op-veel (cascade)
mod_subject_links.low/high        → mod_subjects.id          JUNCTION subject↔subject
mod_link_evidence.link_id         → mod_subject_links.id     1-op-veel (cascade)
mod_bans.subject_id               → mod_subjects.id          1-op-veel (cascade)
conduct_notes.subject_id/event_id → mod_subjects / events    1-op-veel / set null

events.parent_event_id            → events.id                self-ref (set null)
inventory_items.owner_user_id     → auth.users.id            set null
event_item_assignments.event/item → events / inventory_items JUNCTION event↔item
event_tickets.event_id            → events.id                1-op-veel (cascade)
event_ticket_subjects.ticket/subj → event_tickets / mod_subjects  JUNCTION
inventory_history.item/event      → inventory_items / events 1-op-veel / set null
item_unavailability.item_id       → inventory_items.id       1-op-veel (cascade)
event_activities.event_id         → events.id                1-op-veel (cascade)
activity_requirements.activity/item→ event_activities / inventory_items
activity_hosts.activity/subject   → event_activities / mod_subjects  JUNCTION
event_attendance.event/subject    → events / mod_subjects    JUNCTION (unique)
event_shifts.event/subject        → events / mod_subjects    1-op-veel / set null
shift_swap_requests.shift/from/to → event_shifts / mod_subjects

expenses.user_id                  → auth.users.id            1-op-veel (cascade)
expenses.event_id/activity_id     → events / event_activities set null
expense_receipts.expense_id       → expenses.id              1-op-veel (cascade)
payout_details.user_id            → auth.users.id            1-op-1 (PK=FK)

badges.subject_id                 → mod_subjects.id          1-op-veel (cascade)
notifications.user_id             → auth.users.id            1-op-veel (cascade)
push_subscriptions.user_id        → auth.users.id            1-op-veel (cascade)
activity_log.subject/event/item/expense → resp. tabellen     set null
```

**Spil-tabellen:** **mod_subjects** (canoniek profiel — moderatie, attendance, shifts,
activiteiten, badges, tickets hangen eraan) en **events** (inventory + declaraties +
activiteiten).

### 9.3 RLS & security
- **RLS staat op élke `public`-tabel aan.** Views (`subject_names`) hebben geen RLS maar zijn kolom-beperkt.
- **Kernpatroon:** policies roepen `(select public.authorize('<permission>'))` aan (subselect → één evaluatie per query). `authorize()` is `SECURITY DEFINER, search_path=''` en checkt rol-bundel ∪ user-grants voor `auth.uid()`.
- **CRUD-split:** read = `*.view`, write = `*.manage`; `DELETE` op moderatie/badges verlegd naar `records.delete` (admin-only) via de `hard_delete`-RPC.
- **Rang-regel (moderatie):** warnings/bans/conduct vereisen rang ≥ yakuza én strikt hoger dan het doelwit, via `subject_cluster_rank()` (hoogste rang over de héle merge-cluster) — dichtte een merge-escalatie.
- **Kolom-grants als hardening:** `authenticated` mag op `profiles` alléén `terms_*` en op `notifications` alléén `read_at` updaten; de rest schrijven triggers (definer)/service-role. `anon` (publishable key) krijgt géén grants.
- **service_role grants:** geen auto-grants; elke migratie doet expliciet `grant … to service_role`. service_role bypasst RLS (seed, build-time reads, Edge Functions).
- **Storage-buckets:** `media` (publiek, media.manage-write), `mod-evidence` (privé), `tickets` (privé, `<user_id>/`-scoping), `receipts` (privé, `<user_id>/` + expenses.manage), `badges` (publiek). Met `file_size_limit`/`allowed_mime_types` + "self delete orphan"-policies.

### 9.4 Functies, triggers & RPC's
**Authz/helpers** (`SECURITY DEFINER, search_path=''`): `authorize(permission)`, `my_permissions()`, `role_rank_of(uid)`, `subject_cluster_rank(subject)`, `my_subject_id()`, `canonical_subject_id(id)` (volgt `merged_into`, cyclus-guard), `item_available_on(item,date)`.

**Triggers:** `handle_new_user()` (op `auth.users` — provisioneert profile + `user`-rol + canoniek `mod_subjects`), `handle_user_metadata_update()` (sync profiel bij login, logt naamswijziging + alias), `set_updated_at()`, `log_audit()` (+ PII-veilige `log_audit_expenses()`), `log_role/domain/expense/warning/ban_activity()`, `guard_item_available()` (blokkeert oneigenlijke availability-flip).

**RPC's (client-aanroepbaar):** `hard_delete(table,id)` (records.delete-gated, geeft storage-paden terug om op te ruimen), `complete_event`, `set_packed`, `request_item_unavailability`, `decide_item_unavailability`, `cancel_own_item_unavailability`, `apply_shift_swap`, `cancel_swap`, `merge_subjects`, `unmerge_subject`, `my_warnings`, `my_conduct_notes`, `my_badges`, `review_expense`, `list_notifiable_members`, `my_permissions`, `my_subject_id`, `my_assignment_item_names`.

### 9.5 Queries in code
Twee client-typen: **browser-client** (anon key, RLS) via `lib/supabase/client.ts` (bijna
alle dashboard-UI) en **admin-client** (service-role, `server-only`) via `lib/supabase/admin.ts`
(alleen build-time content-reads + seed). **Geen server actions** — alle runtime-mutaties
client-side onder RLS + RPC's. Zie de sectie-tabel in [§4](#4-routes--paginas-srcapp) voor
welke tabellen per dashboard-sectie worden geraakt.

---

## 10. Edge Functions

Alle drie via `withSupabase({ auth: 'user' })` uit `npm:@supabase/server` (verify_jwt aan).

- **deploy** — "Publiceren naar live". Verifieert de JWT, checkt `site.publish` via `my_permissions` (eigen RLS-context), vuurt dan een GitHub `repository_dispatch` (`event_type: 'publish'`) af die de deploy-workflow start. Secrets: `GITHUB_REPO`, `GITHUB_DISPATCH_TOKEN`. Aangeroepen vanuit de builder.
- **discord-sync** — Discord-guild-verrijking bij login. Client stuurt alléén het kortlevende `provider_token`; de functie haalt zelf `/users/@me` + guild-member op en schrijft `global_name`/`guild_nick`/`guild_roles`/… naar `profiles` via een **service-role**-client (die kolommen zijn niet client-schrijfbaar). Best-effort. Secrets: `DISCORD_GUILD_ID`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- **send-push** — Meldingen versturen. Checkt `notifications.send`. `audience:'all'` → service-role leest alle `profiles.id`; anders expliciete `user_ids`. Schrijft één rij per ontvanger in `notifications` (realtime) én verstuurt web-push (`npm:web-push`), ruimt verlopen abonnementen (404/410) op. Secrets: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`. Aangeroepen vanuit de NotificationsComposer.

---

## 11. Deploy, security & PWA

- **`next.config.mjs`** — `trailingSlash: true` (statische host resolvet `<route>/index.html`, voorkomt collisie met de RSC-payload-map). Bij `HOST_TYPE=static`: `output: 'export'`, `basePath`, `images.unoptimized`. Server-mode: statische **security headers** (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).
- **CSP** — statisch (geen per-request nonce → site blijft prerenderd). `'unsafe-inline'` (Next's no-nonce baseline). `connect-src`/`img-src` bevatten de Supabase-origin (afgeleid uit de env). **Niet** toegepast in dev (Puck-iframe). **Geen** `upgrade-insecure-requests` (WebKit past die op `http://localhost` toe → gebroken site in Safari). De `/builder`-route krijgt in productie een relaxede CSP (Inter-font van rsms.me).
- **PWA** — opt-in via `ENABLE_PWA=true` (vereist `next build --webpack`; Serwist heeft webpack nodig). `ServiceWorker`-component unregistert stale workers als de PWA-build uit staat.
- **Env-contract** (`src/lib/env.ts`) — via T3 Env; `process.env` wordt één keer gevalideerd bij eerste import. Zie `.env.example` voor de volledige lijst en `.gitignore`-status.

**Belangrijkste environment-variabelen** (`.env.example`):

| Variabele | Rol |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project-URL (ook in CSP) — **required** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon/publishable key (RLS is de grens) — **required** |
| `SUPABASE_SERVICE_ROLE_KEY` | service-role (bypasst RLS) — **secret**, build/CI/seed only |
| `NEXT_PUBLIC_SITE_URL` | publiek origin voor metadata/canonical/OG/sitemap/JSON-LD |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | web-push publieke sleutel (leeg = push uit) |
| `DEBUG_SECRET` | gate voor content-inspector/draft in productie (optioneel) |
| `REVALIDATE_SECRET` | gate voor `POST /api/revalidate` (leeg = 404) |
| `HOST_TYPE` | `server` (default) of `static` |
| `NEXT_PUBLIC_BASE_PATH` | subpad voor subpad-hosting (bijv. GitHub Pages) |
| `NEXT_PUBLIC_ENABLE_BUILDER` | zet `/builder` aan in een prod/static build |
| `ENABLE_PWA` | Serwist service worker (webpack-build) |

Daarnaast (níét in `.env.local`, maar als GitHub Actions- / Supabase-secrets, volgens de
checklist in `.env.example`): `SFTP_*` (DirectAdmin-deploy), `GITHUB_DISPATCH_TOKEN`/`GITHUB_REPO`
(publish-webhook), en de Edge-Function-secrets `VAPID_PRIVATE_KEY`/`VAPID_SUBJECT`,
`DISCORD_GUILD_ID`.

---

## 12. Losse eindjes & aandachtspunten

Punten die tijdens de analyse onduidelijk, afwezig, of het vermelden waard waren:

1. **Server-only/client-grens niet overal expliciet.** Alleen `content/pages.ts`, `content/structures.ts`, `supabase/admin.ts` dragen `import 'server-only'`; alleen `auth/permissions.ts` en `supabase/client.ts` dragen `'use client'`. De PDF/receipts-modules gebruiken browser-API's maar dragen géén `'use client'` — hun grens volgt impliciet uit de import-graaf.
2. **Lichte duplicatie:** `toInput`/`fromInput` bestaan zowel in `events/_components/datetime.ts` als inline in `EventEditor.tsx`.
3. **Niet elke DB-RPC wordt aangeroepen** als directe `.rpc()`-string: o.a. `complete_event`, `my_conduct_notes`, `item_available_on`, `canonical_subject_id`, `subject_cluster_rank` werden niet als aanroep teruggevonden — mogelijk indirect/dynamisch of nog niet in de UI bedraad. **Aandachtspunt.**
4. **`profiles`-leespolicy dekt niet `notifications.send` en (netto na fase 5) niet meer `inventory.manage`** — daarom bestaan `list_notifiable_members()` en de `subject_names`-view / `my_assignment_item_names()` om die gaten kolom-veilig te dichten.
5. **`pages`/`structures` hebben géén public-read-policy** — de statische site leest ze via de service-role bij build-time, niet op runtime. Voor een echte runtime-CMS-fetch zou hier een policy of API-seam bij moeten.
6. **`revalidate`-route: tag-based revalidation bewust nog niet gewired** (alleen `revalidatePath`).
7. **Detaildekking:** de grote manager-componenten (Inventory/Event/Moderation/Expenses-tabs, drawers) en `ExpenseReport.tsx` zijn qua exports, guard-permissie en dataflow vastgesteld; de volledige JSX/mutatie-details onderaan zijn niet regel-voor-regel geverifieerd. De concrete pagina-databestanden zijn qua rol/omvang vastgesteld, niet blok-voor-blok uitgelezen.
8. **Tier-grens `components/` vs `contentBlocks/`** (bijv. Timeline/ScrollProgress vs Steps/StatBand) is een bewuste primitive-vs-block-split maar nergens expliciet gedocumenteerd waar iets thuishoort.

---

*Einde rapport. Zie [`README.md`](../README.md) voor de setup- en run-instructies, en
`npm run storybook` → **For developers** voor de uitgebreide architectuurgids.*
