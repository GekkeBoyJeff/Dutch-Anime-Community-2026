import { z } from 'zod';

// One collapsible row's props: header, trigger and panel content in a single piece. `content` (the
// panel's ReactNode body) stays TS-only since it is not JSON-serializable.
export const AccordionItemProps = z
	.object({
		value: z.string().min(1).describe('Unique id for this item (its key in the open set)'),
		title: z.string().min(1).describe('The trigger label; may contain HTML'),
		disabled: z.boolean().optional().describe('Disables just this item'),
		headingLevel: z
			.union([z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)])
			.optional()
			.describe('Heading element h{level} wrapping the trigger; defaults to 3'),
		icon: z.string().optional().describe('The chevron glyph name; rotates when open; defaults to \'chevron-down\''),
		keepMounted: z
			.boolean()
			.optional()
			.describe(
				'Keeps the panel content in the DOM while closed (SEO, anchor links). Forced on when `hiddenUntilFound` is enabled, which requires the panel to stay mounted; defaults to false',
			),
		hiddenUntilFound: z.boolean().optional().describe('Lets in-page browser search (Ctrl+F) find and expand the panel; defaults to true'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'AccordionItem' });
export type AccordionItemProps = z.infer<typeof AccordionItemProps>;
