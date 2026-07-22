import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import TicketsTab from '@/components/dashboard/moderation/TicketsTab';

import { SUBJECT_ID, USER_ID } from '../../../../.storybook/mocks/fixtures';

const meta: Meta<typeof TicketsTab> = {
	title: 'Dashboard/Moderation/TicketsTab',
	component: TicketsTab,
	parameters: {
		docs: {
			description: {
				component:
					'Support tickets this profile takes part in, resolved through `ticket_participants`. Every row opens the read-only chat viewer; archiving and deleting fold into the row’s "⋯" menu (and its right-click menu) behind a confirm dialog. Uploading a new transcript opens `TicketUpload`.',
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

type Story = StoryObj<typeof TicketsTab>;

export const Default: Story = {};

export const AlleenLezen: Story = {
	name: 'Alleen-lezen',
	args: { canManage: false, canDelete: false },
};

export const Leeg: Story = {
	name: 'Zonder tickets',
	args: { subjectId: 'sub-0004' },
};
