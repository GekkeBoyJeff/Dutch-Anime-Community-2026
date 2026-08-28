import type { ReactNode } from 'react';
import { z } from 'zod';

import { Colorset } from '@/lib/site/content/schema/primitives';

export const SectionProps = z
	.object({
		element: z.string().optional().describe('The element tag to render; defaults to \'section\''),
		colorset: Colorset.optional().describe('The colorset this subtree uses (light, dark)'),
		children: z.custom<ReactNode>().optional().describe('The section content'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Section' });
export type SectionProps = z.infer<typeof SectionProps>;
