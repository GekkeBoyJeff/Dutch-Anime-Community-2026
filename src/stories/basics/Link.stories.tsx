import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Link from '@/components/basics/Link';
import { LinkProps } from '@/lib/site/content/schema/basics/link';

const meta: Meta<typeof Link> = {
	title: 'Basics/Link',
	component: Link,
	parameters: {
		docs: {
			description: {
				component:
					'A text link. Built on Interactive, so `url` decides the element (next/link for an internal route, an external `<a>` with a safe rel for an http(s)/_blank url) — and it carries the `.link` styling. For an action use Button; for a link styled as a button, give Button a `url`.',
			},
		},
		jsonSchema: { schema: LinkProps },
	},
};

export default meta;

type Story = StoryObj<typeof Link>;

export const Default: Story = {
	args: {
		url: '/about',
		value: 'Read more about us',
	},
};

export const External: Story = {
	args: {
		...Default.args,
		url: 'https://example.com',
		target: '_blank',
		value: 'Open example.com',
	},
};

export const InText: Story = {
	...Default,
	decorators: [
		(Story) => (
			<p style={{ maxInlineSize: '40ch' }}>
				New here? <Story /> and come along to the next meet-up.
			</p>
		),
	],
};

export const Disabled: Story = {
	args: {
		...Default.args,
		disabled: true,
	},
};
