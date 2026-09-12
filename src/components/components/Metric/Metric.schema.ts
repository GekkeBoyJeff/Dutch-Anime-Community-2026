import { z } from 'zod';

export const MetricDelta = z
	.object({
		label: z.string().min(1).describe('The change as text, e.g. \'3\' or \'12%\''),
		direction: z.enum(['up', 'down', 'flat']).describe('Which arrow precedes the label'),
	})
	.meta({ title: 'MetricDelta' });
export type MetricDelta = z.infer<typeof MetricDelta>;

export const MetricProps = z
	.object({
		label: z.string().min(1).describe('What the figure counts'),
		value: z.union([z.string(), z.number()]).describe('The figure itself, already formatted'),
		unit: z.string().optional().describe('Suffix rendered after the figure, e.g. \'%\''),
		delta: MetricDelta.optional().describe('The change beside the figure'),
		trend: z.array(z.number()).optional().describe('Points for the sparkline; two or more are needed before it draws'),
		tone: z.enum(['neutral', 'positive', 'negative']).optional().describe('Semantic colouring of the figure; defaults to \'neutral\''),
		loading: z.boolean().optional().describe('Swaps the figure for a skeleton; defaults to false'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Metric' });
export type MetricProps = z.infer<typeof MetricProps>;
