import { z } from 'zod';

// Props for the Card component: generic surface container every card grid composes. Renders a
// plain <article>, or — when href is set — adds a stretched link so the whole card is one click
// target while the footer stays separately clickable.
export const CardProps = z
	.object({
		variant: z.enum(['flat', 'panel', 'polaroid', 'bare']).optional().describe('Surface treatment; omit for the standard card surface. polaroid = padded frame around the media with a floating shadow; bare = structure without chrome (slots + stretched link, no surface)'),
		tagline: z.string().optional().describe('Small label shown above the body'),
		meta: z.string().optional().describe('Small meta line shown under the body (date, count, …)'),
		href: z.string().optional().describe('Whole-card link target; when set the card becomes clickable via a stretched link'),
		linkLabel: z.string().optional().describe('Accessible name for the whole-card link (required when \'href\' is set, since the stretched link has no text of its own) — usually the card\'s title'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Card' });
export type CardProps = z.infer<typeof CardProps>;
