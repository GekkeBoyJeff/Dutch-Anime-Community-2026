import { z } from 'zod';

// Semantic grouping for a set of related fields; the orientation is forwarded to child Fields via context.
export const FieldSetProps = z
	.object({
		orientation: z.enum(['vertical', 'horizontal']).optional().describe('Layout context inherited by child Fields; defaults to \'vertical\''),
		disabled: z.boolean().optional().describe('Disables every control in the group via the native <fieldset disabled>'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'FieldSet' });
export type FieldSetProps = z.infer<typeof FieldSetProps>;
