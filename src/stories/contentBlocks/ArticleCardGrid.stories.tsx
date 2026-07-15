import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ArticleCardGrid from '@/components/contentBlocks/ArticleCardGrid';
import { ArticleCardGridProps } from '@/lib/content/schema/blocks/articleCardGrid';
import { demoImage } from '@/stories/basics/Media.stories';

const articles = [
	{ id: 'a1', title: 'Getting started with the design system', excerpt: 'A tour of the tokens, primitives and blocks.', media: demoImage, tag: 'Guides', href: '#', publishedAt: '2026-05-02' },
	{ id: 'a2', title: 'Theming with colorsets', excerpt: 'How light and dark cascade without a colour prop.', media: demoImage, tag: 'Theming', href: '#', publishedAt: '2026-04-18' },
	{ id: 'a3', title: 'Writing accessible cards', excerpt: 'Whole-card links, focus order and reduced motion.', media: demoImage, tag: 'Accessibility', href: '#', publishedAt: '2026-03-09' },
	{ id: 'a4', title: 'Composing content blocks', excerpt: 'One registry, one schema, one page contract.', media: demoImage, tag: 'Guides', href: '#', publishedAt: '2026-02-21' },
];

const meta: Meta<typeof ArticleCardGrid> = {
	title: 'ContentBlocks/ArticleCardGrid',
	component: ArticleCardGrid,
	parameters: {
		docs: { description: { component: 'Article-listing card grid: maps articles onto the shared filterable ItemCardGrid with the article card variant. Filter chips, search, sorting and pagination all come from the generic internal.' } },
		jsonSchema: { schema: ArticleCardGridProps },
	},
	argTypes: {
		columns: { control: 'inline-radio', options: [2, 3, 4] },
		colorset: { control: 'inline-radio', options: ['light', 'dark'] },
	},
};

export default meta;

type Story = StoryObj<typeof ArticleCardGrid>;

export const Default: Story = {
	args: {
		heading: { value: 'From the blog', tagline: 'Latest', intro: 'Stories, guides and release notes.' },
		articles,
		filterable: true,
		filterOptions: [
			{ label: 'Guides', value: 'Guides', count: 2 },
			{ label: 'Theming', value: 'Theming', count: 1 },
			{ label: 'Accessibility', value: 'Accessibility', count: 1 },
		],
		searchable: true,
		sortOptions: [
			{ label: 'Newest', value: 'recent' },
			{ label: 'Oldest', value: 'oldest' },
		],
		columns: 3,
	},
};

export const Paginated: Story = {
	...Default,
	args: {
		...Default.args,
		pageSize: 2,
	},
};

export const Plain: Story = {
	...Default,
	args: {
		...Default.args,
		filterable: false,
		searchable: false,
		sortOptions: [],
	},
};
