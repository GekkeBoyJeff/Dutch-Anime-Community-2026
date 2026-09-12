import type { ReactNode } from 'react';
import { z } from 'zod';

export const ContainerProps = z
	.object({
		element: z.string().optional().describe('The element tag to render; defaults to \'div\''),
		full: z.boolean().optional().describe('Drop the readable max-width for a full-bleed container; defaults to false'),
		gutter: z
			.enum(['none', 'xs', 's', 'm', 'l', 'xl'])
			.optional()
			.describe('Horizontal gutter; omit to inherit the section gutter'),
		children: z.custom<ReactNode>().optional().describe('The content the container centres'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Container' });
export type ContainerProps = z.infer<typeof ContainerProps>;
