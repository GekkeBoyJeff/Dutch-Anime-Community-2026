import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import NotesTab from '@/components/dashboard/moderation/NotesTab';

import { SUBJECT_ID, USER_ID } from '../../../../.storybook/mocks/fixtures';

const meta: Meta<typeof NotesTab> = {
	title: 'Dashboard/Moderation/NotesTab',
	component: NotesTab,
	parameters: {
		docs: {
			description: {
				component:
					'Internal moderation notes for one profile, as an `Entry` list: the note itself is the main line, the timestamp the sub line, and archiving sits in the trailing slot. Archived notes drop out of the query, so the list only ever shows what still stands. Without `canManage` it is a read-only log.',
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

type Story = StoryObj<typeof NotesTab>;

export const Default: Story = {};

export const AlleenLezen: Story = {
	name: 'Alleen-lezen',
	args: { canManage: false },
};

export const Leeg: Story = {
	name: 'Zonder notities',
	args: { subjectId: 'sub-0002' },
};
