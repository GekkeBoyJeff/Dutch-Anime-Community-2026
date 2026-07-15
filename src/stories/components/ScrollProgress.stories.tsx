import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ScrollProgress from '@/components/components/ScrollProgress';
import { ScrollProgressProps } from '@/lib/content/schema/components/scrollProgress';

const meta: Meta<typeof ScrollProgress> = {
	title: 'Components/ScrollProgress',
	component: ScrollProgress,
	parameters: {
		docs: {
			description: {
				component:
					'A reading-progress bar pinned to the top or bottom of the viewport. Pure CSS scroll-driven animation (animation-timeline: scroll()), so it stays a Server Component with no JS. Hidden where scroll-driven timelines are unsupported. Scroll the docs/preview to see it fill.',
			},
		},
		jsonSchema: { schema: ScrollProgressProps },
	},
	argTypes: {
		position: {
			control: 'inline-radio',
			options: ['top', 'bottom'],
		},
		color: {
			control: 'inline-radio',
			options: ['primary', 'secondary'],
		},
	},
	// Tall filler so there is something to scroll past in the preview.
	decorators: [
		(Story) => {
			return (
				<div style={{ minBlockSize: '250vh', padding: '2rem' }}>
					<p>Scroll the page to watch the progress bar fill.</p>
					<Story />
				</div>
			);
		},
	],
};

export default meta;

type Story = StoryObj<typeof ScrollProgress>;

export const Default: Story = {
	args: {
		position: 'top',
		color: 'primary',
		height: '3px',
	},
};

export const Bottom: Story = {
	...Default,
	args: {
		...Default.args,
		position: 'bottom'
	}
};

export const Secondary: Story = {
	...Default,
	args: {
		...Default.args,
		color: 'secondary'
	}
};

export const Thick: Story = {
	...Default,
	args: {
		...Default.args,
		height: '6px'
	}
};
