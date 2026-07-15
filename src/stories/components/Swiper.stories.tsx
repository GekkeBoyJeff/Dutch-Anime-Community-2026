import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Swiper from '@/components/components/Swiper';
import { SwiperProps } from '@/lib/content/schema/components/swiper';
import { demoImage } from '@/stories/basics/Media.stories';

const meta: Meta<typeof Swiper> = {
	title: 'Components/Swiper',
	component: Swiper,
	parameters: {
		docs: {
			description: {
				component:
					'Pointer/keyboard content swiper. The Embla viewport is the client island; each slide is plain Media markup with optional caption. Prev/next + counter come from the Embla API, and a video slide opens the shared VideoLightbox.',
			},
		},
		jsonSchema: { schema: SwiperProps },
	},
	argTypes: {
		ratio: { control: 'text' },
		rounded: { control: 'inline-radio', options: ['s', 'm', 'l', 'xl', 'full'] },
		showCounter: { control: 'boolean' },
		loop: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof Swiper>;

export const Default: Story = {
	args: {
		ratio: '16 / 9',
		rounded: 'm',
		showCounter: true,
		loop: false,
		slides: [
			{ image: demoImage.src, alt: 'Slide een', title: 'Eerste slide', description: 'Een korte ondertitel.' },
			{ image: demoImage.src, alt: 'Slide twee', title: 'Tweede slide', description: 'Nog een ondertitel.' },
			{ image: demoImage.src, alt: 'Slide drie', title: 'Derde slide' },
		],
	},
};

export const Looping: Story = {
	...Default,
	args: {
		...Default.args,
		loop: true
	}
};

export const Linked: Story = {
	...Default,
	args: {
		...Default.args,
		slides: [
			{ image: demoImage.src, alt: 'Slide een', title: 'Naar de homepage', link: '/' },
			{ image: demoImage.src, alt: 'Slide twee', title: 'Naar de blog', link: '/blog' },
		],
	},
};

export const WithVideoSlide: Story = {
	...Default,
	args: {
		...Default.args,
		slides: [
			{ image: demoImage.src, alt: 'Slide een', title: 'Afbeelding' },
			{ image: demoImage.src, alt: 'Videoposter', title: 'Bekijk de video', provider: 'youtube', embedId: 'dQw4w9WgXcQ' },
		],
	},
};

export const NoCounter: Story = {
	...Default,
	args: {
		...Default.args,
		showCounter: false
	}
};
