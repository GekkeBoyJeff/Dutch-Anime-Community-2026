import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import SurveyResults from '@/components/dashboard/surveys/SurveyResults';

const meta: Meta<typeof SurveyResults> = {
	title: 'Dashboard/Surveys/SurveyResults',
	component: SurveyResults,
	globals: { role: 'author' },
	parameters: {
		docs: {
			description: {
				component:
					'Fetches one survey’s results through `get_survey_results()` and hands them to SurveyResultsView. Rendered inside a drawer in the surveys screen; here it stands on its own. Passing `surveyId: null` renders nothing, which is how the drawer stays empty until a row is picked.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof SurveyResults>;

export const Default: Story = {
	args: { surveyId: 'srv-1' },
};
