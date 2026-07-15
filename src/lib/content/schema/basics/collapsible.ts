import { z } from 'zod';

// A single open/close region — the disclosure Accordion is built from, used directly for "show
// more", spoiler-hide and single FAQ rows. `trigger` (a custom ReactNode) stays TS-only.
export const CollapsibleProps = z
	.object({
		title: z.string().optional().describe('The trigger label; may contain HTML. Ignored when a `trigger` node is given'),
		icon: z.string().optional().describe('The chevron glyph name; rotates when open; defaults to \'chevron-down\''),
		open: z.boolean().optional().describe('Open state (controlled); omit for uncontrolled'),
		defaultOpen: z.boolean().optional().describe('Initial open state when uncontrolled; defaults to false'),
		disabled: z.boolean().optional().describe('Disables the trigger'),
		keepMounted: z
			.boolean()
			.optional()
			.describe(
				'Keeps the panel content in the DOM while closed (SEO, anchor links). Forced on when `hiddenUntilFound` is enabled, which requires the panel to stay mounted; defaults to false',
			),
		hiddenUntilFound: z
			.boolean()
			.optional()
			.describe('Lets in-page browser search (Ctrl+F) find and expand the closed panel; defaults to true'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Collapsible' });
export type CollapsibleProps = z.infer<typeof CollapsibleProps>;
