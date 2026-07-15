import { z } from 'zod';

// Props for the ScrollArea component: a styled, cross-browser scrollbar for an overflow region
// (menu, dialog, code block, sidebar).
export const ScrollAreaProps = z
	.object({
		orientation: z.enum(['vertical', 'horizontal', 'both']).optional().describe('Which axes can scroll; defaults to vertical only'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'ScrollArea' });
export type ScrollAreaProps = z.infer<typeof ScrollAreaProps>;
