import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ProfileList from '@/components/dashboard/moderation/ProfileList';

const meta: Meta<typeof ProfileList> = {
	title: 'Dashboard/Moderation/ProfileList',
	component: ProfileList,
	parameters: {
		docs: {
			description: {
				component:
					'The moderation entry screen. Every mod subject is one `Person` row — real accounts and shadow profiles alike — carrying its Discord id and, on the right, whether it has an account, whether it was merged away, and how many warnings of each colour are still active. Filter by kind or search by name or Discord id; `canManage` adds the shadow-profile drawer.',
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="inventory moderation">
				<Story />
			</div>
		),
	],
	args: { canManage: true },
};

export default meta;

type Story = StoryObj<typeof ProfileList>;

export const Default: Story = {};

export const AlleenLezen: Story = {
	name: 'Alleen-lezen',
	args: { canManage: false },
};
