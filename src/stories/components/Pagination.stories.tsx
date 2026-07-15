import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Pagination from '@/components/components/Pagination';
import { PaginationProps } from '@/lib/content/schema/components/pagination';

const meta: Meta<typeof Pagination> = {
	title: 'Components/Pagination',
	component: Pagination,
	parameters: {
		docs: {
			description: {
				component:
					'Page navigation with prev/next, optional edge jumps and an ellipsis-truncated page list. The range math lives in usePagination; a client island wires the active page to onPageChange.',
			},
		},
		jsonSchema: { schema: PaginationProps },
	},
	argTypes: {
		totalPages: { control: 'number' },
		siblingCount: { control: 'number' },
		boundaryCount: { control: 'number' },
		type: { control: 'inline-radio', options: ['button', 'link'] },
		withControls: { control: 'boolean' },
		withEdges: { control: 'boolean' },
		disabled: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
	args: {
		totalPages: 10,
		defaultPage: 1,
		siblingCount: 1,
		boundaryCount: 1,
		type: 'button',
		withControls: true,
		withEdges: false,
	},
};

export const WithEdges: Story = {
	...Default,
	args: {
		...Default.args,
		withEdges: true
	}
};

export const ManyPages: Story = {
	...Default,
	args: {
		...Default.args,
		totalPages: 24,
		defaultPage: 12,
		withEdges: true
	}
};

export const FromItemCount: Story = {
	...Default,
	args: {
		...Default.args,
		totalPages: undefined,
		count: 137,
		pageSize: 10
	}
};

export const AsLinks: Story = {
	...Default,
	args: {
		...Default.args,
		type: 'link',
		getPageUrl: ({ page }) => `?page=${page}`,
	},
};

export const Disabled: Story = {
	...Default,
	args: {
		...Default.args,
		disabled: true,
		defaultPage: 3
	}
};

export const FewPages: Story = {
	...Default,
	args: {
		...Default.args,
		totalPages: 3
	}
};
