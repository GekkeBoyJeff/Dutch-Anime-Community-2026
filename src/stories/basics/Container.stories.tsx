import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Container from '@/components/basics/Container';
import { ContainerProps } from '@/lib/content/schema/basics/container';

const box = (
	<div style={{ background: 'color-mix(in srgb, currentColor 12%, transparent)', padding: '1rem', borderRadius: '8px' }}>
		Centred content at a readable max-width.
	</div>
);

const meta: Meta<typeof Container> = {
	title: 'Basics/Container',
	component: Container,
	parameters: {
		docs: { description: { component: 'Centres content at a readable max-width with a responsive gutter. `full` removes the max-width; `gutter` overrides the inherited section gutter.' } },
		jsonSchema: { schema: ContainerProps },
	},
	argTypes: {
		full: { control: 'boolean' },
		gutter: { control: 'inline-radio', options: [undefined, 'none', 'xs', 's', 'm', 'l', 'xl'] },
	},
	render: (args) => <Container {...args}>{box}</Container>,
};

export default meta;

type Story = StoryObj<typeof Container>;

// Default: a readable max-width container (no modifier class).
export const Default: Story = {
	args: {
		full: false,
	},
};

export const Full: Story = {
	...Default,
	args: {
		...Default.args,
		full: true,
	},
};
