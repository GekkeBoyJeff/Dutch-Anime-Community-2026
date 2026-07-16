import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import Button from '@/components/basics/Button';
import ConfirmDialog from '@/components/components/ConfirmDialog';

const meta: Meta<typeof ConfirmDialog> = {
	title: 'Components/ConfirmDialog',
	component: ConfirmDialog,
	parameters: {
		docs: {
			description: {
				component:
					"A confirm/cancel dialog on Modal variant='alert' (role=alertdialog, never light-dismisses). Modal owns no confirm/cancel, so this composes the footer buttons and drives close through onOpenChange — the dialog does NOT auto-close on confirm, so a handler can keep it open on error. Destructive styling comes from the is-danger class.",
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof ConfirmDialog>;

// A wrapper so the trigger button actually opens/closes the dialog in the canvas.
export const Default: Story = {
	render: () => {
		const Demo = () => {
			const [open, setOpen] = useState(false);
			return (
				<>
					<Button onClick={() => setOpen(true)}>Wijzigingen opslaan…</Button>
					<ConfirmDialog
						open={open}
						onOpenChange={setOpen}
						title="Wijzigingen opslaan?"
						description="Je bewerkingen worden meteen zichtbaar voor andere beheerders."
						confirmLabel="Opslaan"
						onConfirm={() => setOpen(false)}
					/>
				</>
			);
		};
		return <Demo />;
	},
};

export const Destructive: Story = {
	render: () => {
		const Demo = () => {
			const [open, setOpen] = useState(false);
			return (
				<>
					<Button variant="ghost" icon="trash" onClick={() => setOpen(true)}>
						Item verwijderen
					</Button>
					<ConfirmDialog
						open={open}
						onOpenChange={setOpen}
						destructive
						title="Item verwijderen?"
						description="Dit kan niet ongedaan worden gemaakt."
						confirmLabel="Verwijderen"
						onConfirm={() => setOpen(false)}
					/>
				</>
			);
		};
		return <Demo />;
	},
};
