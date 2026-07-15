import { z } from 'zod';

import { InteractiveProps } from '@/lib/content/schema/basics/interactive';

// A Link goes somewhere, so `url` is required and the button-only props are dropped — it is always an
// anchor (next/link for an internal route, a plain <a> for an external one, handled by Interactive).
export const LinkProps = InteractiveProps.omit({ type: true, name: true, value: true, form: true })
	.extend({
		url: z.string().min(1).describe('Target URL (required — a Link is always a link)'),
	})
	.meta({ title: 'Link' });
export type LinkProps = z.infer<typeof LinkProps>;
