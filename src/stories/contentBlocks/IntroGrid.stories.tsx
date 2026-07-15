import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import IntroGrid from '@/components/contentBlocks/IntroGrid';
import { IntroGridProps } from '@/lib/content/schema/blocks/introGrid';

const meta: Meta<typeof IntroGrid> = {
	title: 'ContentBlocks/IntroGrid',
	component: IntroGrid,
	parameters: {
		docs: { description: { component: 'A 2–4 panel intro grid of accent-tinted cards. The panel count drives the column layout; a panel with an action surfaces the whole card as a link. Server Component.' } },
		jsonSchema: { schema: IntroGridProps },
	},
	argTypes: {
		colorset: {
			control: 'inline-radio',
			options: ['light', 'dark'],
		},
	},
};

export default meta;

type Story = StoryObj<typeof IntroGrid>;

export const Default: Story = {
	args: {
		heading: {
			value: 'Three ways to start',
			intro: 'Pick the path that fits where you are.',
		},
		panels: [
			{ id: 'p1', tagline: 'New', title: 'Quick start', subtitle: 'Spin up a page in minutes.', accent: 'primary', action: { label: 'Open guide', url: '/start' } },
			{ id: 'p2', tagline: 'Build', title: 'Components', subtitle: 'Compose from primitives.', accent: 'info', action: { label: 'Browse', url: '/components' } },
			{ id: 'p3', tagline: 'Ship', title: 'Deploy', subtitle: 'Go live the same day.', accent: 'success', action: { label: 'Read more', url: '/deploy' } },
		],
	},
};

export const FourPanels: Story = {
	...Default,
	args: {
		...Default.args,
		panels: [
			{ id: 'p1', title: 'Plan', subtitle: 'Map out the pages.', accent: 'primary' },
			{ id: 'p2', title: 'Build', subtitle: 'Compose the blocks.', accent: 'info' },
			{ id: 'p3', title: 'Review', subtitle: 'Check the content.', accent: 'warning' },
			{ id: 'p4', title: 'Ship', subtitle: 'Deploy with confidence.', accent: 'success' },
		],
	},
};
