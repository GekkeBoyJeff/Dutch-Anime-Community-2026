import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Panel from '@/components/components/Panel';

const meta: Meta<typeof Panel> = {
	title: 'Components/Panel',
	component: Panel,
	parameters: {
		docs: {
			description: {
				component:
					'The card frame around one or more facts: title, optional deep link, and the empty and error states. Loading is not its concern — each fact component skeletons itself in its own shape.',
			},
		},
	},
	argTypes: {
		isEmpty: { control: 'boolean' },
		hideWhenEmpty: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof Panel>;

export const Default: Story = {
	args: {
		title: 'Volgende shift',
		href: '/dashboard/my-inventory',
		children: <p>Zaterdag 22 augustus, 10:00–14:00</p>,
	},
};

export const Empty: Story = {
	args: { title: 'Volgende shift', isEmpty: true, emptyLabel: 'Nog geen shifts toegewezen.' },
};

export const Error: Story = {
	args: { title: 'Volgende shift', error: 'network', errorLabel: 'Kon niet laden.' },
};
