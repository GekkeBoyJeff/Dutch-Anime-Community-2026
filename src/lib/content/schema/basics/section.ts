import { z } from 'zod';

import { Colorset } from '@/lib/content/schema/primitives';

// Carries the colorset attribute, so everything beneath it adapts without a colour prop.
export const SectionProps = z
	.object({
		element: z.string().optional().describe('The element tag to render; defaults to \'section\''),
		colorset: Colorset.optional().describe('The colorset this subtree uses (light, dark)'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Section' });
export type SectionProps = z.infer<typeof SectionProps>;
