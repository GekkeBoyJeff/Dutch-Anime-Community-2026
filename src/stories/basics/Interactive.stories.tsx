import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Interactive from '@/components/basics/Interactive';
import { InteractiveProps } from '@/lib/content/schema/basics/interactive';

const meta: Meta<typeof Interactive> = {
	title: 'Basics/Interactive',
	component: Interactive,
	parameters: {
		docs: {
			description: {
				component:
					'The one definition of "clickable": resolves to a `<button>` when there is no url, next/link for an internal route, or an external `<a>` (with a safe rel) for an http(s)/_blank url — and fires haptic feedback on every enabled click. Button and Pill are thin wrappers over it.',
			},
		},
		jsonSchema: { schema: InteractiveProps },
	},
};

export default meta;

type Story = StoryObj<typeof Interactive>;

export const Default: Story = {
	args: {
		children: 'Word lid',
	},
};

export const InternalLink: Story = {
	...Default,
	args: {
		...Default.args,
		url: '/community',
		children: 'Naar de community',
	},
};

export const ExternalLink: Story = {
	...Default,
	args: {
		...Default.args,
		url: 'https://discord.gg/dutchanimecommunity',
		target: '_blank',
		children: 'Join onze Discord',
	},
};

export const Disabled: Story = {
	...Default,
	args: {
		...Default.args,
		disabled: true,
	},
};
