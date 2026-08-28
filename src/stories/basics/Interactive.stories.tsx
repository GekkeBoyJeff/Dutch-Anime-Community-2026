import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Interactive from '@/components/basics/Interactive';
import { InteractiveProps } from '@/lib/site/content/schema/basics/interactive';

const meta: Meta<typeof Interactive> = {
	title: 'Basics/Interactive',
	component: Interactive,
	parameters: {
		docs: {
			description: {
				component:
					'The one definition of "clickable": resolves to a `<button>` when there is no url, next/link for an internal route, or an external `<a>` (with a safe rel) for an http(s)/_blank url — and fires haptic feedback on every enabled click. Button, Link and Pill are thin wrappers over it.',
			},
		},
		jsonSchema: { schema: InteractiveProps },
	},
};

export default meta;

type Story = StoryObj<typeof Interactive>;

export const Default: Story = {
	args: {
		children: 'Join now',
	},
};

export const InternalLink: Story = {
	args: {
		...Default.args,
		url: '/join',
		children: 'Go to the community',
	},
};

export const ExternalLink: Story = {
	args: {
		...Default.args,
		url: 'https://example.com',
		target: '_blank',
		children: 'Open example.com',
	},
};

export const Disabled: Story = {
	args: {
		...Default.args,
		disabled: true,
	},
};
