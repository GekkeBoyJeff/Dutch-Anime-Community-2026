import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import OpenSurveys from '@/components/dashboard/account/OpenSurveys';

const meta: Meta<typeof OpenSurveys> = {
	title: 'Dashboard/Account/OpenSurveys',
	component: OpenSurveys,
	parameters: {
		docs: {
			description: {
				component:
					'"Enquêtes voor jou": the surveys this member may still fill in, from `my_open_surveys()` — audience and the not-yet-submitted filter both live inside that SECURITY DEFINER RPC, so this component never decides who sees what. Each row deep-links into the /enquete fill flow, and the panel hides itself when nothing is open.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof OpenSurveys>;

export const Default: Story = {};
