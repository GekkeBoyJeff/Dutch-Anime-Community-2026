import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Link from '@/components/basics/Link';
import { LinkProps } from '@/lib/content/schema/basics/link';

const meta: Meta<typeof Link> = {
	title: 'Basics/Link',
	component: Link,
	parameters: {
		docs: {
			description: {
				component:
					'A text link. Built on Interactive, so `url` decides the element (next/link for an internal route, an external `<a>` with a safe rel for an http(s)/_blank url) — and it carries the `.link` styling. For an action use Button; for a link styled as a button, put the `button` class on Interactive instead.',
			},
		},
		jsonSchema: { schema: LinkProps },
	},
};

export default meta;

type Story = StoryObj<typeof Link>;

export const Default: Story = {
	args: {
		url: '/community',
		children: 'Lees meer over de community',
	},
};

export const External: Story = {
	...Default,
	args: {
		...Default.args,
		url: 'https://discord.gg/dutchanimecommunity',
		target: '_blank',
		children: 'Join onze Discord',
	},
};

// Inline in a sentence — the link sits in the text flow (not as a block).
export const InText: Story = {
	...Default,
	render: (args) => (
		<p style={{ maxInlineSize: '40ch' }}>
			Nieuw hier? <Link {...args} /> en kom eens langs op een spelletjesmiddag.
		</p>
	),
};

export const Disabled: Story = {
	...Default,
	args: {
		...Default.args,
		disabled: true,
	},
};
