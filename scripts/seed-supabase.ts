import { pages } from '@/content/pages';
import { notFoundPage } from '@/content/pages/notFound';
import { structures } from '@/content/structures';
import { Page, SiteStructures } from '@/lib/content/schema';

// One-off migration of the current TS content into Supabase. Run with the service-role env loaded:
//   set -a && . ./.env.local && set +a && npm run seed
// Uses plain fetch against PostgREST (no supabase-js) so it works on any Node without a WebSocket
// polyfill. Idempotent: `Prefer: resolution=merge-duplicates` upserts on the primary key. Each row is
// validated first, so a malformed source can never land in the DB.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
	throw new Error('seed requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment');
}

const upsert = async (table: string, row: Record<string, unknown>) => {
	const res = await fetch(`${url}/rest/v1/${table}`, {
		method: 'POST',
		headers: {
			apikey: key,
			Authorization: `Bearer ${key}`,
			'Content-Type': 'application/json',
			Prefer: 'resolution=merge-duplicates',
		},
		body: JSON.stringify(row),
	});
	if (!res.ok) throw new Error(`${table} upsert failed: HTTP ${res.status} — ${await res.text()}`);
};

const seedPage = async (path: string, page: unknown) => {
	const parsed = Page.safeParse(page);
	if (!parsed.success) throw new Error(`Invalid page ${path}: ${parsed.error.message}`);
	await upsert('pages', { path, data: parsed.data });
	console.log('seeded page', path);
};

const main = async () => {
	for (const [path, page] of Object.entries(pages)) await seedPage(path, page);
	await seedPage('/404', notFoundPage);

	const s = SiteStructures.safeParse(structures);
	if (!s.success) throw new Error(`Invalid structures: ${s.error.message}`);
	await upsert('structures', { id: 1, data: s.data });
	console.log('seeded structures');
};

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
