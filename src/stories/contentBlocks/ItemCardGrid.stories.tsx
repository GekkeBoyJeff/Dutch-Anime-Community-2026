import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ItemCardGrid from '@/components/contentBlocks/ItemCardGrid';
import { demoImage } from '@/stories/basics/Media.stories';

const articleItems = [
	{ id: 'a1', title: 'Getting started with the design system', text: 'A tour of the tokens, primitives and blocks.', media: demoImage, tag: 'Guides', category: 'guides', startDate: '2026-05-02' },
	{ id: 'a2', title: 'Theming with colorsets', text: 'How light and dark cascade without a colour prop.', media: demoImage, tag: 'Theming', category: 'theming', startDate: '2026-04-18' },
	{ id: 'a3', title: 'Writing accessible cards', text: 'Whole-card links, focus order and reduced motion.', media: demoImage, tag: 'A11y', category: 'a11y', startDate: '2026-03-09' },
	{ id: 'a4', title: 'Composing content blocks', text: 'One registry, one schema, one page contract.', media: demoImage, tag: 'Guides', category: 'guides', startDate: '2026-02-21' },
];

const meta: Meta<typeof ItemCardGrid> = {
	title: 'ContentBlocks/ItemCardGrid',
	component: ItemCardGrid,
	parameters: {
		docs: { description: { component: 'The generalised, filterable card grid every typed grid shares. Holds the active filter, search query and page in local state and derives the visible slice with useMemo. A client island that the typed wrappers feed plain data.' } },
	},
	argTypes: {
		variant: { control: 'inline-radio', options: ['article', 'event', 'link'] },
		columns: { control: 'inline-radio', options: [1, 2, 3, 4] },
		cardSize: { control: 'inline-radio', options: ['compact', 'standard'] },
		colorset: { control: 'inline-radio', options: ['light', 'dark'] },
	},
};

export default meta;

type Story = StoryObj<typeof ItemCardGrid>;

export const Default: Story = {
	args: {
		variant: 'article',
		heading: { value: 'From the blog', tagline: 'Latest', intro: 'Filter, search and sort the writing.' },
		items: articleItems,
		categories: [
			{ label: 'Guides', value: 'guides', count: 2 },
			{ label: 'Theming', value: 'theming', count: 1 },
			{ label: 'Accessibility', value: 'a11y', count: 1 },
		],
		searchable: true,
		sortOptions: [
			{ label: 'Newest', value: 'recent' },
			{ label: 'Oldest', value: 'oldest' },
			{ label: 'Title', value: 'title' },
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

export const PlainList: Story = {
	...Default,
	args: {
		...Default.args,
		categories: [],
		searchable: false,
		sortOptions: [],
	},
};

export const LinkVariant: Story = {
	...Default,
	args: {
		...Default.args,
		variant: 'link',
		heading: { value: 'Where to next?', tagline: 'Navigate' },
		items: [
			{ id: 'l1', title: 'Documentation', text: 'Guides, references and recipes.', href: '#' },
			{ id: 'l2', title: 'Showcase', text: 'See what others built.', href: '#' },
			{ id: 'l3', title: 'Community', text: 'Join the discussion.', href: '#' },
		],
		categories: [],
		searchable: false,
		sortOptions: [],
	},
};
