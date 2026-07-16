import 'server-only';

import { structures as rawStructures } from '@/content/structures';
import { SiteStructures } from '@/lib/content/schema';
import { parseContent } from '@/lib/content/validate';
import { env } from '@/lib/env';
import { getAdminClient } from '@/lib/supabase/admin';

// Validated static structures — the local-dev fallback (see pages.ts for the same pattern). Bad chrome
// data fails the build like bad page data.
const staticStructures = parseContent(SiteStructures, rawStructures, {
	label: 'site structures',
	locate: (path) => ({ source: 'site structures', field: path.join('.') }),
});

// Async so the public API survives a future CMS swap unchanged (same contract as getPageByPath).
// Supabase-backed when SUPABASE_SERVICE_ROLE_KEY is set; the static structures otherwise.
export const getSiteStructures = async (): Promise<SiteStructures> => {
	if (!env.SUPABASE_SERVICE_ROLE_KEY) return staticStructures;
	const { data } = await getAdminClient().from('structures').select('data').eq('id', 1).maybeSingle();
	const parsed = data ? SiteStructures.safeParse(data.data) : undefined;
	return parsed?.success ? parsed.data : staticStructures;
};
