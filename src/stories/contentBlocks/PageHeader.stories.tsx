import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import PageHeader from '@/components/contentBlocks/PageHeader';

const meta: Meta<typeof PageHeader> = {
	title: 'ContentBlocks/PageHeader',
	component: PageHeader,
	parameters: {
		docs: { description: { component: 'Interior-page header assembling a breadcrumb, title, subtitle and an optional row of action buttons. A Server Component that only arranges existing primitives.' } },
	},
};

export default meta;

type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
	args: {
		title: 'Team settings',
		subtitle: 'Manage who has access to this workspace and what they can do.',
		breadcrumb: [
			{ label: 'Home', url: '/' },
			{ label: 'Settings', url: '/settings' },
			{ label: 'Team' },
		],
		actions: [
			{ label: 'Invite member', variant: 'primary' },
			{ label: 'Export', variant: 'secondary' },
		],
	},
};

export const TitleOnly: Story = {
	...Default,
	args: {
		...Default.args,
		breadcrumb: [],
		actions: [],
		subtitle: undefined,
	},
};

export const WithoutActions: Story = {
	...Default,
	args: {
		...Default.args,
		actions: [],
	},
};

export const WithoutBreadcrumb: Story = {
	...Default,
	args: {
		...Default.args,
		breadcrumb: [],
	},
};
