import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import CardGrid from '@/components/contentBlocks/CardGrid';
import { CardGridProps } from '@/lib/content/schema/blocks/cardGrid';
import { demoImage } from '@/stories/basics/Media.stories';

const articles = [
	{ id: 'a1', title: 'Getting started with the design system', excerpt: 'A tour of the tokens, primitives and blocks.', media: demoImage, tag: 'Guides', href: '#', publishedAt: '2026-05-02' },
	{ id: 'a2', title: 'Theming with colorsets', excerpt: 'How light and dark cascade without a colour prop.', media: demoImage, tag: 'Theming', href: '#', publishedAt: '2026-04-18' },
	{ id: 'a3', title: 'Writing accessible cards', excerpt: 'Whole-card links, focus order and reduced motion.', media: demoImage, tag: 'Accessibility', href: '#', publishedAt: '2026-03-09' },
	{ id: 'a4', title: 'Composing content blocks', excerpt: 'One registry, one schema, one page contract.', media: demoImage, tag: 'Guides', href: '#', publishedAt: '2026-02-21' },
];

const events = [
	{ id: 'e1', title: 'Spring meetup', summary: 'Talks, demos and an open mic.', media: demoImage, href: '#', startDate: '2026-04-12T18:00:00Z', endDate: '2026-04-12T21:00:00Z', location: 'Amsterdam', status: 'Free', category: 'meetup' },
	{ id: 'e2', title: 'Annual convention', summary: 'Two days of workshops and panels.', media: demoImage, href: '#', startDate: '2026-06-20T09:00:00Z', endDate: '2026-06-21T17:00:00Z', location: 'Utrecht', status: 'Sold out', category: 'convention' },
	{ id: 'e3', title: 'Online workshop', summary: 'Hands-on session, bring a laptop.', media: demoImage, href: '#', startDate: '2026-05-03T15:00:00Z', location: 'Online', category: 'workshop' },
	{ id: 'e4', title: 'Community drinks', summary: 'Casual hangout, no agenda.', media: demoImage, href: '#', startDate: '2026-03-28T19:30:00Z', location: 'Rotterdam', category: 'meetup' },
];

const links = [
	{ id: 'l1', url: '#', icon: 'search', title: 'Documentation', description: 'Guides, references and recipes.', cta: 'Read the docs' },
	{ id: 'l2', url: '#', icon: 'heart', title: 'Showcase', description: 'See what others have built.', cta: 'Browse projects' },
	{ id: 'l3', url: '#', icon: 'menu', title: 'Community', description: 'Join the discussion and get help.', cta: 'Say hello' },
];

const meta: Meta<typeof CardGrid> = {
	title: 'ContentBlocks/CardGrid',
	component: CardGrid,
	parameters: {
		docs: {
			description: {
				component:
					'One card grid for every card type. `variant` picks the card — article, event or link — and each variant asks for its own fields: an article has an excerpt and a publish date, an event a summary and an ISO start date, a link a URL and a CTA. Filter chips, search, sorting and pagination all come from the shared ItemCardGrid. In the builder the item fields reshape themselves when you switch variant.',
			},
		},
		jsonSchema: { schema: CardGridProps },
	},
	argTypes: {
		variant: { control: 'inline-radio', options: ['article', 'event', 'link'] },
		columns: { control: 'inline-radio', options: [1, 2, 3, 4] },
		cardSize: { control: 'inline-radio', options: ['compact', 'standard'] },
		colorset: { control: 'inline-radio', options: ['light', 'dark'] },
	},
};

export default meta;

type Story = StoryObj<typeof CardGrid>;

export const Articles: Story = {
	args: {
		variant: 'article',
		heading: { value: 'From the blog', tagline: 'Latest', intro: 'Stories, guides and release notes.' },
		items: articles,
		filterable: true,
		filterOptions: [
			{ label: 'Guides', value: 'Guides', count: 2 },
			{ label: 'Theming', value: 'Theming', count: 1 },
			{ label: 'Accessibility', value: 'Accessibility', count: 1 },
		],
		searchable: true,
		columns: 3,
	},
};

export const Events: Story = {
	args: {
		variant: 'event',
		heading: { value: 'Upcoming events', tagline: 'Agenda', intro: 'Filter, search and sort what’s coming up.' },
		items: events,
		filterable: true,
		filterOptions: [
			{ label: 'Meetups', value: 'meetup', count: 2 },
			{ label: 'Conventions', value: 'convention', count: 1 },
			{ label: 'Workshops', value: 'workshop', count: 1 },
		],
		sortOptions: [
			{ label: 'Soonest first', value: 'oldest' },
			{ label: 'Furthest ahead first', value: 'recent' },
		],
		searchable: true,
		columns: 2,
	},
};

export const Links: Story = {
	args: {
		variant: 'link',
		heading: { value: 'Where to next?', tagline: 'Navigate', intro: 'Pick a destination to keep exploring.' },
		items: links,
		columns: 3,
	},
};
