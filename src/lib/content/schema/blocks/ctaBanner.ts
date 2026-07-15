import { z } from 'zod';

import { Action, Colorset, Id, Media } from '@/lib/content/schema/primitives';

// A conversion banner: tagline + headline + subline with one or two actions and optional media.
// `tone` tints the surface; `align` controls left vs centred copy. Actions reuse the shared Action
// primitive so the button shape stays identical everywhere.
export const CTABannerProps = z.object({
	colorset: Colorset.optional().describe('Light/dark theme applied to the surrounding section'),
	tagline: z.string().optional().describe('Small label rendered above the headline'),
	headline: z.string().optional().describe('Main heading text of the banner'),
	subline: z.string().optional().describe('Supporting text rendered below the headline').meta({ editor: 'textarea' }),
	primaryCta: Action.optional().describe('Main call-to-action button shown in the actions row'),
	secondaryCta: Action.optional().describe('Secondary call-to-action button shown alongside the primary one'),
	tone: z.enum(['neutral', 'primary', 'success', 'warning']).optional().describe('Color tint applied to the banner panel'),
	align: z.enum(['start', 'center']).optional().describe('Horizontal alignment of the tagline, headline and subline'),
	media: Media.optional().describe('Image, video or embed displayed beside the copy'),
}).meta({ title: 'CTABanner' });
export type CTABannerProps = z.infer<typeof CTABannerProps>;

// The block adds the keys Blocks strips before spreading into props (`type` selects the
// component, `id` becomes the React key).
export const CTABannerBlock = CTABannerProps.extend({
	type: z.literal('ctaBanner'),
	id: Id.optional(),
});
export type CTABannerBlock = z.infer<typeof CTABannerBlock>;
