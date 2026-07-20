import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import SurveyResultsView, { type SurveyResults } from '@/components/dashboard/components/SurveyResultsView';

const results: SurveyResults = {
	survey: { id: 's1', title: 'Evaluatie DAC 2026', anonymous: false, access_mode: 'authenticated' },
	questions: [
		{ id: 'q1', label: 'Hoe beoordeel je de conventie?', kind: 'rating_1_5', options: [] },
		{ id: 'q2', label: 'Kom je volgend jaar terug?', kind: 'yes_no', options: [] },
		{ id: 'q3', label: 'Favoriete programmaonderdeel', kind: 'single_choice', options: [{ id: 'o1', label: 'Cosplay' }, { id: 'o2', label: 'Panels' }, { id: 'o3', label: 'Artist alley' }] },
		{ id: 'q4', label: 'Tips?', kind: 'text', options: [] },
	],
	responses: [
		{ response_id: 'r1', submitted_at: '2026-07-07T10:00:00Z', respondent: { user_id: 'u1', name: 'Jeffrey' }, answers: [
			{ question_id: 'q1', value_number: 5, value_text: null, value_date: null, option_ids: [] },
			{ question_id: 'q2', value_number: 1, value_text: null, value_date: null, option_ids: [] },
			{ question_id: 'q3', value_number: null, value_text: null, value_date: null, option_ids: ['o1'] },
			{ question_id: 'q4', value_number: null, value_text: 'Meer zitplekken', value_date: null, option_ids: [] },
		] },
		{ response_id: 'r2', submitted_at: '2026-07-07T11:00:00Z', respondent: { user_id: 'u2', name: 'Mila' }, answers: [
			{ question_id: 'q1', value_number: 4, value_text: null, value_date: null, option_ids: [] },
			{ question_id: 'q2', value_number: 0, value_text: null, value_date: null, option_ids: [] },
			{ question_id: 'q3', value_number: null, value_text: null, value_date: null, option_ids: ['o2'] },
			{ question_id: 'q4', value_number: null, value_text: null, value_date: null, option_ids: [] },
		] },
	],
};

const meta: Meta<typeof SurveyResultsView> = {
	title: 'Dashboard/Components/SurveyResultsView',
	component: SurveyResultsView,
	parameters: {
		docs: {
			description: {
				component:
					'Renders survey results: a response count, a per-question summary (numeric stats, yes/no and choice tallies, free-text lists) and — for identified surveys — a toggleable per-person answer table. The caller fetches the results.',
			},
		},
	},
	decorators: [(Story) => <div style={{ maxInlineSize: '46rem' }}><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof SurveyResultsView>;

export const Default: Story = {
	args: { results },
};

export const NoResponses: Story = {
	name: 'Geen inzendingen',
	args: { results: { ...results, responses: [] } },
};

export const Loading: Story = {
	args: { results: null },
};

export const ErrorState: Story = {
	name: 'Foutmelding',
	args: { results: null, error: 'Kon resultaten niet laden.' },
};
