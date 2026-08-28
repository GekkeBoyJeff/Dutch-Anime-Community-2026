import type { ReactNode } from 'react';
import { z } from 'zod';

import { SiteStructures } from '@/lib/site/content/schema/structures/site';

export const SiteChromeProps = z
	.object({
		structures: SiteStructures.describe('The site-wide chrome document: announcement bar, navigation and footer'),
		children: z.custom<ReactNode>().optional().describe('The page, rendered between the navigation and the footer'),
	})
	.meta({ title: 'SiteChrome' });
export type SiteChromeProps = z.infer<typeof SiteChromeProps>;
