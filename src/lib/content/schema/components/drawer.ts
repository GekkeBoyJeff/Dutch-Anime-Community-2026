import { z } from 'zod';

// Props for the Drawer component: side/bottom slide-in panel over Base UI's Dialog parts (focus
// trap, scroll lock, focus restore and aria-modal come free).
export const DrawerProps = z
	.object({
		open: z.boolean().optional().describe('Controlled open state. Omit to let the drawer manage its own state'),
		defaultOpen: z.boolean().optional().describe('Uncontrolled initial open state'),
		position: z.enum(['left', 'right', 'bottom']).optional().describe('Edge the panel slides in from; defaults to \'right\''),
		title: z.string().optional().describe('Visible heading — wired to aria-labelledby'),
		description: z.string().optional().describe('Supporting line under the title — wired to aria-describedby'),
		label: z.string().optional().describe('Accessible name when there is no visible title'),
		size: z.string().optional().describe('Panel size: width for left/right, height for bottom (any CSS length); defaults to \'22rem\''),
		dismissible: z.boolean().optional().describe('Allow an outside press to close the drawer (Escape always closes); defaults to true'),
		className: z.string().optional().describe('Extra classes on the panel'),
	})
	.meta({ title: 'Drawer' });
export type DrawerProps = z.infer<typeof DrawerProps>;
