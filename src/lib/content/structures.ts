import 'server-only';

import { structures as rawStructures } from '@/content/structures';
import { SiteStructures } from '@/lib/content/schema';
import { parseContent } from '@/lib/content/validate';
import { env } from '@/lib/env';
import { dbEnabled } from '@/lib/content/pages';
import { getAdminClient } from '@/lib/supabase/admin';

// Validated static structures — the local-dev fallback (see pages.ts for the same pattern). Bad chrome
// data fails the build like bad page data.
const staticStructures = parseContent(SiteStructures, rawStructures, {
	label: 'site structures',
	locate: (path) => ({ source: 'site structures', field: path.join('.') }),
});

// Which column carries the content for the current build: the live build reads `published_data`
// (CONTENT_CHANNEL=published), staging and local builds read the draft `data` column.
const contentColumn = () => (env.CONTENT_CHANNEL === 'published' ? 'published_data' : 'data');

// Async so the public API survives a future CMS swap unchanged (same contract as getPageByPath).
// Supabase-backed when SUPABASE_SERVICE_ROLE_KEY is set; the static structures otherwise.
export const getSiteStructures = async (): Promise<SiteStructures> => {
	if (!dbEnabled()) return staticStructures;
	const column = contentColumn();
	const { data } = await getAdminClient().from('structures').select(column).eq('id', 1).maybeSingle();
	// The row type is a union keyed by the selected column; `column` isn't a literal to either side of it.
	const content = data ? (data as Record<'data' | 'published_data', unknown>)[column] : null;
	// No content falls back to the registry; content that IS there is held to the schema, so drifted
	// chrome fails the build instead of silently serving the hardcoded version.
	if (content === null || content === undefined) return staticStructures;
	return parseContent(SiteStructures, content, {
		label: 'site structures',
		locate: (path) => ({ source: 'site structures', field: path.join('.') }),
	});
};
