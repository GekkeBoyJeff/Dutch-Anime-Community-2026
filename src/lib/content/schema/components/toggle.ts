import { z } from 'zod';

export const ToggleProps = z
	.object({
		pressed: z.boolean().optional().describe('Controlled pressed state; omit for an uncontrolled button'),
		defaultPressed: z.boolean().optional().describe('Uncontrolled initial pressed state'),
		icon: z.string().optional().describe('Optional leading Icon glyph name'),
		disabled: z.boolean().optional().describe('Disable the button'),
		'aria-label': z.string().optional().describe('Accessible name, required when the button is icon-only'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Toggle' });

export type ToggleProps = z.infer<typeof ToggleProps>;
