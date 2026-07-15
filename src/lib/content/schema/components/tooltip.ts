import { z } from 'zod';

export const TooltipProps = z
	.object({
		label: z.string().optional().describe('The bubble text; may contain HTML (parsed like Title)'),
		side: z.enum(['top', 'bottom', 'left', 'right']).optional().describe('Preferred side of the trigger; defaults to \'top\''),
		align: z.enum(['start', 'center', 'end']).optional().describe('Alignment along that side; defaults to \'center\''),
		sideOffset: z.number().optional().describe('Gap from the trigger in px; defaults to 8'),
		arrow: z.boolean().optional().describe('Shows the small pointer arrow; defaults to false'),
		delay: z.number().optional().describe('Per-tooltip override of the open delay in ms'),
		disabled: z.boolean().optional().describe('When true, the tooltip never opens; defaults to false'),
		className: z.string().optional().describe('Extra classes on the popup'),
	})
	.meta({ title: 'Tooltip' });
export type TooltipProps = z.infer<typeof TooltipProps>;
