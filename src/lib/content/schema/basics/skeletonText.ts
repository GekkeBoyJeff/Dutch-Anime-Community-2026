import { z } from 'zod';

// A stack of Skeleton lines for paragraph/heading placeholders; the last line is shortened so the
// block reads like real copy.
export const SkeletonTextProps = z
	.object({
		lines: z.number().optional().describe('Number of placeholder lines; defaults to 3'),
		lastWidth: z
			.string()
			.optional()
			.describe('Width of the last line (shorter reads as a paragraph end); defaults to \'60%\''),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'SkeletonText' });
export type SkeletonTextProps = z.infer<typeof SkeletonTextProps>;
