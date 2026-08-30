import type { ReactNode } from 'react';
import { z } from 'zod';

export const CardProps = z
	.object({
		variant: z.enum(['flat', 'panel', 'polaroid', 'bare']).optional().describe('Surface treatment; omit for the standard card surface. polaroid = padded frame around the media with a floating shadow; bare = structure without chrome (slots + stretched link, no surface)'),
		tagline: z.string().optional().describe('Small label shown above the body'),
		meta: z.string().optional().describe('Small meta line shown under the body (date, count, …)'),
		href: z.string().optional().describe('Whole-card link target; when set the card becomes clickable via a stretched link'),
		linkLabel: z.string().optional().describe('Accessible name for the whole-card link (required when \'href\' is set, since the stretched link has no text of its own) — usually the card\'s title'),
		image: z.custom<ReactNode>().optional().describe('The lead media shown above the body'),
		header: z.custom<ReactNode>().optional().describe('The card heading area, under the tagline'),
		footer: z.custom<ReactNode>().optional().describe('The card footer, kept separately clickable inside a clickable card'),
		children: z.custom<ReactNode>().optional().describe('The card body'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Card' });
export type CardProps = z.infer<typeof CardProps>;
