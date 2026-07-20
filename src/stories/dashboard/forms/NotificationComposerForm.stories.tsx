import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import NotificationProvider from '@/components/components/NotificationProvider';
import NotificationComposerForm, { type ComposerMember } from '@/components/dashboard/forms/NotificationComposerForm';

const members: ComposerMember[] = [
	{ id: 'u1', username: 'Jeffrey' },
	{ id: 'u2', username: 'Mila' },
	{ id: 'u3', username: 'Tom' },
	{ id: 'u4', username: null },
];

const meta: Meta<typeof NotificationComposerForm> = {
	title: 'Dashboard/Forms/NotificationComposerForm',
	component: NotificationComposerForm,
	decorators: [
		(Story) => (
			<NotificationProvider>
				<Story />
			</NotificationProvider>
		),
	],
	parameters: {
		docs: {
			description: {
				component:
					'The notification composer: a message card (title/body/link) and a recipients card (all-members switch or a multi-select), with a send action. Owns its field state and validation; the caller delivers the message via `onSend` and returns success so the fields reset.',
			},
		},
	},
	args: {
		members,
		busy: false,
		onSend: async () => true,
	},
};

export default meta;

type Story = StoryObj<typeof NotificationComposerForm>;

export const Default: Story = {};

export const Sending: Story = {
	name: 'Versturen bezig',
	args: { busy: true },
};

export const NoMembers: Story = {
	name: 'Geen leden',
	args: { members: [] },
};
