import { z } from 'zod';

export const ConfirmDialogProps = z
	.object({
		open: z.boolean().describe('Whether the dialog is open'),
		onOpenChange: z.custom<(open: boolean) => void>().describe('Fires with the new open state; the parent owns the open flag'),
		title: z.string().optional().describe('Visible heading — wired to aria-labelledby'),
		ariaLabel: z.string().optional().describe('Accessible name when there is no visible title; defaults to the confirm label'),
		description: z.string().optional().describe('Supporting line under the title — wired to aria-describedby'),
		confirmLabel: z.string().optional().describe('Label on the confirming button; defaults to \'Bevestigen\''),
		cancelLabel: z.string().optional().describe('Label on the dismissing button; defaults to \'Annuleren\''),
		destructive: z.boolean().optional().describe('Styles the confirm button as destructive; defaults to false'),
		onConfirm: z.custom<() => void>().describe('Fires when the confirm button is pressed'),
		onCancel: z.custom<() => void>().optional().describe('Fires on cancel and on Escape, just before the dialog is closed'),
	})
	.meta({ title: 'ConfirmDialog' });
export type ConfirmDialogProps = z.infer<typeof ConfirmDialogProps>;
