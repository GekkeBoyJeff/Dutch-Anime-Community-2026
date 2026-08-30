import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import CTABanner from '@/components/contentBlocks/CTABanner';
import { CTABannerProps } from '@/lib/site/content/schema/blocks/ctaBanner';
import { demoImage } from '@/stories/basics/Media.stories';

const meta: Meta<typeof CTABanner> = {
	title: 'ContentBlocks/CTABanner',
	component: CTABanner,
	parameters: {
		docs: { description: { component: 'A conversion banner: a heading cluster with one or two call-to-action buttons, optionally beside media. Server Component.' } },
		jsonSchema: { schema: CTABannerProps },
	},
	argTypes: {
		tone: {
			control: 'inline-radio',
			options: ['neutral', 'primary', 'success', 'warning'],
		},
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

type Story = StoryObj<typeof CTABanner>;

export const Default: Story = {
	args: {
		heading: {
			tagline: 'Get started',
			title: 'Ready to build your next page?',
			intro: 'Compose a page from validated blocks and ship it the same afternoon.',
		},
		primaryCta: { value: 'Start now', variant: 'primary' },
		secondaryCta: { value: 'Read the docs', variant: 'secondary', url: '/docs' },
		tone: 'primary',
		align: 'start',
	},
};

export const Centered: Story = {
	...Default,
	args: {
		...Default.args,
		align: 'center',
		tone: 'neutral',
	},
};

export const WithMedia: Story = {
	...Default,
	args: {
		...Default.args,
		media: {
			...demoImage,
			ratio: '16 / 9',
		},
	},
};
