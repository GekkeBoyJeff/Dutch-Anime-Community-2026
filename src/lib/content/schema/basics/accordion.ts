import { z } from 'zod';

import { AccordionItemProps } from '@/lib/content/schema/basics/accordionItem';

// A collapsible disclosure group built from AccordionItem. `items` mirrors a subset of
// AccordionItemProps (no `content`, which stays TS-only as it is not JSON-serializable).
export const AccordionProps = z
	.object({
		value: z.array(z.string()).optional().describe('The open item values (controlled); always an array, even in single mode'),
		defaultValue: z.array(z.string()).optional().describe('The initially open item values when uncontrolled'),
		multiple: z.boolean().optional().describe('Allows several items open at once; defaults to false (single-open)'),
		disabled: z.boolean().optional().describe('Disables every item'),
		orientation: z.enum(['vertical', 'horizontal']).optional().describe('Arrow-key navigation axis; defaults to \'vertical\''),
		items: z
			.array(AccordionItemProps.pick({ value: true, title: true, disabled: true, icon: true }))
			.optional()
			.describe('Data-driven items, so a Server page can render from validated content'),
		headingLevel: z
			.union([z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)])
			.optional()
			.describe('Heading tag wrapping each trigger in the `items` form; defaults to 3'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Accordion' });
export type AccordionProps = z.infer<typeof AccordionProps>;
