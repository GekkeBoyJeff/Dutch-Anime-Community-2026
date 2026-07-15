import { z } from 'zod';

// One term/description pair in a DescriptionList. The description is narrowed to a plain string
// since the actual prop accepts ReactNode, which is not JSON-expressible.
export const DescriptionItem = z
	.object({
		term: z.string().describe('The term, e.g. \'Venue\''),
		description: z.string().describe('The value; a string is parsed as HTML, otherwise rendered as-is'),
	})
	.meta({ title: 'DescriptionItem' });
export type DescriptionItem = z.infer<typeof DescriptionItem>;

// Props for the DescriptionList component: semantic <dl> for spec/detail panels — event detail
// pages (date, venue, price, organizer) and the like.
export const DescriptionListProps = z
	.object({
		items: z.array(DescriptionItem).describe('The term/description pairs, in display order'),
		layout: z.enum(['stacked', 'inline']).optional().describe('\'stacked\' lists term-over-value; \'inline\' sets the term beside the value on wide screens; defaults to \'stacked\''),
		divided: z.boolean().optional().describe('Draws a divider between each pair; defaults to false'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'DescriptionList' });
export type DescriptionListProps = z.infer<typeof DescriptionListProps>;
