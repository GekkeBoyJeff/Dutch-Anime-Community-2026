import { z } from 'zod';

import { AccordionItemProps } from '@/lib/site/content/schema/basics/accordionItem';

export const AccordionProps = z
	.object({
		defaultOpen: z.array(z.string()).optional().describe('The row ids that start open'),
		multiple: z.boolean().optional().describe('Allows several items open at once; defaults to false (single-open)'),
		disabled: z.boolean().optional().describe('Disables every item'),
		items: z
			.array(AccordionItemProps.pick({ id: true, title: true, value: true, disabled: true, icon: true }))
			.describe('The rows to render'),
		headingLevel: z
			.union([z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)])
			.optional()
			.describe('Heading tag wrapping each trigger; defaults to 3'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Accordion' });
export type AccordionProps = z.infer<typeof AccordionProps>;
