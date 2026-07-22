import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import PushToggle from '@/components/dashboard/account/PushToggle';

const meta: Meta<typeof PushToggle> = {
	title: 'Dashboard/Account/PushToggle',
	component: PushToggle,
	parameters: {
		docs: {
			description: {
				component:
					'The "Meldingen aanzetten/uitzetten" button at the foot of "Mijn profiel". It renders **nothing** unless the browser supports web push *and* a public VAPID key is configured, so this story is blank in any run without `NEXT_PUBLIC_VAPID_PUBLIC_KEY` in the environment. Pressing it asks for the browser\'s notification permission, so leave it alone unless that is what you came to test; success or failure is reported inline rather than as a toast, because the account page mounts no toast provider.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof PushToggle>;

export const Default: Story = {};
