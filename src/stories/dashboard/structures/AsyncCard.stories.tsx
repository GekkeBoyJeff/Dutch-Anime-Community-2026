import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import AsyncCard from '@/components/dashboard/structures/AsyncCard';

const meta: Meta<typeof AsyncCard> = {
	title: 'Dashboard/Structures/AsyncCard',
	component: AsyncCard,
	parameters: {
		docs: {
			description: {
				component:
					'The shared card frame for an async data widget: a titled surface with an optional deep link and the three async states (skeleton, quiet inline error, empty). Used across the dashboard home widgets.',
			},
		},
	},
	argTypes: {
		loading: { control: 'boolean' },
		isEmpty: { control: 'boolean' },
		hideWhenEmpty: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof AsyncCard>;

export const Default: Story = {
	args: {
		title: 'Mijn declaraties',
		href: '/dashboard/expenses',
		linkLabel: 'Naar declaraties',
		loading: false,
		children: <p>Twee openstaande declaraties, samen € 120,00.</p>,
	},
};

export const Loading: Story = {
	...Default,
	args: {
		...Default.args,
		loading: true,
	},
};

export const ErrorState: Story = {
	...Default,
	name: 'Error',
	args: {
		...Default.args,
		loading: false,
		error: 'network error',
	},
};

export const Empty: Story = {
	...Default,
	args: {
		...Default.args,
		loading: false,
		isEmpty: true,
		emptyLabel: 'Nog geen declaraties ingediend.',
	},
};

export const EmptyHidden: Story = {
	...Default,
	name: 'Empty (hidden)',
	parameters: {
		docs: { description: { story: 'With `hideWhenEmpty`, an empty result drops the card entirely — this story renders nothing.' } },
	},
	args: {
		...Default.args,
		loading: false,
		isEmpty: true,
		hideWhenEmpty: true,
	},
};

export const WithDeeplink: Story = {
	...Default,
	name: 'With deeplink',
	args: {
		...Default.args,
		title: 'Open enquêtes',
		href: '/dashboard/surveys',
		linkLabel: 'Naar enquêtes',
	},
};
