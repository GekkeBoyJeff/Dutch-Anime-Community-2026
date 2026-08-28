import 'server-only';

import { structures as rawStructures } from '@/content/structures';
import { getAdminClient } from '@/lib/shared/supabase/admin';
import { contentColumn, dbEnabled } from '@/lib/site/content/pages';
import { SiteStructures } from '@/lib/site/content/schema';
import { parseContent } from '@/lib/site/content/validate';

const staticStructures = parseContent(SiteStructures, rawStructures, {
	label: 'site structures',
	locate: (path) => ({ source: 'site structures', field: path.join('.') }),
});

export const getSiteStructures = async (): Promise<SiteStructures> => {
	if (!dbEnabled()) return staticStructures;
	const column = contentColumn();
	const { data } = await getAdminClient().from('structures').select(column).eq('id', 1).maybeSingle();
	// The row type is a union keyed by the selected column; `column` isn't a literal to either side of it.
	const content = data ? (data as Record<'data' | 'published_data', unknown>)[column] : null;
	// No content falls back to the registry; drifted content throws instead of silently serving the fallback.
	if (content === null || content === undefined) return staticStructures;
	return parseContent(SiteStructures, content, {
		label: 'site structures',
		locate: (path) => ({ source: 'site structures', field: path.join('.') }),
	});
};
