import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import TextMedia from '@/components/contentBlocks/TextMedia';
import { TextMediaProps } from '@/lib/content/schema/blocks/textMedia';

const meta: Meta<typeof TextMedia> = {
	title: 'ContentBlocks/TextMedia',
	component: TextMedia,
	parameters: {
		docs: { description: { component: 'Text next to media in two columns (stacked on mobile); reverse swaps the order.' } },
		jsonSchema: { schema: TextMediaProps },
	},
	argTypes: {
		colorset: {
			control: 'inline-radio',
			options: ['light', 'dark'],
		},
	},
};

export default meta;

type Story = StoryObj<typeof TextMedia>;

export const Default: Story = {
	args: {
		reverse: false,
		title: 'Featured',
		text: 'Text next to media; stacked on mobile, two columns from the m breakpoint up.',
		media: {
			type: 'embed',
			provider: 'youtube',
			embedId: 'dQw4w9WgXcQ',
			caption: 'Promo trailer',
		},
	},
};

export const Reversed: Story = {
	...Default,
	args: {
		...Default.args,
		reverse: true,
	},
};
