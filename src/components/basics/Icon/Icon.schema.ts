import { z } from 'zod';

import { IconName } from '@/lib/site/content/shared';

export const IconProps = z
	.object({
		name: IconName.min(1).describe('The glyph name, e.g. \'search\' or \'chevron-down\' — see the ICONS map for the set'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Icon' });
export type IconProps = z.infer<typeof IconProps>;
