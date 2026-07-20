import Button from '@/components/basics/Button';
import Checkbox from '@/components/forms/Checkbox';
import Field from '@/components/forms/Field';
import Select from '@/components/forms/Select';
import TextInput from '@/components/forms/TextInput';

export type SurveyQuestionKind = 'rating_1_5' | 'scale_0_10' | 'yes_no' | 'number' | 'date' | 'text' | 'single_choice' | 'multi_choice';

export interface SurveyOptionForm {
	label: string;
}
export interface SurveyQuestionForm {
	label: string;
	kind: SurveyQuestionKind;
	required: boolean;
	options: SurveyOptionForm[];
}

export const SURVEY_KIND_OPTIONS = [
	{ value: 'rating_1_5', label: 'Score 1–5' },
	{ value: 'scale_0_10', label: 'Schaal 0–10 (NPS)' },
	{ value: 'yes_no', label: 'Ja / nee' },
	{ value: 'number', label: 'Getal' },
	{ value: 'date', label: 'Datum' },
	{ value: 'text', label: 'Vrije tekst' },
	{ value: 'single_choice', label: 'Keuze (één antwoord)' },
	{ value: 'multi_choice', label: 'Meerkeuze (meerdere)' },
];
export const SURVEY_KIND_LABEL: Record<SurveyQuestionKind, string> = Object.fromEntries(SURVEY_KIND_OPTIONS.map((o) => [o.value, o.label])) as Record<SurveyQuestionKind, string>;
export const isChoiceKind = (k: SurveyQuestionKind): boolean => k === 'single_choice' || k === 'multi_choice';

interface SurveyQuestionEditorProps {
	questions: SurveyQuestionForm[];
	locked: boolean;
	onChange: (questions: SurveyQuestionForm[]) => void;
}

/**
 * Edits a survey's question list: reorderable question cards (label, type, required, choice options) with
 * add/remove, or a read-only summary when `locked` (the survey already has responses). Presentational —
 * every mutation is emitted through `onChange` with the next questions array.
 */
const SurveyQuestionEditor = ({ questions, locked, onChange }: SurveyQuestionEditorProps) => {
	const patchQuestion = (i: number, patch: Partial<SurveyQuestionForm>) => onChange(questions.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
	const patchOption = (qi: number, oi: number, label: string) =>
		onChange(questions.map((q, idx) => (idx === qi ? { ...q, options: q.options.map((o, k) => (k === oi ? { label } : o)) } : q)));
	const removeQuestion = (i: number) => onChange(questions.filter((_, idx) => idx !== i));
	const moveQuestion = (i: number, dir: -1 | 1) => {
		const j = i + dir;
		if (j < 0 || j >= questions.length) return;
		const qs = [...questions];
		const a = qs[i];
		const b = qs[j];
		if (!a || !b) return;
		qs[i] = b;
		qs[j] = a;
		onChange(qs);
	};

	if (locked) {
		return (
			<ol className="survey-question-editor is-locked">
				{questions.map((q, i) => (
					<li key={i}>
						<strong>{q.label}</strong>{' '}
						<span className="meta">
							· {SURVEY_KIND_LABEL[q.kind]}
							{q.required ? ' · verplicht' : ''}
						</span>
						{isChoiceKind(q.kind) && <span className="meta"> · {q.options.map((o) => o.label).join(', ')}</span>}
					</li>
				))}
			</ol>
		);
	}

	return (
		<div className="survey-question-editor">
			{questions.map((q, i) => (
				<div className="card" key={i}>
					<div className="top">
						<span className="index">Vraag {i + 1}</span>
						<span className="tools">
							<Button variant="ghost" onClick={() => moveQuestion(i, -1)}>
								↑
							</Button>
							<Button variant="ghost" onClick={() => moveQuestion(i, 1)}>
								↓
							</Button>
							<Button variant="ghost" onClick={() => removeQuestion(i)}>
								Verwijder
							</Button>
						</span>
					</div>
					<Field name={`q${i}-label`}>
						<Field.Label>Vraag</Field.Label>
						<TextInput value={q.label} onChange={(e) => patchQuestion(i, { label: e.currentTarget.value })} />
					</Field>
					<Field name={`q${i}-kind`}>
						<Field.Label>Type</Field.Label>
						<Select
							native
							aria-label="Vraagtype"
							value={q.kind}
							options={SURVEY_KIND_OPTIONS}
							onValueChange={(v) => patchQuestion(i, { kind: v as SurveyQuestionKind, options: isChoiceKind(v as SurveyQuestionKind) ? (q.options.length ? q.options : [{ label: '' }]) : [] })}
						/>
					</Field>
					<Checkbox checked={q.required} onCheckedChange={(required) => patchQuestion(i, { required })} label="Verplicht" />
					{isChoiceKind(q.kind) && (
						<div className="options">
							<span className="options-label">Antwoordopties</span>
							{q.options.map((o, oi) => (
								<div className="option-row" key={oi}>
									<TextInput aria-label={`Optie ${oi + 1}`} value={o.label} onChange={(e) => patchOption(i, oi, e.currentTarget.value)} />
									<Button variant="ghost" onClick={() => patchQuestion(i, { options: q.options.filter((_, k) => k !== oi) })}>
										Verwijder
									</Button>
								</div>
							))}
							<Button variant="secondary" icon="plus" onClick={() => patchQuestion(i, { options: [...q.options, { label: '' }] })}>
								Optie
							</Button>
						</div>
					)}
				</div>
			))}
			<Button variant="secondary" icon="plus" onClick={() => onChange([...questions, { label: '', kind: 'rating_1_5', required: false, options: [] }])}>
				Vraag toevoegen
			</Button>
		</div>
	);
};

export default SurveyQuestionEditor;
