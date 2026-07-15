import { z } from 'zod';

import { Colorset, Heading, Id, Media } from '@/lib/content/schema/primitives';

// A media panel that grows from an inset rounded card to (nearly) full-bleed while the visitor
// scrolls — driven entirely by CSS scroll-driven animations, so it ships zero JavaScript. Browsers
// without animation-timeline support simply show the full-size panel.
export const GrowingMediaOnScrollProps = z
	.object({
		colorset: Colorset.optional().describe('Light/dark theme applied to the surrounding section'),
		heading: Heading.optional().describe('Heading cluster (tagline, title, intro) shown above the stage'),
		media: Media.describe('The image or video that grows while scrolling'),
		caption: z.string().optional().describe('Short line shown under the stage'),
	})
	.meta({ title: 'GrowingMediaOnScroll' });
export type GrowingMediaOnScrollProps = z.infer<typeof GrowingMediaOnScrollProps>;

// Component props = the block minus the keys Blocks strips before spreading (`type` selects the
// component, `id` becomes the React key).
export const GrowingMediaOnScrollBlock = GrowingMediaOnScrollProps.extend({ type: z.literal('growingMediaOnScroll'), id: Id.optional() });
export type GrowingMediaOnScrollBlock = z.infer<typeof GrowingMediaOnScrollBlock>;
