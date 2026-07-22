import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import WarningsTab from '@/components/dashboard/moderation/WarningsTab';

import { SUBJECT_ID, USER_ID } from '../../../../.storybook/mocks/fixtures';

const meta: Meta<typeof WarningsTab> = {
	title: 'Dashboard/Moderation/WarningsTab',
	component: WarningsTab,
	parameters: {
		docs: {
			description: {
				component:
					'Every warning on one profile in a `DataTable`: colour, reason, date and whether it is still active. Withdrawing is a soft action (`removed_at`), so a withdrawn warning stays visible as history. "Bewijs" opens the shared `EvidenceDrawer`. The rank rule that decides who may warn whom lives in RLS, not here — the buttons only decide what is offered.',
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

type Story = StoryObj<typeof WarningsTab>;

export const Default: Story = {};

export const AlleenLezen: Story = {
	name: 'Alleen-lezen',
	args: { canManage: false, canDelete: false },
};

export const Leeg: Story = {
	name: 'Zonder warnings',
	args: { subjectId: 'sub-0002' },
};
