import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import SurveyEditor from '@/components/dashboard/surveys/SurveyEditor';

const noop = () => {};

const meta: Meta<typeof SurveyEditor> = {
	title: 'Dashboard/Surveys/SurveyEditor',
	component: SurveyEditor,
	globals: { role: 'author' },
	parameters: {
		docs: {
			description: {
				component:
					'The editor drawer for one survey: meta (title, access, audience, linked event) plus its questions. A survey that already has responses locks its questions, because saving replaces them and would cascade the answers away.',
			},
		},
	},
	args: {
		open: true,
		events: [
			{ id: 'evt-1', name: 'Abunai! 2026' },
			{ id: 'evt-2', name: 'Dokomi NL' },
		],
		otherSurveys: [{ id: 'srv-2', title: 'Voorkeuren shifts najaar' }],
		userId: 'usr-0001',
		onClose: noop,
		onSaved: noop,
	},
};

export default meta;

type Story = StoryObj<typeof SurveyEditor>;

export const Default: Story = {
	name: 'Nieuwe enquête',
	args: { surveyId: null },
};

export const Locked: Story = {
	name: 'Met inzendingen (op slot)',
	args: { surveyId: 'srv-1' },
};
