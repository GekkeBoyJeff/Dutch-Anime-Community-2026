import { z } from 'zod';

export const MeterProps = z
	.object({
		label: z.string().min(1).describe('What is being measured; also the accessible name of the progressbar'),
		value: z.number().describe('The current amount, clamped between 0 and max'),
		max: z.number().describe('The target the value is measured against'),
		shape: z.enum(['bar', 'ring']).optional().describe('Bar or ring rendering; defaults to \'bar\''),
		tone: z.enum(['neutral', 'positive', 'warning', 'negative']).optional().describe('Semantic colouring shared by every fact component; defaults to \'neutral\''),
		valueLabel: z.string().optional().describe('Readout override; defaults to \'{value}/{max}\''),
		completeLabel: z.string().optional().describe('Readout shown instead once value reaches max'),
		loading: z.boolean().optional().describe('Swaps the fill and readout for a skeleton; defaults to false'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Meter' });
export type MeterProps = z.infer<typeof MeterProps>;
