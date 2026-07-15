import { z } from 'zod';

// A star rating out of `max`. Filled stars carry the accent; the remainder render as outlines. The
// glyphs are decorative — the value is announced through the accessible label.
export const RatingProps = z
	.object({
		value: z.number().min(0).describe('The rating; clamped to 0–max and rounded to whole stars'),
		max: z.number().int().min(1).optional().describe('Total number of stars; defaults to 5'),
		label: z.string().optional().describe('Accessible name, e.g. \'4 van 5 sterren\'; defaults to \'{value}/{max}\''),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Rating' });
export type RatingProps = z.infer<typeof RatingProps>;
