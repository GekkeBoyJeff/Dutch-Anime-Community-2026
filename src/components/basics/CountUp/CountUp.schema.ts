import { z } from 'zod';

export const CountUpProps = z
	.object({
		value: z.number().describe('The numeric value the counter animates towards'),
		prefix: z.string().optional().describe('Text rendered before the number, e.g. \'€\''),
		suffix: z.string().optional().describe('Text rendered after the number, e.g. \'+\''),
		decimals: z.number().int().min(0).max(2).optional().describe('Number of decimals shown, 0–2; defaults to 0'),
		duration: z.number().int().min(0).optional().describe('Length of the count-up in milliseconds; defaults to 1800'),
	})
	.meta({ title: 'CountUp' });
export type CountUpProps = z.infer<typeof CountUpProps>;
