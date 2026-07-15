import { Toast } from '@base-ui/react/toast';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Notification from '@/components/components/Notification';
import NotificationProvider from '@/components/components/NotificationProvider';
import { NotificationProps } from '@/lib/content/schema/components/notification';

const meta: Meta<typeof Notification> = {
	title: 'Components/Notification',
	component: Notification,
	parameters: {
		docs: {
			description: {
				component:
					'Toast outlet for the live stack. Mounted beneath NotificationProvider (which owns Toast.Provider, wrapped once near the app root), so any client component can push a toast imperatively via Toast.useToastManager().add(...). Position is a passthrough the SCSS reads.',
			},
		},
		jsonSchema: { schema: NotificationProps },
	},
	argTypes: {
		position: {
			control: 'inline-radio',
			options: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center'],
		},
	},
};

export default meta;

type Story = StoryObj<typeof Notification>;

// A small trigger that uses the manager from the surrounding provider to push toasts.
const Trigger = () => {
	const toast = Toast.useToastManager();

	return (
		<div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
			<button type="button" onClick={() => toast.add({ title: 'Opgeslagen', description: 'Je wijzigingen zijn bewaard.', type: 'success' })}>
				Success
			</button>
			<button type="button" onClick={() => toast.add({ title: 'Let op', description: 'Controleer je invoer.', type: 'warning' })}>
				Warning
			</button>
			<button type="button" onClick={() => toast.add({ title: 'Mislukt', description: 'Er ging iets mis.', type: 'error' })}>
				Error
			</button>
		</div>
	);
}

export const Default: Story = {
	args: {
		position: 'bottom-right',
	},
	render: (args) => (
		<NotificationProvider>
			<Trigger />
			<Notification {...args} />
		</NotificationProvider>
	),
};

export const TopCenter: Story = {
	...Default,
	args: { ...Default.args, position: 'top-center' },
};
