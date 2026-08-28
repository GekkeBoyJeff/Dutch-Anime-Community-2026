import { z } from 'zod';

import { Action, Colorset, Heading, Id, Media } from '@/lib/site/content/schema/primitives';

export const CTABannerProps = z.object({
	colorset: Colorset.optional().describe('Light/dark theme applied to the surrounding section'),
	heading: Heading.optional().describe('Heading group (tagline, title, size, intro) shown above the actions'),
	primaryCta: Action.optional().describe('Main call-to-action button shown in the actions row'),
	secondaryCta: Action.optional().describe('Secondary call-to-action button shown alongside the primary one'),
	tone: z.enum(['neutral', 'primary', 'success', 'warning']).optional().describe('Color tint applied to the banner panel'),
	align: z.enum(['start', 'center']).optional().describe('Horizontal alignment of the heading cluster'),
	media: Media.optional().describe('Image, video or embed displayed beside the copy'),
}).meta({ title: 'CTABanner' });
export type CTABannerProps = z.infer<typeof CTABannerProps>;

export const CTABannerBlock = CTABannerProps.extend({
	type: z.literal('ctaBanner'),
	id: Id.optional(),
});
export type CTABannerBlock = z.infer<typeof CTABannerBlock>;
