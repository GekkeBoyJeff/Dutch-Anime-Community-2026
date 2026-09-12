import type { ReactNode } from 'react';
import { z } from 'zod';

export const TooltipProviderProps = z
	.object({
		delay: z.number().optional().describe('Open delay in ms shared by every tooltip beneath the provider'),
		closeDelay: z.number().optional().describe('Close delay in ms shared by every tooltip beneath the provider'),
		skipDelayMs: z.number().optional().describe('Window in ms in which moving to another trigger opens it instantly; defaults to 400'),
		children: z.custom<ReactNode>().optional().describe('The app subtree whose tooltips share these delays'),
	})
	.meta({ title: 'TooltipProvider' });
export type TooltipProviderProps = z.infer<typeof TooltipProviderProps>;

export const TooltipProps = z
	.object({
		label: z.string().optional().describe('The bubble text; may contain HTML (parsed like Title)'),
		side: z.enum(['top', 'bottom', 'left', 'right']).optional().describe('Preferred side of the trigger; defaults to \'top\''),
		align: z.enum(['start', 'center', 'end']).optional().describe('Alignment along that side; defaults to \'center\''),
		sideOffset: z.number().optional().describe('Gap from the trigger in px; defaults to 8'),
		arrow: z.boolean().optional().describe('Shows the small pointer arrow; defaults to false'),
		delay: z.number().optional().describe('Per-tooltip override of the open delay in ms'),
		disabled: z.boolean().optional().describe('When true, the tooltip never opens; defaults to false'),
		children: z.custom<ReactNode>().optional().describe('The trigger element the bubble describes'),
		className: z.string().optional().describe('Extra classes on the popup'),
	})
	.meta({ title: 'Tooltip' });
export type TooltipProps = z.infer<typeof TooltipProps>;
