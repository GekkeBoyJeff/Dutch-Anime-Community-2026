import { z } from 'zod';

export const TitleProps = z
	.object({
		element: z.string().optional().describe('The HTML tag; defaults to h{size}. Lets an h2 show the h3 role, etc'),
		size: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]).optional().describe('The type role (h1–h6) that picks the responsive size; defaults to 2'),
		className: z.string().optional().describe('Additional classes on the root element'),
		value: z.string().optional().describe('The text; may contain HTML'),
	})
	.meta({ title: 'Title' });
export type TitleProps = z.infer<typeof TitleProps>;
