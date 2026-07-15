import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import LogoCloud from '@/components/contentBlocks/LogoCloud';
import { LogoCloudProps } from '@/lib/content/schema/blocks/logoCloud';
import { demoImage } from '@/stories/basics/Media.stories';

const logos = [
	{ id: 'l1', name: 'Abunai!', logo: '/media/logos/abunai.svg', href: 'https://example.com/' },
	{ id: 'l2', name: 'Dutch Comic Con', logo: '/media/logos/dutch-comic-con.svg' },
	{ id: 'l3', name: 'Heroes Made in Asia', logo: demoImage.src },
	{ id: 'l4', name: 'AnimeCon', logo: demoImage.src },
];

const meta: Meta<typeof LogoCloud> = {
	title: 'ContentBlocks/LogoCloud',
	component: LogoCloud,
	parameters: {
		docs: { description: { component: 'A customer/partner logo strip. `grid` wraps the logos in a row; `marquee` scrolls them in a continuous CSS loop. No JS; grayscale-on-rest hover. Server Component.' } },
		jsonSchema: { schema: LogoCloudProps },
	},
	argTypes: {
		variant: {
			control: 'inline-radio',
			options: ['grid', 'marquee'],
		},
		colorset: {
			control: 'inline-radio',
			options: ['light', 'dark'],
		},
	},
};

export default meta;

type Story = StoryObj<typeof LogoCloud>;

export const Default: Story = {
	args: {
		heading: { value: 'Je vindt ons op deze events' },
		items: logos,
		variant: 'grid',
	},
};

export const Marquee: Story = {
	...Default,
	args: {
		...Default.args,
		variant: 'marquee',
	},
};
