import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Divider from '@/components/basics/Divider';
import { DividerProps } from '@/lib/content/schema/basics/divider';

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
	...Default,
	args: {
		...Default.args,
		label: 'or',
	},
};

export const Vertical: Story = {
	...Default,
	args: {
		...Default.args,
		orientation: 'vertical',
	},
	render: (args) => (
		<div style={{ display: 'flex', gap: '1rem', height: '2rem', alignItems: 'center' }}>
			<span>Left</span>
			<Divider {...args} />
			<span>Right</span>
		</div>
	),
};
