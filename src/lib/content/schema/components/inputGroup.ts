import { z } from 'zod';

// Props for the InputGroup component: wraps a single control with leading and/or trailing addons
// in one bordered shell, so the icon, prefix or inline button sits visually inside the field.
export const InputGroupProps = z
	.object({
		disabled: z.boolean().optional().describe('Dims the whole group to match a disabled control inside it; defaults to false'),
		invalid: z.boolean().optional().describe('Force the invalid ring (e.g. when the wrapped Field is invalid); defaults to false'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'InputGroup' });
export type InputGroupProps = z.infer<typeof InputGroupProps>;
