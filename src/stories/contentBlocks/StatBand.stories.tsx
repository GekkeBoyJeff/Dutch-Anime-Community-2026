import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import StatBand from '@/components/contentBlocks/StatBand';
import { StatBandProps } from '@/lib/content/schema/blocks/statBand';

const meta: Meta<typeof StatBand> = {
	title: 'ContentBlocks/StatBand',
	component: StatBand,
	parameters: {
		docs: { description: { component: 'A band of 2-4 key figures that count up when scrolled into view. Server-rendered at their final value; the count-up is a client enhancement that respects reduced motion.' } },
		jsonSchema: { schema: StatBandProps },
	},
	argTypes: {
		colorset: {
			control: 'inline-radio',
			options: ['light', 'dark'],
		},
	},
};

export default meta;

type Story = StoryObj<typeof StatBand>;

export const Default: Story = {
	args: {
		items: [
			{ id: 's1', value: 4500, suffix: '+', label: 'Members' },
			{ id: 's2', value: 1000, suffix: '+', label: 'Online at once' },
			{ id: 's3', value: 4, label: 'Conventions a year' },
			{ id: 's4', value: 100, suffix: '%', label: 'Free' },
		],
	},
};

export const WithHeading: Story = {
	...Default,
	args: {
		...Default.args,
		heading: { tagline: 'In numbers', value: 'The community keeps growing' },
	},
};
