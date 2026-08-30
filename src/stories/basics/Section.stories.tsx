import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Content from '@/components/basics/Content';
import Section from '@/components/basics/Section';
import Title from '@/components/basics/Title';
import { SectionProps } from '@/lib/site/content/schema/basics/section';

const meta: Meta<typeof Section> = {
	title: 'Basics/Section',
	component: Section,
	parameters: {
		docs: { description: { component: 'Page-shell unit that carries the colorset attribute; the whole subtree inherits the colors without color props.' } },
		jsonSchema: { schema: SectionProps },
	},
	argTypes: {
		colorset: {
			control: 'inline-radio',
			options: ['light', 'dark'],
		},
	},
};

export default meta;

type Story = StoryObj<typeof Section>;

export const Default: Story = {
	args: {
		children: (
			<>
				<Title size={2} value="A section" />
				<Content value="The section carries the colorset; everything inside reads the runtime colors." />
			</>
		),
	},
};

export const Nested: Story = {
	parameters: {
		docs: { description: { story: 'A dark panel inside a light section switches only its own subtree.' } },
	},
	args: {
		colorset: 'light',
		children: (
			<>
				<Title size={3} value="Light" />
				<Content value="The outer section is light." />
				<Section colorset="dark">
					<Content value="This nested panel is dark — the cascade switches only here." />
				</Section>
			</>
		),
	},
};
