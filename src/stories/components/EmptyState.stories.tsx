import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import EmptyState from '@/components/components/EmptyState';
import { EmptyStateProps } from '@/lib/content/schema/components/emptyState';

const meta: Meta<typeof EmptyState> = {
	title: 'Components/EmptyState',
	component: EmptyState,
	parameters: {
		docs: {
			description: {
				component:
					'Zero-state: an optional icon/illustration, title, description and up to two actions. Pairs with FilterBar / SearchPalette / ImageList for no-results. A Server Component.',
			},
		},
		jsonSchema: { schema: EmptyStateProps },
	},
	argTypes: {
		compact: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
	args: {
		icon: 'search',
		title: 'No results found',
		description: 'Try a different search term or clear your filters to see everything again.',
		actions: [{ label: 'Clear filters', variant: 'secondary' }],
	},
};

export const Compact: Story = {
	...Default,
	args: {
		...Default.args,
		compact: true
	}
};

export const NoIcon: Story = {
	...Default,
	args: {
		...Default.args,
		icon: undefined
	}
};

export const TwoActions: Story = {
	...Default,
	args: {
		...Default.args,
		title: 'Your library is empty',
		description: 'Add your first item to get started.',
		actions: [
			{ label: 'Add item', variant: 'primary' },
			{ label: 'Import', variant: 'ghost' },
		],
	},
};

export const NoActions: Story = {
	...Default,
	args: {
		...Default.args,
		actions: []
	}
};
