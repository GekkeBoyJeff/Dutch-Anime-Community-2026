# Dutch Anime Community — website

The website of the **Dutch Anime Community (DAC)**: the largest Dutch-language anime community of the
Netherlands and Belgium (4,500+ members on [Discord](https://discord.gg/dutchanimecommunity)). The public
site is a modern brand site — not a forum — with one conversion goal: inspire visitors to join the Discord.

Behind a Discord login it is also a full **staff platform**: a Supabase-backed `/dashboard` with role-based
access control (RBAC), moderation, inventory & convention management, expense declarations (with PDF), badges
and push notifications.

Built on the **NEXT_TS_SETUP** starter: Next.js 16 (App Router), React 19, typed schema-validated content
blocks, and a token-driven theme (`data-theme="dac"` — gold `#f5c24a`, cream and plum ink). The staff platform
was added on top of that starter

> Code and comments are in English; the site content is in Dutch.

📄 **Full technical documentation:** [`docs/codebase-report.md`](docs/codebase-report.md) (also as a
standalone [`docs/codebase-report.html`](docs/codebase-report.html)) — an exhaustive per-file inventory,
the component tiers, the lib layer, and the complete database schema.

## The two halves

| | Public site | Staff platform |
| --- | --- | --- |
| **Routes** | `(website)` group — home + `[...slug]` catch-all | `(admin)` group — `/dashboard/*`, `/upload`; plus `/account`, `/login`, `/builder` |
| **Data** | Typed, Zod-validated content blocks (`src/content/pages/*`) | Supabase (Postgres) via the browser client, guarded by RLS |
| **Auth** | none (public) | Discord OAuth → Supabase Auth |
| **Rendering** | statically prerendered | client-side SPA that talks to Supabase at runtime |

There are **no Next.js server actions** — every runtime mutation goes through the Supabase browser client,
and **Row Level Security + `SECURITY DEFINER` RPCs are the real security boundary**. The UI permission checks
(`usePermissions`, `useDashboardGuard`) are UX only.

## Requirements

- **Node.js 22+** (see `.nvmrc` / `engines`; required by the Supabase build — supabase-js needs a global WebSocket)
- npm (a `package-lock.json` is committed)
- A **Supabase project** (Postgres + Auth + Storage) with Discord OAuth configured. The schema lives in
  `supabase/migrations/` (48 phased SQL migrations); the three Edge Functions live in `supabase/functions/`.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the Supabase values (see Environment below)
npm run dev                  # http://localhost:3000
```

Without a `.env.local` the app still boots against placeholder values, but anything that touches Supabase
(login, `/dashboard`, `/account`) needs a real project. The public pages render from the static
`src/content/` registry when no `SUPABASE_SERVICE_ROLE_KEY` is set.

## Guided code tour (onboarding)

New to the codebase? There's a guided, in-editor walkthrough that opens the right files in order and explains
how the site fits together — from the two publish targets, through the content pipeline, to the Supabase/RBAC
dashboard half and where security is actually enforced.

1. Install the **CodeTour** extension (`vsls-contrib.codetour`) in VS Code.
2. Open the **CodeTour** view in the Explorer sidebar and start **"Onboarding — DAC website architectuur"**
   (13 steps, ~10 minutes). Or open [`.tours/new-joiner-architecture.tour`](.tours/new-joiner-architecture.tour)
   and press ▶.

The tour is written in plain Dutch for any reader (no jargon assumed). It complements
[`docs/codebase-report.md`](docs/codebase-report.md): the tour is the *narrative* ramp-up, the report is the
*reference*.

> **Editing the tour:** steps are anchored with text `pattern`s (not line numbers) so they survive edits.
> CodeTour treats each `pattern` as a **regular expression** — keep them to plain substrings and avoid the
> characters `[ ] ( ) { } ? * + . |`, or a step silently fails to open. A content-only step (no `file`/
> `directory`) can also render unreliably — anchor every step to a real file or folder.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack); `/builder` is on |
| `npm run build` | Production PWA build: `npm run images` → `ENABLE_PWA=true next build --webpack` (also validates all content — see below) |
| `npm run build:plain` | Plain Turbopack build (no service worker) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (flat config, `eslint-config-next`) |
| `npm run typecheck` | `tsc --noEmit` (strict + `noUncheckedIndexedAccess`) |
| `npm run images` | Optimize images (`sharp`) + regenerate the builder media manifest |
| `npm run seed` | One-off migrate the TS content into Supabase (`pages`/`structures`); needs the service-role key |
| `npm run storybook` | Component workshop + the full developer docs |
| `npm run build-storybook` | Static Storybook build |

## Project structure

```
src/
├── app/            App Router — routes, layouts, API, dashboard
│   ├── (website)/  public site: home + [...slug] catch-all
│   ├── (admin)/    dashboard/* + upload  (behind Discord login + RBAC)
│   ├── account/    member page (notifications, badges, push)
│   ├── auth/ login/  Discord OAuth flow
│   ├── builder/    Puck visual editor (dev / opt-in)
│   └── api/        5 route handlers (og, revalidate, draft, get-page-by-path, builder/images)
├── components/     5 tiers: basics · components · contentBlocks · forms · structures
├── hooks/          6 client hooks (dashboard guard, overlay, haptics, hotkey, pagination, reduced-motion)
├── lib/            auth (RBAC) · supabase · content(+schema) · puck · images · pdf · expenses · moderation
├── content/        concrete page data (home, community, evenementen, word-lid) + site chrome
└── styles/         SCSS, mirrors the component folders (token-driven theming)

supabase/
├── migrations/     48 phased SQL files (access · cms · moderation · inventory · fase1..8)
└── functions/      deploy · discord-sync · send-push  (Edge Functions)
```

## How the content layer fits together

```
src/content/pages/*  plain typed data (one Page per path)      ← the CMS seam
   │
src/lib/content/*    async accessors that VALIDATE the data with Zod at load (fail the build on bad data;
   │                 read from Supabase when SUPABASE_SERVICE_ROLE_KEY is set, else the static registry)
src/components/contentBlocks/Blocks.tsx   maps each block's `type` → its component
   │
src/app/(website)/page.tsx + [...slug]   home and a catch-all; both delegate to PageView, which
                                         awaits the accessors and renders <Blocks/>
```

- **Content is data.** A page is `{ meta, blocks }` at a path. Each block has a `type` that selects its
  component; the rest of the block is that component's props. Add or reorder sections by editing data.
- **One contract.** `src/lib/content/schema/` defines the Zod schemas (`primitives`, `blocks/<type>`,
  `document`); every TypeScript type is inferred from them, and the render registry + JSON-LD builders +
  the Puck editor all derive from the same union — so nothing drifts and a mis-wire is a compile error.
- **Validated at the boundary.** The `lib/content` accessors `safeParse` every page, so invalid content
  fails `next build` (or an invalid DB row never reaches the site) with a path-pointed error.
- **Theming via tokens.** Colour, type and spacing live in `src/styles/_initial.scss` and cascade through
  `data-theme` / `data-colorset`. Runtime surfaces that can't read CSS (OG images, the manifest, the
  viewport theme colour) read the matching `brand` palette in `src/lib/site.ts`.

The full architecture guide lives in Storybook (`npm run storybook` → **For developers**): Architecture,
Conventions, Content & data, Validation, SEO & sharing, and a step-by-step **Adding things**.

## Dashboard, RBAC & database

The `/dashboard` is a permission-gated staff area. Access is modelled in Postgres:

- **Roles** (`app_role`: `user`, `author`, `yakuza`, `stand-staff`, `admin`) grant bundles of **permissions**
  (`app_permission`: 16 values such as `pages.edit`, `moderation.manage`, `inventory.manage`, `expenses.view`,
  `roles.manage`, `records.delete`, `notifications.send`). A user's effective permissions are the role bundle
  **plus** per-user grants (`user_permissions`).
- Every dashboard section maps to one permission (`src/lib/auth/dashboard-sections.ts`); the same permission is
  re-checked server-side by an RLS policy (`authorize('<permission>')`). The client checks only decide what to
  render — the database decides what is allowed.
- **Sections:** access (roles & grants), events/conventions, inventory, my-inventory, expenses (with PDF
  export & IBAN payout details), moderation (warnings, bans, notes, alias links, badges, evidence), logs
  (audit + activity), notifications (web-push composer).

The schema spans ~40 tables across access-control, CMS, moderation, inventory/conventions, expenses, badges,
notifications and audit logging, with **RLS enabled on every table** and `SECURITY DEFINER` helper/RPC
functions for the privileged operations. Three Edge Functions handle publishing (`deploy` → GitHub dispatch),
Discord guild enrichment on login (`discord-sync`), and sending notifications (`send-push`).

👉 See [`docs/codebase-report.md` §9](docs/codebase-report.md#9-database-supabase) for the full table list,
relationships, RLS patterns, triggers and RPCs.

## Environment

Copy `.env.example` to `.env.local` and fill in the values (each variable is documented in that file and
validated at startup by `src/lib/env.ts`). The most important ones:

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL (also woven into the CSP) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | anon/publishable key — RLS is the boundary, so this may be public |
| `SUPABASE_SERVICE_ROLE_KEY` | build/CI | **secret**, bypasses RLS. Build-time content reads + `npm run seed` only; never client-side |
| `NEXT_PUBLIC_SITE_URL` | | Public origin for metadata, canonical/OG URLs, sitemap, robots and JSON-LD |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | | Web-push public key; empty = the "enable notifications" button is hidden |
| `DEBUG_SECRET` | | Unlocks the gated content-inspector / draft-mode routes in production |
| `REVALIDATE_SECRET` | | Gates the on-demand revalidation webhook (`POST /api/revalidate`); empty = the endpoint 404s |
| `HOST_TYPE` | | `server` (default) or `static` — see Deployment below |
| `NEXT_PUBLIC_BASE_PATH` | | Subpath the site is served under (e.g. GitHub Pages); empty = domain root |
| `NEXT_PUBLIC_ENABLE_BUILDER` | | Turns on `/builder` in a production/static build (it is always on in dev) |
| `ENABLE_PWA` | | Build-time opt-in for the Serwist service worker (needs the webpack build) |

`.env.example` also lists (as a **checklist only**, not app variables) the GitHub Actions secrets used by the
deploy workflow (`SFTP_*`, `SITE_URL`) and the Supabase Edge Function secrets
(`GITHUB_DISPATCH_TOKEN`/`GITHUB_REPO`, `VAPID_PRIVATE_KEY`/`VAPID_SUBJECT`, `DISCORD_GUILD_ID`).

## Deployment (two targets from one codebase)

`next.config.mjs` switches build output on `HOST_TYPE`:

- **`server`** (default) — a Node host that serves the dynamic features (API routes, security headers/CSP).
- **`static`** — `output: 'export'`, a fully static export for a static host (DirectAdmin / GitHub Pages).
  Public page data is read from Supabase via the service-role at **build time** and baked in; the dashboard
  remains a client-side SPA that talks to Supabase at runtime. `trailingSlash: true` keeps every route
  directory-based so a static host resolves `<route>/index.html` without rewrite rules.

## Visual builder (development only)

`npm run dev` → http://localhost:3000/builder opens a visual editor ([Puck](https://puckeditor.com))
generated from the same Zod schemas and render registry the site uses — the editor cannot drift from
the contract because it declares nothing of its own. Compose a page, press **Publish**, and it is validated
against the `Page`/`SiteStructures` schema, sanitised, and upserted into Supabase (`pages`/`structures`).
The site chrome (announcement bar, navigation, footer) is editable too. Inserted blocks start with their
**Storybook story data**, and the page selector offers validated **templates**. In production the route is a
404 unless `NEXT_PUBLIC_ENABLE_BUILDER=true`.

## PWA (optional, off by default)

The standard build is plain Turbopack with no service worker. To generate and register the Serwist
service worker (offline browsing), build with the opt-in flag:

```bash
ENABLE_PWA=true npm run build -- --webpack
```

`--webpack` is required because the Serwist plugin needs webpack (Next.js 16 defaults to Turbopack). The
`ServiceWorker` component also unregisters stale workers when the PWA build is off, so old caches can't serve
a broken site.

## Pulling in starter updates

This repo was cloned from the starter and keeps it wired up as the `starter` remote
(https://github.com/GekkeBoyJeff/NEXT_TS_SETUP). To merge the latest starter improvements:

```bash
git fetch starter
git merge starter/main    # resolve conflicts (usually only in src/content/ and the theme)
```

DAC-specific changes are deliberately concentrated in `src/content/`, the `[data-theme='dac']` block in
`src/styles/base.scss`, `src/lib/site.ts`, and `public/media/` — so merges stay small. (The Supabase staff
platform under `src/app/(admin)`, `src/lib/auth`, `src/lib/supabase` and `supabase/` is DAC-only and not part
of the starter.)
