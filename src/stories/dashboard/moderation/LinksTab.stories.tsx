import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import LinksTab from '@/components/dashboard/moderation/LinksTab';

import { SUBJECT_ID, USER_ID } from '../../../../.storybook/mocks/fixtures';

const meta: Meta<typeof LinksTab> = {
	title: 'Dashboard/Moderation/LinksTab',
	component: LinksTab,
	parameters: {
		docs: {
			description: {
				component:
					'Suspected alt accounts, one `Person` row per linked profile with the reason as its sub line. The status select moves a link between vermoed, bevestigd and afgewezen; only a confirmed link offers "Samenvoegen", which folds the other profile into this one without deleting anything. "Bewijs" opens the shared `EvidenceDrawer` against `mod_link_evidence`.',
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
	args: { subjectId: SUBJECT_ID, sessionUserId: USER_ID, canManage: true, canDelete: true },
};

export default meta;

type Story = StoryObj<typeof LinksTab>;

export const Default: Story = {};

export const AlleenLezen: Story = {
	name: 'Alleen-lezen',
	args: { canManage: false, canDelete: false },
};
