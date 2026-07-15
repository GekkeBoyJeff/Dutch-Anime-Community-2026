import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Alert from '@/components/basics/Alert';
import { AlertProps } from '@/lib/content/schema/basics/alert';

const meta: Meta<typeof Alert> = {
	title: 'Basics/Alert',
	component: Alert,
	parameters: {
		docs: { description: { component: 'Static inline status callout — distinct from the transient Notification toast and the site-wide AnnouncementBar. Warning/error announce via role="alert".' } },
		jsonSchema: { schema: AlertProps },
	},
	argTypes: {
		variant: { control: 'inline-radio', options: ['info', 'success', 'warning', 'error', 'neutral'] },
	},
};

export default meta;

type Story = StoryObj<typeof Alert>;

export const Default: Story = {
	args: {
		variant: 'info',
		title: 'Heads up',
		children: 'This is an informational message for the reader.',
	},
};

export const Success: Story = {
	...Default,
	args: {
		...Default.args,
		variant: 'success',
		title: 'Saved',
		children: 'Your changes have been saved.',
	},
};

export const Warning: Story = {
	...Default,
	args: {
		...Default.args,
		variant: 'warning',
		title: 'Almost full',
		children: 'You are close to your storage limit.',
	},
};

export const Error: Story = {
	...Default,
	args: {
		...Default.args,
		variant: 'error',
		title: 'Something went wrong',
		children: 'We could not complete your request.',
	},
};
