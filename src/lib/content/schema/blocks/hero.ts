import { z } from 'zod';

import { Action, Colorset, Id, Media } from '@/lib/content/schema/primitives';

// Field-identical to Action (label/url/variant/target/icon, same optionality, same variant enum), so
// HeroAction composes the shared primitive instead of re-declaring the same shape.
export const HeroAction = Action.pick({ label: true, url: true, variant: true, target: true, icon: true }).meta({ title: 'HeroAction' });
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
		colorset: Colorset.optional().describe('Light/dark theme applied to the surrounding section'),
		variant: z.enum(['panel', 'cover']).optional().describe('How media renders: `panel` = rounded panel inside the container, `cover` = full-bleed to the page frame edges; defaults to `panel`'),
		tagline: z.string().optional().describe('Small label rendered above the title'),
		title: z.string().optional().describe('Main heading text of the hero section'),
		text: z.string().optional().describe('Supporting introductory text rendered below the title').meta({ editor: 'richtext' }),
		actions: z.array(HeroAction).optional().describe('Row of call-to-action buttons rendered below the text'),
		media: Media.optional().describe('Backdrop media; when set the hero renders the content inside it'),
		stats: z.array(HeroStat).optional().describe('Quick facts rendered on the media, e.g. member count'),
		socials: z.array(Action).optional().describe('Links in the tab carved into the cover\'s bottom-left corner (cover variant only)'),
	})
	.meta({ title: 'Hero' });
export type HeroProps = z.infer<typeof HeroProps>;

// Component props = the block minus the keys Blocks strips before spreading (`type` selects the
// component, `id` becomes the React key).
export const HeroBlock = HeroProps.extend({ type: z.literal('hero'), id: Id.optional() });
export type HeroBlock = z.infer<typeof HeroBlock>;
