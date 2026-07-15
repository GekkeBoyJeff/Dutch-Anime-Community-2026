import 'server-only';

import { structures as rawStructures } from '@/content/structures';
import { SiteStructures } from '@/lib/content/schema';
import { parseContent } from '@/lib/content/validate';

// Validated once at module load; bad chrome data fails the build like bad page data.
const siteStructures = parseContent(SiteStructures, rawStructures, {
	label: 'site structures',
	locate: (path) => ({ source: 'site structures', field: path.join('.') }),
});

// Async so the public API survives a future CMS swap unchanged (same contract as getPageByPath).
export const getSiteStructures = async (): Promise<SiteStructures> => {
	return siteStructures;
};
