'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import Button from '@/components/basics/Button';
import Container from '@/components/basics/Container';
import Title from '@/components/basics/Title';
import Field from '@/components/forms/Field';
import TextArea from '@/components/forms/TextArea';
import TextInput from '@/components/forms/TextInput';
import { signInWithDiscord, useSession } from '@/lib/auth/permissions';
import { classNames } from '@/lib/classNames';
import { getBrowserClient } from '@/lib/supabase/client';

type Kind = 'rating_1_5' | 'scale_0_10' | 'yes_no' | 'number' | 'date' | 'text' | 'single_choice' | 'multi_choice';

interface Question {
	id: string;
	label: string;
	kind: Kind;
	required: boolean;
	options: { id: string; label: string }[];
}
interface AnswerInput {
	value_number?: number;
	value_text?: string;
	value_date?: string;
	option_ids?: string[];
}
interface FillData {
	error?: string;
	survey: { id: string; title: string; description: string | null; access_mode: 'public' | 'authenticated'; anonymous: boolean };
	questions: Question[];
	eligible: boolean;
	already_submitted: boolean;
	my_answers: (AnswerInput & { question_id: string })[] | null;
}

const isChoice = (k: Kind): boolean => k === 'single_choice' || k === 'multi_choice';
const range = (from: number, to: number): number[] => Array.from({ length: to - from + 1 }, (_, i) => from + i);

const answered = (a: AnswerInput | undefined, kind: Kind): boolean => {
	if (!a) return false;
	if (kind === 'text') return Boolean(a.value_text && a.value_text.trim());
	if (kind === 'date') return Boolean(a.value_date);
	if (isChoice(kind)) return Boolean(a.option_ids && a.option_ids.length);
	return a.value_number !== undefined && a.value_number !== null;
};

const fmtValue = (q: Question, a: (AnswerInput & { question_id: string }) | undefined): string => {
	if (!a) return '—';
	if (q.kind === 'text') return a.value_text ?? '—';
	if (q.kind === 'date') return a.value_date ?? '—';
	if (q.kind === 'yes_no') return a.value_number === 1 ? 'Ja' : a.value_number === 0 ? 'Nee' : '—';
	if (isChoice(q.kind)) return (a.option_ids ?? []).map((id) => q.options.find((o) => o.id === id)?.label).filter(Boolean).join(', ') || '—';
	return a.value_number != null ? String(a.value_number) : '—';
};

const Message = ({ title, children }: { title: string; children?: React.ReactNode }) => (
	<Container className="enquete">
		<div className="enquete-card enquete-message">
			<Title size={3}>{title}</Title>
			{children}
			<Link href="/" className="enquete-back">
				← Terug naar de website
			</Link>
		</div>
	</Container>
);

const SurveyFill = () => {
	const id = useSearchParams().get('id');
	const { session, loading: sessionLoading } = useSession();
	const [data, setData] = useState<FillData | null>(null);
	const [loading, setLoading] = useState(true);
	const [answers, setAnswers] = useState<Record<string, AnswerInput>>({});
	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!id || sessionLoading) return;
		let active = true;
		getBrowserClient()
			.rpc('get_survey_for_fill', { p_id: id })
			.then(({ data: res, error: err }) => {
				if (!active) return;
				if (err) setError(err.message);
				else setData(res as unknown as FillData);
				setLoading(false);
			});
		return () => {
			active = false;
		};
		// herlaadt na inloggen (session wisselt) voor eligibility/eigen antwoorden.
	}, [id, session, sessionLoading]);

	const setAnswer = (qid: string, patch: AnswerInput) => setAnswers((a) => ({ ...a, [qid]: patch }));
	const toggleOption = (qid: string, optId: string, multi: boolean) =>
		setAnswers((a) => {
			const current = a[qid]?.option_ids ?? [];
			const next = multi ? (current.includes(optId) ? current.filter((o) => o !== optId) : [...current, optId]) : [optId];
			return { ...a, [qid]: { option_ids: next } };
		});

	const submit = async () => {
		if (!data || submitting) return;
		for (const q of data.questions) {
			if (q.required && !answered(answers[q.id], q.kind)) {
				setError(`Beantwoord eerst: "${q.label}"`);
				return;
			}
		}
		setError(null);
		setSubmitting(true);
		const payload = data.questions
			.filter((q) => answered(answers[q.id], q.kind))
			.map((q) => ({ question_id: q.id, ...answers[q.id] }));
		const { error: err } = await getBrowserClient().rpc('submit_survey_response', { p_id: id as string, p_answers: payload });
		setSubmitting(false);
		if (err) {
			setError(err.message);
			return;
		}
		setSubmitted(true);
	};

	if (!id) return <Message title="Geen enquête opgegeven" />;
	if (loading || sessionLoading) return <Message title="Laden…" />;
	if (error && !data) return <Message title="Er ging iets mis">{<p>{error}</p>}</Message>;
	if (!data || data.error) return <Message title="Deze enquête is niet beschikbaar">{<p>De enquête bestaat niet, is gesloten of gearchiveerd.</p>}</Message>;

	const { survey, questions, eligible, already_submitted } = data;

	if (survey.access_mode === 'authenticated' && !session)
		return (
			<Message title={survey.title}>
				<p>Log in met Discord om deze enquête in te vullen.</p>
				<Button variant="primary" onClick={() => signInWithDiscord(`/enquete?id=${id}`)}>
					Log in met Discord
				</Button>
			</Message>
		);
	if (!eligible) return <Message title={survey.title}>{<p>Deze enquête is niet voor jou bedoeld.</p>}</Message>;
	if (submitted)
		return (
			<Message title="Bedankt!">
				<p>Je antwoorden zijn opgeslagen.</p>
				{session && <Link href="/account">Bekijk je ingevulde enquêtes op je account</Link>}
			</Message>
		);
	if (already_submitted)
		return (
			<Container className="enquete">
				<div className="enquete-card">
					<Title size={2}>{survey.title}</Title>
					<p className="enquete-anon">Je hebt deze enquête al ingevuld. Dit zijn je antwoorden:</p>
					<div className="enquete-questions">
						{questions.map((q) => (
							<div className="enquete-question" key={q.id}>
								<span className="enquete-q-label">{q.label}</span>
								<span className="enquete-answer">{fmtValue(q, data.my_answers?.find((x) => x.question_id === q.id))}</span>
							</div>
						))}
					</div>
					<Link href="/" className="enquete-back">
						← Terug naar de website
					</Link>
				</div>
			</Container>
		);

	return (
		<Container className="enquete">
			<div className="enquete-card">
				<Title size={2}>{survey.title}</Title>
				{survey.description && <p className="enquete-description">{survey.description}</p>}
				{survey.anonymous && <p className="enquete-anon">Deze enquête is anoniem — je antwoorden zijn niet aan je naam gekoppeld.</p>}

				<div className="enquete-questions">
					{questions.map((q) => (
						<div className="enquete-question" key={q.id}>
							<span className="enquete-q-label">
								{q.label}
								{q.required && <span className="enquete-req" aria-hidden="true"> *</span>}
							</span>

							{(q.kind === 'rating_1_5' || q.kind === 'scale_0_10') && (
								<div className="enquete-scale">
									{range(q.kind === 'rating_1_5' ? 1 : 0, q.kind === 'rating_1_5' ? 5 : 10).map((n) => (
										<button
											type="button"
											key={n}
											className={classNames('enquete-scale-btn', answers[q.id]?.value_number === n && 'is-selected')}
											aria-pressed={answers[q.id]?.value_number === n}
											onClick={() => setAnswer(q.id, { value_number: n })}
										>
											{n}
										</button>
									))}
								</div>
							)}

							{q.kind === 'yes_no' && (
								<div className="enquete-choices">
									{[
										{ v: 1, label: 'Ja' },
										{ v: 0, label: 'Nee' },
									].map((o) => (
										<button
											type="button"
											key={o.v}
											className={classNames('enquete-choice', answers[q.id]?.value_number === o.v && 'is-selected')}
											aria-pressed={answers[q.id]?.value_number === o.v}
											onClick={() => setAnswer(q.id, { value_number: o.v })}
										>
											{o.label}
										</button>
									))}
								</div>
							)}

							{q.kind === 'number' && (
								<Field name={q.id}>
									<TextInput
										type="number"
										aria-label={q.label}
										value={answers[q.id]?.value_number?.toString() ?? ''}
										onChange={(e) => setAnswer(q.id, { value_number: e.currentTarget.value === '' ? undefined : Number(e.currentTarget.value) })}
									/>
								</Field>
							)}

							{q.kind === 'date' && (
								<Field name={q.id}>
									<TextInput type="date" aria-label={q.label} value={answers[q.id]?.value_date ?? ''} onChange={(e) => setAnswer(q.id, { value_date: e.currentTarget.value })} />
								</Field>
							)}

							{q.kind === 'text' && (
								<Field name={q.id}>
									<TextArea aria-label={q.label} value={answers[q.id]?.value_text ?? ''} onChange={(e) => setAnswer(q.id, { value_text: e.currentTarget.value })} />
								</Field>
							)}

							{isChoice(q.kind) && (
								<div className="enquete-choices">
									{q.options.map((o) => {
										const selected = (answers[q.id]?.option_ids ?? []).includes(o.id);
										return (
											<button
												type="button"
												key={o.id}
												className={classNames('enquete-choice', selected && 'is-selected')}
												aria-pressed={selected}
												onClick={() => toggleOption(q.id, o.id, q.kind === 'multi_choice')}
											>
												{o.label}
											</button>
										);
									})}
								</div>
							)}
						</div>
					))}
				</div>

				{error && <p className="enquete-error">{error}</p>}

				<div className="enquete-actions">
					<Button variant="primary" onClick={submit} disabled={submitting}>
						Versturen
					</Button>
					<Link href="/" className="enquete-back">
						Annuleren
					</Link>
				</div>
			</div>
		</Container>
	);
};

export default SurveyFill;
