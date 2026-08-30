import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Media from '@/components/basics/Media';
import type { Media as MediaData } from '@/lib/site/content';
import { MediaProps } from '@/lib/site/content/schema/basics/media';
import { MediaProvider } from '@/lib/site/content/schema/primitives';

// Media is the home for shared demo media: defined and exported here, imported by other stories as
// `{ demoImage, demoVideo }` — spread to override alt/ratio, or read `.src` for a bare URL. They're listed
// in `excludeStories` (meta below) so Storybook doesn't treat them as stories. One local asset
// (1600×1200, 4:3, optimised by the build pipeline) + its video — one source of truth, reused everywhere.
// `alt` lives here too, so a story spreads the whole object and INHERITS it (`{ ...demoImage, caption: '…' }`)
// instead of re-declaring alt per item. `satisfies` (not a `: MediaData` annotation) keeps `.src` a concrete
// string for the stories that read it as a bare URL (the annotation would widen it to `string | undefined`).
export const demoImage = { type: 'image' as const, src: '/media/demo.png', alt: 'Demo image' } satisfies MediaData;
export const demoVideo = { type: 'video' as const, src: '/media/demo.mp4', alt: 'Demo video' } satisfies MediaData;

const meta: Meta<typeof Media> = {
	title: 'Basics/Media',
	component: Media,
	// The exported demo fixtures above are shared data, not stories — keep them out of the story list.
	excludeStories: ['demoImage', 'demoVideo'],
	parameters: {
		docs: {
			description: {
				component:
					'A native image (`<picture>` + a build-time `webp` `srcset`, no next/image), video or embed inside a fixed-ratio frame, with an optional caption and credit. The figure is fluid and responsive by default — it takes the width its parent gives it and the browser fetches the smallest variant that fits. `ratio` sets the frame’s aspect ratio; `mode` chooses `fill` (cover — crops to fill) or `fit` (contain — letterboxes the whole asset). The asset always stays inside its box.',
			},
		},
		jsonSchema: { schema: MediaProps },
	},
	argTypes: {
		type: { control: 'inline-radio', options: ['image', 'video', 'embed'] },
		mode: { control: 'inline-radio', options: ['fill', 'fit'] },
		ratio: { control: 'text' },
		sizes: {
			control: 'text',
			description: 'How wide the image renders, so the browser fetches the smallest fitting variant: a CSS sizes string (`"50vw"`) or a per-breakpoint map in code (`{ base: "100vw", m: "50vw" }`). Optional — responsive by default.',
		},
		provider: { control: 'inline-radio', options: [undefined, ...MediaProvider.options] },
	},
	// Media is fluid (it fills its parent); this only keeps the demos a comfortable size — it is not part
	// of the component. Resize the Storybook viewport to watch the figure scale with its parent.
	decorators: [
		(Story) => (
			<div style={{ maxInlineSize: '480px' }}>
				<Story />
			</div>
		),
	],
};

export default meta;

type Story = StoryObj<typeof Media>;

export const Default: Story = {
	args: {
		...demoImage,
		mode: 'fill',
		ratio: '16 / 9',
	},
};

export const Contain: Story = {
	...Default,
	args: {
		...Default.args,
		mode: 'fit',
	},
};

export const Square: Story = {
	...Default,
	args: {
		...Default.args,
		ratio: '1 / 1',
	},
};

export const Portrait: Story = {
	...Default,
	args: {
		...Default.args,
		ratio: '3 / 4',
	},
};

export const Wide: Story = {
	...Default,
	args: {
		...Default.args,
		ratio: '21 / 9',
	},
};

export const WithCaption: Story = {
	...Default,
	args: {
		...Default.args,
		caption: 'A wide shot of the meetup hall, taken from the balcony',
		credit: '© Example Studio',
	},
};

// The shared demoImage doesn't fit here: 'plain' is for an asset without a manifest entry (an SVG
// logo), which is also why width/height are given by hand — without them the SVG shifts the layout.
export const Plain: Story = {
	args: {
		type: 'image',
		src: '/media/dac-logo.svg',
		alt: 'DAC logo',
		variant: 'plain',
		width: 160,
		height: 60,
	},
};

export const Video: Story = {
	...Default,
	args: {
		...Default.args,
		...demoVideo,
	},
};

export const Embed: Story = {
	...Default,
	args: {
		...Default.args,
		type: 'embed',
		provider: 'youtube',
		embedId: 'dQw4w9WgXcQ',
		caption: 'A YouTube embed',
	},
};
