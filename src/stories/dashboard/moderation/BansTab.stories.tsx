import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import BansTab from '@/components/dashboard/moderation/BansTab';

import { SUBJECT_ID, USER_ID } from '../../../../.storybook/mocks/fixtures';

const meta: Meta<typeof BansTab> = {
	title: 'Dashboard/Moderation/BansTab',
	component: BansTab,
	parameters: {
		docs: {
			description: {
				component:
					'The "Acties" tab: bans on one profile, with their scope (Discord, conventie or site), reason, issue date and expiry. An empty expiry means permanent. Lifting a ban keeps the row and marks it as withdrawn, so the history stays readable.',
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

type Story = StoryObj<typeof BansTab>;

export const Default: Story = {};

export const AlleenLezen: Story = {
	name: 'Alleen-lezen',
	args: { canManage: false },
};

export const Leeg: Story = {
	name: 'Zonder bans',
	args: { subjectId: 'sub-0002' },
};
