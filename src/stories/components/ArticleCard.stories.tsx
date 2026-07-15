import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ArticleCard from '@/components/components/ArticleCard';
import { ArticleCardProps } from '@/lib/content/schema/components/articleCard';
import { demoImage } from '@/stories/basics/Media.stories';

const meta: Meta<typeof ArticleCard> = {
	title: 'Components/ArticleCard',
	component: ArticleCard,
	parameters: {
		docs: {
			description: {
				component:
					'Editorial card for blog/news: lead media, topic tag, headline, excerpt and a byline with avatar, date and read time. A Server Component, whole-card-clickable via a stretched link.',
			},
		},
		jsonSchema: { schema: ArticleCardProps },
	},
	argTypes: {
		layout: {
			control: 'inline-radio',
			options: ['vertical', 'horizontal', 'feature'],
		},
	},
};

export default meta;

type Story = StoryObj<typeof ArticleCard>;

export const Default: Story = {
	args: {
		title: 'Terugblik: de DAC-stand op Dutch Comic Con',
		excerpt: 'Twee dagen vol cosplay, spontane meetups en nieuwe gezichten — zo gezellig was onze stand dit voorjaar in de Jaarbeurs.',
		tag: 'Terugblik',
		readTime: 4,
		publishedAt: '2026-03-30',
		href: '/community',
		layout: 'vertical',
		media: { type: 'image', src: '/media/dac-stand.jpg', alt: 'Bezoekers bij de DAC-stand op Dutch Comic Con', ratio: '16/9' },
		author: { name: 'Sanne Bakker', role: 'Moderator', avatar: demoImage.src },
	},
};

export const Horizontal: Story = {
	...Default,
	args: {
		...Default.args,
		layout: 'horizontal'
	}
};

export const Feature: Story = {
	...Default,
	args: {
		...Default.args,
		layout: 'feature'
	}
};

export const NoImage: Story = {
	...Default,
	args: {
		...Default.args,
		media: undefined
	}
};

export const NoAuthor: Story = {
	...Default,
	args: {
		...Default.args,
		author: undefined
	}
};
