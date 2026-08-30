import { z } from 'zod';

import { InteractiveProps } from '@/lib/site/content/schema/basics/interactive';

export const LinkProps = InteractiveProps.omit({ type: true })
	.extend({
		value: z.string().min(1).describe('The link\'s visible text'),
		url: z.string().min(1).describe('Target URL (required — a Link is always a link)'),
	})
	.meta({ title: 'Link' });
export type LinkProps = z.infer<typeof LinkProps>;
