import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import MarqueeTicker from '@/components/components/MarqueeTicker';
import { MarqueeTickerProps } from '@/lib/content/schema/components/marqueeTicker';

const meta: Meta<typeof MarqueeTicker> = {
	title: 'Components/MarqueeTicker',
	component: MarqueeTicker,
	parameters: {
		docs: {
			description: {
				component:
					'An infinite horizontal ticker of label (+ optional icon) items. The track is duplicated and translated -100% for a seamless wrap — pure CSS, no JS loop, so it stays a Server Component. Speed and direction are CSS vars; motion pauses on hover and under prefers-reduced-motion.',
			},
		},
		jsonSchema: { schema: MarqueeTickerProps },
	},
	argTypes: {
		direction: {
			control: 'inline-radio',
			options: ['left', 'right'],
		},
		variant: {
			control: 'inline-radio',
			options: ['primary', 'dark', 'light'],
		},
		speed: {
			control: { type: 'range', min: 5, max: 60, step: 1 },
		},
	},
};

export default meta;

type Story = StoryObj<typeof MarqueeTicker>;

export const Default: Story = {
	args: {
		speed: 30,
		direction: 'left',
		variant: 'primary',
		items: [
			{ label: 'New episodes every Friday' },
			{ label: 'Community watch parties' },
			{ label: 'Subtitles in Dutch and English' },
			{ label: 'Join 12,000+ members' },
		],
	},
};

export const Reverse: Story = {
	...Default,
	args: {
		...Default.args,
		direction: 'right'
	}
};

export const Dark: Story = {
	...Default,
	args: {
		...Default.args,
		variant: 'dark'
	}
};

export const Light: Story = {
	...Default,
	args: {
		...Default.args,
		variant: 'light'
	}
};

export const WithIcons: Story = {
	...Default,
	args: {
		...Default.args,
		items: [
			{ label: 'Trending now', icon: 'star' },
			{ label: 'Live events', icon: 'calendar' },
			{ label: 'Top rated', icon: 'heart' },
		],
	},
};

export const Fast: Story = {
	...Default,
	args: {
		...Default.args,
		speed: 12
	}
};
