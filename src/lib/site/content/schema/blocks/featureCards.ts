import { z } from 'zod';

import { Colorset, Id, Media } from '@/lib/site/content/schema/primitives';

export const FeatureCardItem = z
	.object({
		id: Id,
		title: z.string().optional().describe('Card heading text'),
		value: z.string().optional().describe('Card body text').meta({ editor: 'richtext' }),
		media: Media.optional().describe('Image shown on the card'),
	})
	.meta({ title: 'FeatureCardItem' });
export type FeatureCardItem = z.infer<typeof FeatureCardItem>;

export const FeatureCardsProps = z
	.object({
		colorset: Colorset.optional().describe('Light or dark theme applied to the section'),
		title: z.string().optional().describe('The section\'s heading text'),
		intro: z.string().optional().describe('The section\'s intro text shown below the heading').meta({ editor: 'textarea' }),
		items: z.array(FeatureCardItem).min(1).describe('Cards rendered in the grid'),
	})
	.meta({ title: 'FeatureCards' });
export type FeatureCardsProps = z.infer<typeof FeatureCardsProps>;

export const FeatureCardsBlock = FeatureCardsProps.extend({ type: z.literal('featureCards'), id: Id.optional() });
export type FeatureCardsBlock = z.infer<typeof FeatureCardsBlock>;
