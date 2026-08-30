import { z } from 'zod';

export const VisuallyHiddenProps = z
	.object({
		className: z.string().optional().describe('Additional class name(s) merged onto the sr-only element'),
		value: z.string().describe('The screen-reader-only text'),
		id: z.string().optional().describe('Id on the root element; Base UI injects one when this is cloned through `render=`, and points the dialog aria-labelledby at it'),
	})
	.meta({ title: 'VisuallyHidden' });
export type VisuallyHiddenProps = z.infer<typeof VisuallyHiddenProps>;
