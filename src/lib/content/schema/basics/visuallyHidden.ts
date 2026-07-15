import { z } from 'zod';

// Typed wrapper for the global `.sr-only` utility; `element` stays TS-only (ElementType is not
// serializable), so `className` is the only prop this contract can describe.
export const VisuallyHiddenProps = z
	.object({
		className: z.string().optional().describe('Additional class name(s) merged onto the sr-only element'),
	})
	.meta({ title: 'VisuallyHidden' });
export type VisuallyHiddenProps = z.infer<typeof VisuallyHiddenProps>;
