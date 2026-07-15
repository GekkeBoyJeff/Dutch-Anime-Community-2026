import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import type { ComponentProps } from 'react';

import VideoLightbox from '@/components/components/VideoLightbox';
import { VideoLightboxProps } from '@/lib/content/schema/components/videoLightbox';
import { demoVideo } from '@/stories/basics/Media.stories';

const meta: Meta<typeof VideoLightbox> = {
	title: 'Components/VideoLightbox',
	component: VideoLightbox,
	parameters: {
		docs: {
			description: {
				component:
					'Fullscreen media overlay for an embed or native video, routed through the shared Media primitive. The player stays mounted until the close transition ends; TikTok is forced to a 9:16 frame.',
			},
		},
		jsonSchema: { schema: VideoLightboxProps },
	},
	argTypes: {
		provider: { control: 'inline-radio', options: [undefined, 'youtube', 'vimeo', 'tiktok'] },
		embedId: { control: 'text' },
		src: { control: 'text' },
		title: { control: 'text' },
	},
	// Trigger wrapper so the controlled open/close is exercised; args pass through for live Controls.
	render: function Render(args: Partial<ComponentProps<typeof VideoLightbox>>) {
		const [open, setOpen] = useState(false);

		return (
			<>
				<button type="button" onClick={() => setOpen(true)}>
					Bekijk video
				</button>
				<VideoLightbox {...args} open={open} onClose={() => setOpen(false)} />
			</>
		);
	},
};

export default meta;

type Story = StoryObj<typeof VideoLightbox>;

export const Default: Story = {
	args: {
		provider: 'youtube',
		embedId: 'dQw4w9WgXcQ',
		title: 'Voorbeeldvideo',
	},
};

export const TikTokPortrait: Story = {
	...Default,
	args: { ...Default.args, provider: 'tiktok', embedId: '7106594312292453675' },
};

export const NativeVideo: Story = {
	...Default,
	args: { ...Default.args, provider: undefined, embedId: undefined, src: demoVideo.src },
};
