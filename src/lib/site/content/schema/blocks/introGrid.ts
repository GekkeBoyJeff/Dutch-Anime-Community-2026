import { z } from 'zod';

import { Colorset, Heading, Id } from '@/lib/site/content/schema/primitives';

export const IntroGridPanel = z
	.object({
		id: Id,
		tagline: z.string().optional().describe('Small label rendered above the panel title'),
		title: z.string().optional().describe('Heading text of the panel'),
		subtitle: z.string().optional().describe('Supporting text rendered below the title'),
		accent: z.enum(['primary', 'info', 'success', 'warning']).optional().describe('Accent color applied to the panel card; defaults to primary'),
		action: z
			.object({
				label: z.string().min(1).describe('Visible text of the action shown at the bottom of the panel'),
				href: z.string().min(1).describe('Destination URL that makes the whole panel a clickable link'),
				icon: z.string().optional().describe('Name of the icon rendered before the action label').meta({ editor: 'icon' }),
			})
			.optional()
			.describe('Turns the whole panel into a link and renders a label with optional icon at the bottom of the card'),
	})
	.meta({ title: 'IntroGridPanel' });
export type IntroGridPanel = z.infer<typeof IntroGridPanel>;

export const IntroGridProps = z
	.object({
		colorset: Colorset.optional().describe('Light/dark theme applied to the surrounding section'),
		heading: Heading.optional().describe('Heading cluster (tagline, title, size, intro) shown above the grid'),
		panels: z.array(IntroGridPanel).min(1).describe('The 2–4 panels rendered as cards in the grid; the count drives the column layout'),
	})
	.meta({ title: 'IntroGrid' });
export type IntroGridProps = z.infer<typeof IntroGridProps>;

export const IntroGridBlock = IntroGridProps.extend({ type: z.literal('introGrid'), id: Id.optional() });
export type IntroGridBlock = z.infer<typeof IntroGridBlock>;
