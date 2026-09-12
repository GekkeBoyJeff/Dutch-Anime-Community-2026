import { z } from 'zod';

export const MomentProps = z
	.object({
		marker: z.string().min(1).describe('The point in time on the rail, already formatted for display, e.g. \'22 aug\''),
		title: z.string().min(1).describe('What happens or happened'),
		meta: z.string().optional().describe('Supporting line: a time, a place'),
		state: z.enum(['past', 'now', 'upcoming']).optional().describe('Where the moment sits relative to now, which colours the rail; defaults to \'upcoming\''),
		tone: z.enum(['neutral', 'positive', 'warning', 'negative']).optional().describe('Semantic colouring of the entry; defaults to \'neutral\''),
		href: z.string().optional().describe('Destination the entry links to; omit to render it unlinked'),
		trailing: z.string().optional().describe('Short text shown at the end of the row'),
		loading: z.boolean().optional().describe('Renders skeletons in place of the text while the data loads; defaults to false'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Moment' });
export type MomentProps = z.infer<typeof MomentProps>;

export const MomentsProps = z
	.object({
		items: z.array(MomentProps).describe('The moments, in the order they should read'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Moments' });
export type MomentsProps = z.infer<typeof MomentsProps>;
