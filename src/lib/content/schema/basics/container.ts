import { z } from 'zod';

export const ContainerProps = z
	.object({
		full: z.boolean().optional().describe('Drop the readable max-width for a full-bleed container; defaults to false'),
		gutter: z
			.enum(['none', 'xs', 's', 'm', 'l', 'xl'])
			.optional()
			.describe('Horizontal gutter; omit to inherit the section gutter'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Container' });
export type ContainerProps = z.infer<typeof ContainerProps>;
