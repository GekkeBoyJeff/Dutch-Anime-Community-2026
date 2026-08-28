import { z } from 'zod';

import { Colorset, Heading, Id, Media } from '@/lib/site/content/schema/primitives';

export const GrowingMediaOnScrollProps = z
	.object({
		colorset: Colorset.optional().describe('Light/dark theme applied to the surrounding section'),
		heading: Heading.optional().describe('Heading cluster (tagline, title, intro) shown above the stage'),
		media: Media.describe('The image or video that grows while scrolling'),
		caption: z.string().optional().describe('Short line shown under the stage'),
	})
	.meta({ title: 'GrowingMediaOnScroll' });
export type GrowingMediaOnScrollProps = z.infer<typeof GrowingMediaOnScrollProps>;

export const GrowingMediaOnScrollBlock = GrowingMediaOnScrollProps.extend({ type: z.literal('growingMediaOnScroll'), id: Id.optional() });
export type GrowingMediaOnScrollBlock = z.infer<typeof GrowingMediaOnScrollBlock>;
