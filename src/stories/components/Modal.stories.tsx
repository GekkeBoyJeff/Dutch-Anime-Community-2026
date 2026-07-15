import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import Button from '@/components/basics/Button';
import Modal from '@/components/components/Modal';
import { ModalProps } from '@/lib/content/schema/components/modal';

const meta: Meta<typeof Modal> = {
	title: 'Components/Modal',
	component: Modal,
	parameters: {
		docs: { description: { component: 'Accessible dialog wrapping Base UI: focus trap, scroll lock, Escape and aria-modal come free. `variant="alert"` swaps to role=alertdialog and never light-dismisses. Tab inside an open modal to confirm focus loops.' } },
		jsonSchema: { schema: ModalProps },
	},
	argTypes: {
		variant: { control: 'inline-radio', options: ['modal', 'alert'] },
		size: { control: 'inline-radio', options: ['s', 'm', 'l', 'xl'] },
		dismissible: { control: 'boolean' },
		title: { control: 'text' },
		description: { control: 'text' },
	},
};

export default meta;

type Story = StoryObj<typeof Modal>;

export const Default: Story = {
	args: {
		title: 'Delete project',
		description: 'This permanently removes the project and all of its data.',
		variant: 'modal',
		size: 'm',
		dismissible: true,
	},
	render: (args) => (
		<Modal {...args} trigger={<Button>Open modal</Button>}>
			Tab through the actions to confirm focus stays trapped inside the dialog.
		</Modal>
	),
};

export const AlertDialog: Story = {
	...Default,
	args: { ...Default.args, variant: 'alert', title: 'Discard changes?', description: 'Your unsaved edits will be lost.' },
	render: (args) => (
		<Modal {...args} trigger={<Button variant="secondary">Discard</Button>} />
	),
};

// The useState harness: shows driving open/close from parent state with footer actions.
export const Controlled: Story = {
	...Default,
	render: function Render(args) {
		const [open, setOpen] = useState(false);

		return (
			<>
				<Button onClick={() => setOpen(true)}>Open modal</Button>
				<Modal
					{...args}
					open={open}
					onOpenChange={setOpen}
					footer={
						<>
							<Button variant="ghost" onClick={() => setOpen(false)}>
								Cancel
							</Button>
							<Button variant="primary" onClick={() => setOpen(false)}>
								Confirm
							</Button>
						</>
					}
				>
					Tab through the actions to confirm focus stays trapped inside the dialog.
				</Modal>
			</>
		);
	},
};
