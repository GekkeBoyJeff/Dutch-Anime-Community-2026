import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import StatCluster from '@/components/components/StatCluster';
import { StatClusterProps } from '@/lib/content/schema/components/statCluster';

const meta: Meta<typeof StatCluster> = {
	title: 'Components/StatCluster',
	component: StatCluster,
	parameters: {
		docs: {
			description: {
				component:
					'A row of short facts in two levels: a large anchor with a small label under it. Plain text, so a word works as well as a number — for figures that count up on scroll, use the statBand block.',
			},
		},
		jsonSchema: { schema: StatClusterProps },
	},
};

export default meta;

type Story = StoryObj<typeof StatCluster>;

export const Default: Story = {
	args: {
		items: [
			{ id: 's1', value: '4.500+', label: 'leden' },
			{ id: 's2', value: '2019', label: 'sinds' },
			{ id: 's3', value: 'Gratis', label: 'altijd' },
		],
	},
};
