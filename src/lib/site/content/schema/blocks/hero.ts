import { z } from 'zod';

import { Action } from '@/lib/site/content/schema/basics/actions';
import { Colorset, Id, Media } from '@/lib/site/content/schema/primitives';

export const HeroAction = Action.meta({ title: 'HeroAction' });
export type HeroAction = z.infer<typeof HeroAction>;

export const HeroStat = z
	.object({
		count: z.string().min(1).describe('Stat value, e.g. \'4500+\''),
		label: z.string().min(1).describe('Short description shown under the value'),
	})
	.meta({ title: 'HeroStat' });
export type HeroStat = z.infer<typeof HeroStat>;

export const HeroProps = z
	.object({
		colorset: Colorset.optional(),
		variant: z.enum(['panel', 'cover']).optional().describe('How media renders: `panel` = rounded panel inside the container, `cover` = full-bleed to the page frame edges; defaults to `panel`'),
		tagline: z.string().optional().describe('Small label rendered above the title'),
		title: z.string().optional().describe('Main heading text of the hero section'),
		value: z.string().optional().describe('Supporting introductory text rendered below the title').meta({ editor: 'richtext' }),
		actions: z.array(HeroAction).optional().describe('Row of call-to-action buttons rendered below the text'),
		media: Media.optional().describe('Backdrop media; when set the hero renders the content inside it'),
		stats: z.array(HeroStat).optional().describe('Quick facts rendered on the media, e.g. member count'),
		socials: z.array(Action).optional().describe('Links in the tab carved into the cover\'s bottom-left corner (cover variant only)'),
	})
	.meta({ title: 'Hero' });
export type HeroProps = z.infer<typeof HeroProps>;

export const HeroBlock = HeroProps.extend({ type: z.literal('hero'), id: Id.optional() });
export type HeroBlock = z.infer<typeof HeroBlock>;
