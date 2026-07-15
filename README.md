# Dutch Anime Community — website

The website of the **Dutch Anime Community (DAC)**: the largest Dutch-language anime community of the
Netherlands and Belgium (4,500+ members on [Discord](https://discord.gg/dutchanimecommunity)). The site
is a modern brand site — not a forum — with one conversion goal: inspire visitors to join the Discord.

Built on the **NEXT_TS_SETUP** starter: Next.js 16 (App Router), React 19, typed schema-validated
content blocks, and a token-driven theme (`data-theme="dac"` — gold `#f5c24a`, cream and plum ink).

> Code and comments are in English; the site content is in Dutch.

## Pulling in starter updates

This repo was cloned from the starter and keeps it wired up as the `starter` remote
(https://github.com/GekkeBoyJeff/NEXT_TS_SETUP). To merge the latest starter improvements:

```bash
git fetch starter
git merge starter/main    # resolve conflicts (usually only in src/content/ and the theme)
```

DAC-specific changes are deliberately concentrated in `src/content/`, the `[data-theme='dac']` block in
`src/styles/base.scss`, `src/lib/site.ts`, and `public/media/` — so merges stay small.

## Requirements

- **Node.js 20.9+** (Next.js 16 baseline)
- npm (a `package-lock.json` is committed)

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build (also validates all content — see below) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (flat config, `eslint-config-next`) |
| `npm run typecheck` | `tsc --noEmit` (strict + `noUncheckedIndexedAccess`) |
| `npm run storybook` | Component workshop + the full developer docs |
| `npm run build-storybook` | Static Storybook build |

## How it fits together

```
src/content/pages/*  plain typed data (one Page per path)      ← the future CMS seam
   │
src/lib/content/*    async accessors that VALIDATE the data with Zod at load (fail the build on bad data)
   │
src/components/contentBlocks/Blocks.tsx   maps each block's `type` → its component
   │
src/app/page.tsx + [...slug]   home and a catch-all; both delegate to PageView, which
                               awaits the accessors and renders <Blocks/>
```

- **Content is data.** A page is `{ meta, blocks }` at a path. Each block has a `type` that selects its
  component; the rest of the block is that component's props. Add or reorder sections by editing data.
  (A blog is just pages; a blog overview is a future page with a list block.)
- **One contract.** `src/lib/content/schema/` defines the Zod schemas (`primitives`, `blocks/<type>`,
  `document`); every TypeScript type is inferred from them, and the render registry + JSON-LD builders
  derive from the same union — so nothing drifts and a mis-wire is a compile error.
- **Validated at the boundary.** The `lib/content` accessors `safeParse` the whole registry, so invalid
  content fails `next build` with a path-pointed error. The accessors are **async** today (with trivial
  bodies), so swapping the data source for a CMS fetch is a change inside `lib/content` only.
- **Theming via tokens.** Colour, type and spacing live in `src/styles/_initial.scss` and cascade through
  `data-theme` / `data-colorset`. Runtime surfaces that can't read CSS (OG images, the manifest, the
  viewport theme colour) read the matching `brand` palette in `src/lib/site.ts`.

The full guide lives in Storybook (`npm run storybook` → **For developers**): Architecture, Conventions,
Content & data, Validation, SEO & sharing, and a step-by-step **Adding things**.

## Visual builder (development only)

`npm run dev` → http://localhost:3000/builder opens a visual editor ([Puck](https://puckeditor.com))
generated from the same Zod schemas and render registry the site uses — the editor cannot drift from
the contract because it declares nothing of its own. Compose a page, press **Publish**, and copy the
exported `src/content/pages/<slug>.ts` file; the export is validated against the `Page` schema first,
so pasted output can never break the build. The site chrome (announcement bar, navigation, footer) is
editable too — it lives in `src/content/structures.ts` and the export modal offers that file whenever
the chrome changed. Inserted blocks start with their **Storybook story data** (expand a block in the
drawer to drag in a specific story variant), and the page selector offers **templates** — validated
starter pages composed from those presets. In production the route is a 404.

## Environment

Copy `.env.example` to `.env.local` and fill in the values (documented in that file):

- `NEXT_PUBLIC_SITE_URL` — public origin used for metadata, canonical/OG URLs, the sitemap and JSON-LD.
- `DEBUG_SECRET` — optional; unlocks the gated content-inspector route in production.
- `REVALIDATE_SECRET` — optional; gates the on-demand revalidation webhook (`POST /api/revalidate`). Empty = the endpoint 404s.

## PWA (optional, off by default)

The standard build is plain Turbopack with no service worker. To generate and register the Serwist
service worker (offline browsing), build with the opt-in flag:

```bash
ENABLE_PWA=true npm run build -- --webpack
```

`--webpack` is required because the Serwist plugin needs webpack (Next.js 16 defaults to Turbopack).
