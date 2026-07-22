import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import SurveysManager from '@/components/dashboard/surveys/SurveysManager';

const meta: Meta<typeof SurveysManager> = {
	title: 'Dashboard/Surveys/SurveysManager',
	component: SurveysManager,
	globals: { role: 'author' },
	parameters: {
		docs: {
			description: {
				component:
					'The surveys screen: filter/search, the overview table with a derived status per survey, and the editor and results drawers. Requires `surveys.manage` — **Auteur** or Beheerder. Under Beheerder the rows gain a "Verwijder" action, because hard-deleting also needs `records.delete`.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof SurveysManager>;

export const Default: Story = {};
