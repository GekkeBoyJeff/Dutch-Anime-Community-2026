import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Divider from '@/components/basics/Divider';
import { DividerProps } from '@/lib/site/content/schema/basics/divider';

const meta: Meta<typeof Divider> = {
	title: 'Basics/Divider',
	component: Divider,
	parameters: {
		docs: { description: { component: 'Separator with role="separator" and aria-orientation. Horizontal dividers may carry a centered label; vertical ones stretch inside a row.' } },
		jsonSchema: { schema: DividerProps },
	},
	argTypes: {
		orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
	},
};

export default meta;

type Story = StoryObj<typeof Divider>;

export const Default: Story = {
	args: {
		orientation: 'horizontal',
	},
};

export const WithLabel: Story = {
	args: {
		...Default.args,
		label: 'or',
	},
};

export const Vertical: Story = {
	args: {
		...Default.args,
		orientation: 'vertical',
	},
	decorators: [
		(Story) => (
			<div style={{ display: 'flex', blockSize: '2rem' }}>
				<Story />
			</div>
		),
	],
};
