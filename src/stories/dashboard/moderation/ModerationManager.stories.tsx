import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ModerationManager from '@/components/dashboard/moderation/ModerationManager';

import { SUBJECT_ID } from '../../../../.storybook/mocks/fixtures';

const meta: Meta<typeof ModerationManager> = {
	title: 'Dashboard/Moderation/ModerationManager',
	component: ModerationManager,
	parameters: {
		docs: {
			description: {
				component:
					'The whole moderation route behind its `moderation.view` guard. It is one query-param screen rather than two routes — without `?id=` it shows the profile list, with one it shows that profile. Write actions are handed down as props derived from the caller’s permissions, so switch the **Rol** toolbar to compare a yakuza (view + manage) with an admin (also delete and badges). A role without `moderation.view` is redirected by the guard, which a mocked router cannot do — such a story would spin forever, so there is none.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof ModerationManager>;

export const Default: Story = {
	name: 'Profielenlijst',
	globals: { role: 'admin' },
};

export const Profiel: Story = {
	name: 'Profiel (?id=)',
	globals: { role: 'admin' },
	parameters: { nextjs: { appDirectory: true, navigation: { pathname: '/dashboard/moderation', query: { id: SUBJECT_ID } } } },
};
