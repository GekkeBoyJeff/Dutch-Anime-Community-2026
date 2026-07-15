import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import LinkCardGrid from '@/components/contentBlocks/LinkCardGrid';
import { LinkCardGridProps } from '@/lib/content/schema/blocks/linkCardGrid';

const meta: Meta<typeof LinkCardGrid> = {
	title: 'ContentBlocks/LinkCardGrid',
	component: LinkCardGrid,
	parameters: {
		docs: { description: { component: 'A grid of clickable cards: each card is a single Interactive link, so the whole surface is the hit target. Optional icon, title, description, CTA and a drawn trailing arrow.' } },
		jsonSchema: { schema: LinkCardGridProps },
	},
	argTypes: {
		columns: { control: 'inline-radio', options: [2, 3, 4] },
		colorset: { control: 'inline-radio', options: ['light', 'dark'] },
	},
};

export default meta;

type Story = StoryObj<typeof LinkCardGrid>;

export const Default: Story = {
	args: {
		heading: { value: 'Where to next?', tagline: 'Navigate', intro: 'Pick a destination to keep exploring.' },
		columns: 3,
		items: [
			{ id: 'l1', url: '#', icon: 'search', title: 'Documentation', description: 'Guides, references and recipes.', cta: 'Read the docs' },
			{ id: 'l2', url: '#', icon: 'heart', title: 'Showcase', description: 'See what others have built.', cta: 'Browse projects' },
			{ id: 'l3', url: '#', icon: 'menu', title: 'Community', description: 'Join the discussion and get help.', cta: 'Say hello' },
		],
	},
};

export const TwoColumns: Story = {
	...Default,
	args: {
		...Default.args,
		columns: 2,
	},
};

export const NoIcons: Story = {
	...Default,
	args: {
		...Default.args,
		items: [
			{ id: 'n1', url: '#', title: 'Pricing', description: 'Plans for every team size.', cta: 'Compare plans' },
			{ id: 'n2', url: '#', title: 'Changelog', description: 'What shipped recently.', cta: 'See updates' },
			{ id: 'n3', url: '#', title: 'Status', description: 'Live service health.', cta: 'Check status' },
		],
	},
};
