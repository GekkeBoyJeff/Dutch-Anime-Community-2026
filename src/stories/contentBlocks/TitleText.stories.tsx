import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import TitleText from '@/components/contentBlocks/TitleText';
import { TitleTextProps } from '@/lib/site/content/schema/blocks/titleText';

const meta: Meta<typeof TitleText> = {
	title: 'ContentBlocks/TitleText',
	component: TitleText,
	parameters: {
		docs: { description: { component: 'The most generic prose block: a heading group, a rich-text body and a row of action buttons. Server Component.' } },
		jsonSchema: { schema: TitleTextProps },
	},
	argTypes: {
		align: {
			control: 'inline-radio',
			options: ['start', 'center'],
		},
		colorset: {
			control: 'inline-radio',
			options: ['light', 'dark'],
		},
	},
};

export default meta;

type Story = StoryObj<typeof TitleText>;

export const Default: Story = {
	args: {
		heading: {
			tagline: 'About',
			title: 'A starter built around content as data',
			intro: 'Every page is validated data, ready for a CMS.',
		},
		value: '<p>Compose pages from a small set of primitives. Each block receives its data via props and never fetches on its own.</p>',
		actions: [
			{ value: 'Get started', variant: 'primary' },
			{ value: 'Learn more', variant: 'ghost', url: '/about' },
		],
		align: 'start',
	},
};

export const Centered: Story = {
	...Default,
	args: {
		...Default.args,
		align: 'center',
	},
};
