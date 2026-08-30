import { z } from 'zod';

import { Colorset, Heading, Id } from '@/lib/site/content/schema/primitives';

export const LogoItem = z
	.object({
		id: Id,
		name: z.string().min(1).describe('The logo\'s name, used as the image alt text and, when linked, the accessible label'),
		logo: z.string().min(1).describe('Image source URL of the logo').meta({ editor: 'file' }),
		href: z.string().optional().describe('Destination URL that wraps the logo in a link; omit to render it unlinked'),
	})
	.meta({ title: 'LogoItem' });
export type LogoItem = z.infer<typeof LogoItem>;

export const LogoCloudProps = z
	.object({
		colorset: Colorset.optional().describe('Light/dark theme applied to the surrounding section'),
		heading: Heading.optional().describe('Heading cluster (tagline, title, size, intro) shown above the logo strip'),
		value: z.string().optional().describe('Supporting text rendered below the heading and above the logo strip').meta({ editor: 'textarea' }),
		items: z.array(LogoItem).min(1).describe('The list of logos rendered in the strip'),
		variant: z.enum(['grid', 'marquee']).optional().describe('Layout mode: `grid` wraps logos in a row, `marquee` scrolls them in a continuous CSS loop'),
	})
	.meta({ title: 'LogoCloud' });
export type LogoCloudProps = z.infer<typeof LogoCloudProps>;

export const LogoCloudBlock = LogoCloudProps.extend({
	type: z.literal('logoCloud'),
	id: Id.optional(),
});
export type LogoCloudBlock = z.infer<typeof LogoCloudBlock>;
