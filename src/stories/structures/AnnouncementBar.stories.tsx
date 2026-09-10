import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import AnnouncementBar from '@/components/structures/AnnouncementBar';
import { AnnouncementBarProps } from '@/lib/site/content/schema/structures/announcementBar';

const meta: Meta<typeof AnnouncementBar> = {
	title: 'Structures/AnnouncementBar',
	component: AnnouncementBar,
	parameters: {
		layout: 'fullscreen',
		docs: { description: { component: 'Dismissible top-of-page banner with a message and optional CTA (a Button, ghost by default). It renders visible on the server and only hides once the client has read the dismissal, so there is no hydration mismatch; give it an `id` and the choice is remembered in localStorage under that key.' } },
		jsonSchema: { schema: AnnouncementBarProps },
	},
	argTypes: {
		variant: {
			control: 'inline-radio',
			options: ['info', 'success', 'warning', 'accent'],
		},
		dismissible: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof AnnouncementBar>;

export const Default: Story = {
	args: {
		message: 'We just shipped a new release — see what changed.',
		cta: { value: 'Read more', url: '/changelog', variant: 'ghost' },
		variant: 'info',
		dismissible: true,
	},
};

export const Success: Story = {
	...Default,
	args: {
		...Default.args,
		variant: 'success',
		message: 'Your changes have been saved.',
	},
};

export const Warning: Story = {
	...Default,
	args: {
		...Default.args,
		variant: 'warning',
		message: 'Scheduled maintenance this Sunday at 02:00.',
	},
};

export const Accent: Story = {
	...Default,
	args: {
		...Default.args,
		variant: 'accent',
		message: 'New here? Come say hi — the community is ready for you.',
	},
};

export const MessageOnly: Story = {
	...Default,
	args: {
		...Default.args,
		cta: undefined,
		dismissible: false,
	},
};

export const Persistent: Story = {
	...Default,
	args: {
		...Default.args,
		id: 'storybook-release-2026',
		message: 'Close me — I stay hidden on reload (remembered by id).',
	},
};
