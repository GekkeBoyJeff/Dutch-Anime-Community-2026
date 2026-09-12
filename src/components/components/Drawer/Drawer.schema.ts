import type { ReactNode } from 'react';
import { z } from 'zod';

export const DrawerProps = z
	.object({
		open: z.boolean().optional().describe('Controlled open state. Omit to let the drawer manage its own state'),
		defaultOpen: z.boolean().optional().describe('Uncontrolled initial open state'),
		position: z.enum(['left', 'right', 'bottom']).optional().describe('Edge the panel slides in from; defaults to \'right\''),
		title: z.string().optional().describe('Visible heading — wired to aria-labelledby'),
		description: z.string().optional().describe('Supporting line under the title — wired to aria-describedby'),
		ariaLabel: z.string().optional().describe('Accessible name when there is no visible title'),
		size: z.string().optional().describe('Panel size: width for left/right, height for bottom (any CSS length); defaults to \'22rem\''),
		dismissible: z.boolean().optional().describe('Allow an outside press to close the drawer (Escape always closes); defaults to true'),
		onOpenChange: z.custom<(open: boolean) => void>().optional().describe('Fires on every open/close'),
		trigger: z.custom<ReactNode>().optional().describe('Element that opens the drawer; rendered as the Base UI trigger'),
		header: z.custom<ReactNode>().optional().describe('Replaces the whole header, title and description included'),
		footer: z.custom<ReactNode>().optional().describe('The footer content, usually the actions'),
		children: z.custom<ReactNode>().optional().describe('The panel body'),
		className: z.string().optional().describe('Extra classes on the panel'),
	})
	.meta({ title: 'Drawer' });
export type DrawerProps = z.infer<typeof DrawerProps>;
