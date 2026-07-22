import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ProfileDetail from '@/components/dashboard/moderation/ProfileDetail';

import { SUBJECT_ID, USER_ID } from '../../../../.storybook/mocks/fixtures';

const meta: Meta<typeof ProfileDetail> = {
	title: 'Dashboard/Moderation/ProfileDetail',
	component: ProfileDetail,
	parameters: {
		docs: {
			description: {
				component:
					'One moderation profile: the header with its account/shadow badges, the "Betrokkenen" context strip, and five tabs. Signalen opens first because warnings are what a moderator comes for. Aliases, conduct notes and attendance are `Entry` lists, the activity log is a `Moment` timeline, and each `Section` shares one eyebrow header so the stacked blocks read as a single rhythm.',
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
	args: {
		subjectId: SUBJECT_ID,
		sessionUserId: USER_ID,
		canManage: true,
		canDelete: true,
		canBadges: true,
		canEditProfile: true,
	},
};

export default meta;

type Story = StoryObj<typeof ProfileDetail>;

export const Default: Story = {};

export const AlleenLezen: Story = {
	name: 'Alleen-lezen',
	args: { canManage: false, canDelete: false, canBadges: false, canEditProfile: false },
};

export const Onbekend: Story = {
	name: 'Niet gevonden',
	args: { subjectId: 'sub-9999' },
};
