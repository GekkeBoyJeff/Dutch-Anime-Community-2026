import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import EmbedWidget from '@/components/components/EmbedWidget';
import { EmbedWidgetProps } from '@/lib/content/schema/components/embedWidget';

const meta: Meta<typeof EmbedWidget> = {
	title: 'Components/EmbedWidget',
	component: EmbedWidget,
	parameters: {
		docs: {
			description: {
				component:
					'Self-contained responsive third-party embed: a provider id (reusing Media’s embed map) or a raw iframe URL, framed at a fixed aspect ratio with an optional heading and caption. A Server Component; the iframe lazy-loads.',
			},
		},
		jsonSchema: { schema: EmbedWidgetProps },
	},
	argTypes: {
		provider: { control: 'inline-radio', options: ['youtube', 'vimeo', 'tiktok'] },
		ratio: { control: 'text' },
		title: { control: 'text' },
		caption: { control: 'text' },
	},
};

export default meta;

type Story = StoryObj<typeof EmbedWidget>;

export const Default: Story = {
	args: {
		title: 'Watch the trailer',
		provider: 'youtube',
		embedId: 'dQw4w9WgXcQ',
		ratio: '16 / 9',
		caption: 'Official trailer, 2 min.',
	},
};

export const RawIframe: Story = {
	...Default,
	args: {
		...Default.args,
		provider: undefined,
		embedId: undefined,
		src: 'https://www.openstreetmap.org/export/embed.html?bbox=4.88,52.36,4.92,52.38&layer=mapnik',
		title: 'Find us on the map',
		caption: 'Our venue in Amsterdam.',
		ratio: '4 / 3',
	},
};

export const CustomChild: Story = {
	...Default,
	args: { ...Default.args, provider: undefined, embedId: undefined, src: undefined, title: 'Custom widget', caption: undefined },
	render: (args) => (
		<EmbedWidget {...args}>
			<div style={{ display: 'grid', placeItems: 'center', inlineSize: '100%', blockSize: '100%' }}>
				Any script-based widget renders here.
			</div>
		</EmbedWidget>
	),
};
