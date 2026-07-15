import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Steps from '@/components/contentBlocks/Steps';
import { StepsProps } from '@/lib/content/schema/blocks/steps';

const meta: Meta<typeof Steps> = {
	title: 'ContentBlocks/Steps',
	component: Steps,
	parameters: {
		docs: { description: { component: 'Numbered process / progress block. As `process` it reads like a "how it works" row; as `progress` it is a compact strip where `current` marks the active step (aria-current). A Server Component built on data-attributes.' } },
		jsonSchema: { schema: StepsProps },
	},
	argTypes: {
		variant: {
			control: 'inline-radio',
			options: ['process', 'progress'],
		},
		colorset: {
			control: 'inline-radio',
			options: ['light', 'dark'],
		},
		current: {
			control: { type: 'range', min: 0, max: 3, step: 1 },
		},
	},
};

export default meta;

type Story = StoryObj<typeof Steps>;

export const Default: Story = {
	args: {
		heading: { value: 'How it works', tagline: 'Getting started', intro: 'Three steps to your first deploy.' },
		variant: 'process',
		items: [
			{ id: 'install', title: 'Install', body: 'Clone the starter and run the install script.' },
			{ id: 'configure', title: 'Configure', body: 'Set your brand and routes in site.ts.' },
			{ id: 'deploy', title: 'Deploy', body: 'Push to your host and you are live.' },
		],
	},
};

export const Progress: Story = {
	...Default,
	args: {
		...Default.args,
		heading: { value: 'Checkout' },
		variant: 'progress',
		current: 1,
		items: [
			{ id: 'cart', title: 'Cart' },
			{ id: 'shipping', title: 'Shipping' },
			{ id: 'payment', title: 'Payment' },
			{ id: 'review', title: 'Review' },
		],
	},
};
