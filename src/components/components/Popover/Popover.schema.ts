import type { ReactNode, RefObject } from 'react';
import { z } from 'zod';

export const PopoverProps = z
	.object({
		open: z.boolean().optional().describe('Controlled open state'),
		defaultOpen: z.boolean().optional().describe('Uncontrolled initial open state; defaults to false'),
		title: z.string().optional().describe('Optional heading inside the popup — wired to aria-labelledby'),
		ariaLabel: z.string().optional().describe('Accessible name when there is no visible title — sets aria-label on the popup'),
		side: z
			.enum(['top', 'bottom', 'left', 'right', 'inline-start', 'inline-end'])
			.optional()
			.describe('Preferred placement; defaults to \'bottom\''),
		align: z.enum(['start', 'center', 'end']).optional().describe('Alignment along the side axis; defaults to \'center\''),
		sideOffset: z.number().optional().describe('Gap from the anchor on the main axis in px; defaults to 8'),
		alignOffset: z.number().optional().describe('Shift along the alignment axis in px; defaults to 0'),
		collisionPadding: z.number().optional().describe('Min gap from the viewport edge before flip/shift in px; defaults to 8'),
		modal: z
			.union([z.boolean(), z.literal('trap-focus')])
			.optional()
			.describe('Scroll-lock + focus trap while open; defaults to false'),
		showArrow: z.boolean().optional().describe('Render the pointer arrow; defaults to false'),
		children: z.custom<ReactNode>().optional().describe('The floating content (passed to the popup)'),
		trigger: z.custom<ReactNode>().optional().describe('Element that opens it; rendered as the Base UI trigger. Omit when using \'anchor\''),
		onOpenChange: z.custom<(open: boolean) => void>().optional().describe('Fires on every open/close'),
		anchor: z
			.custom<Element | RefObject<Element | null> | null>()
			.optional()
			.describe('Position against a custom element instead of the trigger (Combobox/Select hook-point)'),
		className: z.string().optional().describe('Extra classes on the popup'),
	})
	.meta({ title: 'Popover' });
export type PopoverProps = z.infer<typeof PopoverProps>;
