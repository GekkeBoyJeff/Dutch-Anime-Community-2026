'use client';

import { useMemo, useState } from 'react';

import Button from '@/components/basics/Button';
import Chart from '@/components/dashboard/components/Chart';

export type SurveyResultKind = 'rating_1_5' | 'scale_0_10' | 'yes_no' | 'number' | 'date' | 'text' | 'single_choice' | 'multi_choice';

export interface SurveyResultQuestion {
	id: string;
	label: string;
	kind: SurveyResultKind;
	options: { id: string; label: string }[];
}
export interface SurveyResultAnswer {
	question_id: string;
	value_number: number | null;
	value_text: string | null;
	value_date: string | null;
	option_ids: string[];
}
export interface SurveyResultResponse {
	response_id: string;
	submitted_at: string;
	respondent: { user_id: string; name: string | null } | null;
	answers: SurveyResultAnswer[];
}
export interface SurveyResults {
	survey: { id: string; title: string; anonymous: boolean; access_mode: 'public' | 'authenticated' };
	questions: SurveyResultQuestion[];
	responses: SurveyResultResponse[];
}

interface SurveyResultsViewProps {
	results: SurveyResults | null;
	error?: string | null;
}

const isChoice = (k: SurveyResultKind): boolean => k === 'single_choice' || k === 'multi_choice';
const isNumeric = (k: SurveyResultKind): boolean => k === 'rating_1_5' || k === 'scale_0_10' || k === 'number';

const fmtAnswer = (q: SurveyResultQuestion, a: SurveyResultAnswer | undefined): string => {
	if (!a) return '—';
	if (q.kind === 'text') return a.value_text ?? '—';
	if (q.kind === 'date') return a.value_date ?? '—';
	if (q.kind === 'yes_no') return a.value_number === 1 ? 'Ja' : a.value_number === 0 ? 'Nee' : '—';
	if (isChoice(q.kind)) return a.option_ids.map((id) => q.options.find((o) => o.id === id)?.label).filter(Boolean).join(', ') || '—';
	return a.value_number != null ? String(a.value_number) : '—';
};

/**
 * Renders survey results: a response count, a summary per question (numeric stats, yes/no tallies, choice
 * tallies, free-text lists) and — for identified surveys — a toggleable per-person answer table. Purely
 * presentational; the caller fetches `results` and passes `error`/`null` for the error/loading states.
 */
const SurveyResultsView = ({ results, error }: SurveyResultsViewProps) => {
	const [perPerson, setPerPerson] = useState(false);

	const answersFor = useMemo(() => {
		const map = new Map<string, SurveyResultAnswer[]>();
		if (results) for (const q of results.questions) map.set(q.id, results.responses.flatMap((r) => r.answers.filter((a) => a.question_id === q.id)));
		return map;
	}, [results]);

	if (error) return <div className="survey-results"><p className="note">{error}</p></div>;
	if (!results) return <div className="survey-results"><p className="note">Laden…</p></div>;

	const identified = !results.survey.anonymous && results.survey.access_mode !== 'public';
	const count = results.responses.length;

	return (
		<div className="survey-results">
			<p className="count">
				{count} {count === 1 ? 'inzending' : 'inzendingen'}
				{!identified && ' · anoniem'}
			</p>

			{identified && count > 0 && (
				<Button variant="secondary" onClick={() => setPerPerson((v) => !v)}>
					{perPerson ? 'Toon samenvatting' : 'Toon per persoon'}
				</Button>
			)}

			{count === 0 ? (
				<p className="note">Nog geen inzendingen.</p>
			) : perPerson && identified ? (
				<div className="table-wrap">
					<table className="table">
						<thead>
							<tr>
								<th>Wie</th>
								{results.questions.map((q) => (
									<th key={q.id}>{q.label}</th>
								))}
							</tr>
						</thead>
						<tbody>
							{results.responses.map((r) => (
								<tr key={r.response_id}>
									<td>{r.respondent?.name ?? r.respondent?.user_id?.slice(0, 8) ?? '—'}</td>
									{results.questions.map((q) => (
										<td key={q.id}>{fmtAnswer(q, r.answers.find((a) => a.question_id === q.id))}</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<div className="summary">
					{results.questions.map((q) => {
						const answers = answersFor.get(q.id) ?? [];
						return (
							<div className="block" key={q.id}>
								<span className="label">{q.label}</span>
								{isNumeric(q.kind) &&
									(() => {
										const nums = answers.map((a) => a.value_number).filter((n): n is number => n != null);
										if (!nums.length) return <span className="note">Geen antwoorden</span>;
										const avg = nums.reduce((s, n) => s + n, 0) / nums.length;
										return (
											<span className="stat">
												Gemiddeld {avg.toFixed(1)} · min {Math.min(...nums)} · max {Math.max(...nums)} · {nums.length} antwoorden
											</span>
										);
									})()}
								{q.kind === 'yes_no' &&
									(() => {
										const yes = answers.filter((a) => a.value_number === 1).length;
										const no = answers.filter((a) => a.value_number === 0).length;
										return (
											<span className="stat">
												Ja: {yes} · Nee: {no}
											</span>
										);
									})()}
								{isChoice(q.kind) && (
									<Chart.Bar
										className="survey-chart"
										height={200}
										data={q.options.map((o) => ({ label: o.label, aantal: answers.filter((a) => a.option_ids.includes(o.id)).length }))}
										series={[{ key: 'aantal', name: 'Antwoorden' }]}
										emptyLabel="Geen antwoorden"
									/>
								)}
								{(q.kind === 'text' || q.kind === 'date') && (
									<ul className="list">
										{answers
											.map((a) => (q.kind === 'text' ? a.value_text : a.value_date))
											.filter((v): v is string => Boolean(v))
											.map((v, i) => (
												<li key={i}>{v}</li>
											))}
									</ul>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default SurveyResultsView;
