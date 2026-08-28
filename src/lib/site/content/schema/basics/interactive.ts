import type { MouseEvent } from 'react';
import { z } from 'zod';

export const InteractiveProps = z
	.object({
		url: z
			.string()
			.optional()
			.describe('Target URL. Omit → a <button>; an internal path → next/link; an http(s) url or target="_blank" → an external <a>'),
		target: z.string().optional().describe('Anchor target, e.g. "_blank" (also forces the external-anchor branch)'),
		rel: z.string().optional().describe('Anchor rel; an external link always gets "noopener noreferrer" merged in'),
		download: z.union([z.boolean(), z.string()]).optional().describe('Anchor download hint (anchor branch only)'),
		type: z
			.enum(['button', 'submit', 'reset'])
			.optional()
			.describe('Button type when there is no url (button branch only); defaults to \'button\''),
		disabled: z.boolean().optional().describe('Blocks the click (and navigation) and dims the element; defaults to false'),
		icon: z.string().optional().describe('Icon name rendered in place of the visible text; `value` then only names the element for assistive tech').meta({ editor: 'icon' }),
		value: z.string().optional().describe('The visible text, or — when an icon is set — the accessible name that replaces it'),
		ariaLabel: z.string().optional().describe('Accessible name; required when an icon replaces the visible text'),
		ariaExpanded: z.boolean().optional().describe('Sets aria-expanded — for a trigger that opens a menu, overlay or disclosure'),
		ariaCurrent: z.enum(['page', 'step', 'location', 'date', 'time']).optional().describe('Sets aria-current — marks this link as the one matching the current context, usually \'page\''),
		ariaPressed: z.boolean().optional().describe('Sets aria-pressed — for a toggle button (invalid on a link, so only use it without a url)'),
		onClick: z.custom<(event: MouseEvent<HTMLElement>) => void>().optional().describe('Fires after the haptic tick on an enabled click; a disabled element preventDefaults instead'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Interactive' });
export type InteractiveProps = z.infer<typeof InteractiveProps>;
