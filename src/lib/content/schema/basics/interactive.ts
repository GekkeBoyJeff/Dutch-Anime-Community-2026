import { z } from 'zod';

// The serializable half of Interactive's props: the values that pick its render branch (button /
// next/link / external <a>) and the plain HTML attributes it forwards. Callbacks, children and refs
// stay TS-only on the component (see Interactive.tsx).
export const InteractiveProps = z
	.object({
		url: z
			.string()
			.optional()
			.describe('Target URL. Omit → a <button>; an internal path → next/link; an http(s) url or target="_blank" → an external <a>'),
		derivedAriaLabel: z.string().optional().describe('Derived aria-label for the link; if not provided, defaults to the url'),
		target: z.string().optional().describe('Anchor target, e.g. "_blank" (also forces the external-anchor branch)'),
		rel: z.string().optional().describe('Anchor rel; an external link always gets "noopener noreferrer" merged in'),
		download: z.union([z.boolean(), z.string()]).optional().describe('Anchor download hint (anchor branch only)'),
		type: z
			.enum(['button', 'submit', 'reset'])
			.optional()
			.describe('Button type when there is no url (button branch only); defaults to \'button\''),
		name: z.string().optional().describe('Button name for form submission (button branch only)'),
		value: z.union([z.string(), z.number()]).optional().describe('Button value for form submission (button branch only)'),
		form: z.string().optional().describe('Associates the button with a form by id (button branch only)'),
		disabled: z.boolean().optional().describe('Blocks the click (and navigation) and dims the element; defaults to false'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Interactive' });
export type InteractiveProps = z.infer<typeof InteractiveProps>;
