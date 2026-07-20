import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import SurveyQuestionEditor, { type SurveyQuestionForm } from '@/components/dashboard/forms/SurveyQuestionEditor';

const seed: SurveyQuestionForm[] = [
	{ label: 'Hoe beoordeel je de conventie?', kind: 'rating_1_5', required: true, options: [] },
	{ label: 'Favoriete programmaonderdeel', kind: 'single_choice', required: false, options: [{ label: 'Cosplay' }, { label: 'Panels' }] },
];

const meta: Meta<typeof SurveyQuestionEditor> = {
	title: 'Dashboard/Forms/SurveyQuestionEditor',
	component: SurveyQuestionEditor,
	parameters: {
		docs: {
			description: {
				component:
					'Edits a survey question list: reorderable question cards (label, type, required, choice options) with add/remove, or a read-only summary when `locked` (the survey already has responses). Emits the next questions array via `onChange`.',
			},
		},
	},
	decorators: [(Story) => <div style={{ maxInlineSize: '42rem' }}><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof SurveyQuestionEditor>;

// Interactive wrapper so the add/remove/reorder controls actually mutate in the story.
const Interactive = ({ locked, initial }: { locked: boolean; initial: SurveyQuestionForm[] }) => {
	const [questions, setQuestions] = useState(initial);
	return <SurveyQuestionEditor questions={questions} locked={locked} onChange={setQuestions} />;
};

export const Default: Story = {
	render: () => <Interactive locked={false} initial={seed} />,
};

export const Empty: Story = {
	name: 'Leeg',
	render: () => <Interactive locked={false} initial={[]} />,
};

export const Locked: Story = {
	name: 'Op slot',
	render: () => <Interactive locked initial={seed} />,
};
