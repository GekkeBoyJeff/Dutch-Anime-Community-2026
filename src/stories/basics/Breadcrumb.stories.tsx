import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Breadcrumb from '@/components/basics/Breadcrumb';
import { BreadcrumbProps } from '@/lib/content/schema/basics/breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
	title: 'Basics/Breadcrumb',
	component: Breadcrumb,
	parameters: {
		docs: { description: { component: 'Accessible trail (nav > ol) that links every crumb but the last, which is marked aria-current="page".' } },
		jsonSchema: { schema: BreadcrumbProps },
	},
};

export default meta;

type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
	args: {
		items: [
			{ label: 'Home', url: '/' },
			{ label: 'Events', url: '/events' },
			{ label: 'Spring meetup' },
		],
		separator: '/',
	},
};

export const ChevronSeparator: Story = {
	...Default,
	args: {
		...Default.args,
		separator: '›',
	},
};
