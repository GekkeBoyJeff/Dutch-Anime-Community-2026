import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Uploader from '@/components/dashboard/upload/Uploader';

const meta: Meta<typeof Uploader> = {
	title: 'Dashboard/Upload/Uploader',
	component: Uploader,
	globals: { role: 'author' },
	parameters: {
		docs: {
			description: {
				component:
					'The media manager: a drop zone that compresses images to webp before upload, and the `media` bucket as a grid. Each file carries a usage badge — a file used on a page cannot be deleted. Requires `media.manage`, so it renders under **Auteur** (or Beheerder). Uploading is inert here: the storage stand-in accepts the file but the grid keeps showing the fixture bucket.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof Uploader>;

export const Default: Story = {};
