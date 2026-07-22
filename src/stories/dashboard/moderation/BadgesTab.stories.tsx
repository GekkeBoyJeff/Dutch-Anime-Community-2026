import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import BadgesTab from '@/components/dashboard/moderation/BadgesTab';

import { SUBJECT_ID, USER_ID } from '../../../../.storybook/mocks/fixtures';

const meta: Meta<typeof BadgesTab> = {
	title: 'Dashboard/Moderation/BadgesTab',
	component: BadgesTab,
	parameters: {
		docs: {
			description: {
				component:
					'Badges awarded to one profile, as a grid of `BadgeCard`s. Gated on `badges.manage` rather than on moderation itself, because awarding is a reward flow that happens to live on the profile. Badge images sit in the public badges bucket; withdrawing archives the row instead of deleting it.',
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
	args: { subjectId: SUBJECT_ID, sessionUserId: USER_ID, canManage: true },
};

export default meta;

type Story = StoryObj<typeof BadgesTab>;

export const Default: Story = {};

export const AlleenLezen: Story = {
	name: 'Alleen-lezen',
	args: { canManage: false },
};

export const Leeg: Story = {
	name: 'Zonder badges',
	args: { subjectId: 'sub-0002' },
};
