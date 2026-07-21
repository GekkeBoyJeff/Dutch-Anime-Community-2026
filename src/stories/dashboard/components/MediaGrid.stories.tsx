import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import MediaGrid, { type MediaGridItem } from '@/components/dashboard/components/MediaGrid';
import { demoImage } from '@/stories/basics/Media.stories';

const meta: Meta<typeof MediaGrid> = {
	title: 'Dashboard/Components/MediaGrid',
	component: MediaGrid,
	parameters: {
		docs: {
			description: {
				component:
					'Fixed aspect-ratio media grid: reserves each cell before the image (or skeleton) decodes, so the grid never reflows on load. Presentational — the caller (Uploader) resolves storage URLs and precomputes each item\'s usage badge.',
			},
		},
	},
	args: { onSelect: () => {} },
};

export default meta;

type Story = StoryObj<typeof MediaGrid>;

const items: MediaGridItem[] = [
	{ name: 'hero.webp', url: demoImage.src, mimetype: 'image/webp', badge: { variant: 'info', label: 'In gebruik (2 pagina\'s)' } },
	{ name: 'oud-logo.png', url: demoImage.src, mimetype: 'image/png', badge: { variant: 'warning', label: 'Ongebruikt (30+ dagen)' } },
	{ name: 'reglement.pdf', url: '#', mimetype: 'application/pdf', badge: { variant: 'neutral', label: 'Ongebruikt' } },
];

export const Default: Story = {
	args: { items },
};

export const Loading: Story = {
	args: { items: null },
};

export const Empty: Story = {
	name: 'Leeg',
	args: { items: [] },
};

export const PdfItem: Story = {
	name: 'Pdf-item',
	args: { items: [items[2]!] },
};

export const InUseVsUnused: Story = {
	name: 'In-gebruik-vs-ongebruikt',
	args: { items: [items[0]!, items[1]!] },
};
