import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Button from '@/components/basics/Button';
import LightboxTrigger from '@/components/components/LightboxTrigger';
import { LightboxTriggerProps } from '@/lib/content/schema/components/lightboxTrigger';

const meta: Meta<typeof LightboxTrigger> = {
	title: 'Components/LightboxTrigger',
	component: LightboxTrigger,
	parameters: {
		docs: { description: { component: 'Opens the shared VideoLightbox from any clickable: the child render-prop receives the open callback, so a Button (or Pill, or a whole card) becomes a lightbox trigger without owning dialog state. The media fields are VideoLightbox\'s — an embed (provider + embedId) or a native video (src).' } },
		jsonSchema: { schema: LightboxTriggerProps },
	},
};

export default meta;

type Story = StoryObj<typeof LightboxTrigger>;

export const Default: Story = {
	args: {
		provider: 'youtube',
		embedId: 'dQw4w9WgXcQ',
		title: 'Aftermovie meetup',
	},
	render: function Render(args) {
		return (
			<LightboxTrigger {...args}>
				{(open) => (
					<Button icon="play" onClick={open}>
						Bekijk de aftermovie
					</Button>
				)}
			</LightboxTrigger>
		);
	},
};

export const NativeVideo: Story = {
	args: {
		src: '/media/demo.mp4',
		title: 'Sfeerimpressie',
	},
	render: function Render(args) {
		return (
			<LightboxTrigger {...args}>
				{(open) => (
					<Button variant="secondary" icon="play" onClick={open}>
						Bekijk de video
					</Button>
				)}
			</LightboxTrigger>
		);
	},
};
