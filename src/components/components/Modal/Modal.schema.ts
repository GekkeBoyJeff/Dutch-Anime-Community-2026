import type { ReactNode } from 'react';
import { z } from 'zod';

export const ModalProps = z
	.object({
		open: z.boolean().optional().describe('Controlled open state. Omit to let the modal manage its own state'),
		defaultOpen: z.boolean().optional().describe('Uncontrolled initial open state'),
		title: z.string().optional().describe('Visible heading — wired to aria-labelledby'),
		description: z.string().optional().describe('Supporting line under the title — wired to aria-describedby'),
		ariaLabel: z.string().optional().describe('Accessible name when there is no visible title (required for variant=\'alert\' with no title)'),
		variant: z.enum(['modal', 'alert']).optional().describe('\'modal\' (default focus trap + scroll lock) or \'alert\' (role=alertdialog, no light-dismiss); defaults to \'modal\''),
		size: z.enum(['s', 'm', 'l', 'xl']).optional().describe('Width preset of the panel; defaults to \'m\''),
		dismissible: z.boolean().optional().describe('Allow Escape + outside-press to close. Ignored for variant=\'alert\'; defaults to true'),
		onOpenChange: z.custom<(open: boolean) => void>().optional().describe('Fires on every open/close'),
		trigger: z.custom<ReactNode>().optional().describe('Element that opens the modal; rendered as the Base UI trigger'),
		header: z.custom<ReactNode>().optional().describe('Replaces the whole header, title and description included'),
		footer: z.custom<ReactNode>().optional().describe('The footer content, usually the actions'),
		children: z.custom<ReactNode>().optional().describe('The panel body'),
		className: z.string().optional().describe('Extra classes on the panel'),
	})
	.meta({ title: 'Modal' });
export type ModalProps = z.infer<typeof ModalProps>;
