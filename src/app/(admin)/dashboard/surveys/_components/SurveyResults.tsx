'use client';

import { useEffect, useMemo, useState } from 'react';

import Button from '@/components/basics/Button';
import { getBrowserClient } from '@/lib/supabase/client';

type Kind = 'rating_1_5' | 'scale_0_10' | 'yes_no' | 'number' | 'date' | 'text' | 'single_choice' | 'multi_choice';

interface RQuestion {
	id: string;
	label: string;
	kind: Kind;
	options: { id: string; label: string }[];
}
interface RAnswer {
	question_id: string;
	value_number: number | null;
	value_text: string | null;
	value_date: string | null;
	option_ids: string[];
}
interface RResponse {
	response_id: string;
	submitted_at: string;
	respondent: { user_id: string; name: string | null } | null;
	answers: RAnswer[];
}
interface Results {
	survey: { id: string; title: string; anonymous: boolean; access_mode: 'public' | 'authenticated' };
	questions: RQuestion[];
	responses: RResponse[];
}

const isChoice = (k: Kind): boolean => k === 'single_choice' || k === 'multi_choice';
const isNumeric = (k: Kind): boolean => k === 'rating_1_5' || k === 'scale_0_10' || k === 'number';

const fmtAnswer = (q: RQuestion, a: RAnswer | undefined): string => {
	if (!a) return '—';
	if (q.kind === 'text') return a.value_text ?? '—';
	if (q.kind === 'date') return a.value_date ?? '—';
	if (q.kind === 'yes_no') return a.value_number === 1 ? 'Ja' : a.value_number === 0 ? 'Nee' : '—';
	if (isChoice(q.kind)) return a.option_ids.map((id) => q.options.find((o) => o.id === id)?.label).filter(Boolean).join(', ') || '—';
	return a.value_number != null ? String(a.value_number) : '—';
};

const SurveyResults = ({ surveyId }: { surveyId: string | null }) => {
	const [results, setResults] = useState<Results | null>(null);
	const [loadedFor, setLoadedFor] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [perPerson, setPerPerson] = useState(false);

	if (surveyId !== loadedFor) {
		setLoadedFor(surveyId);
		setResults(null);
		setError(null);
		setPerPerson(false);
	}

	useEffect(() => {
		if (!surveyId) return;
		let active = true;
		getBrowserClient()
			.rpc('get_survey_results', { p_id: surveyId })
			.then(({ data, error: err }) => {
				if (!active) return;
				if (err) setError(err.message);
				else setResults(data as unknown as Results);
			});
		return () => {
			active = false;
		};
	}, [surveyId]);

	const answersFor = useMemo(() => {
		const map = new Map<string, RAnswer[]>();
		if (results) for (const q of results.questions) map.set(q.id, results.responses.flatMap((r) => r.answers.filter((a) => a.question_id === q.id)));
		return map;
	}, [results]);

	if (!surveyId) return null;
	if (error) return <p className="survey-note">{error}</p>;
	if (!results) return <p className="survey-note">Laden…</p>;

	const identified = !results.survey.anonymous && results.survey.access_mode !== 'public';
	const count = results.responses.length;

	return (
		<div className="survey-results">
			<p className="survey-results-count">
				{count} {count === 1 ? 'inzending' : 'inzendingen'}
				{!identified && ' · anoniem'}
			</p>

			{identified && count > 0 && (
				<Button variant="secondary" onClick={() => setPerPerson((v) => !v)}>
					{perPerson ? 'Toon samenvatting' : 'Toon per persoon'}
				</Button>
			)}

			{count === 0 ? (
				<p className="survey-note">Nog geen inzendingen.</p>
			) : perPerson && identified ? (
				<div className="survey-results-table-wrap">
					<table className="survey-results-table">
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
				<div className="survey-results-summary">
					{results.questions.map((q) => {
						const answers = answersFor.get(q.id) ?? [];
						return (
							<div className="survey-result-block" key={q.id}>
								<span className="survey-result-label">{q.label}</span>
								{isNumeric(q.kind) &&
									(() => {
										const nums = answers.map((a) => a.value_number).filter((n): n is number => n != null);
										if (!nums.length) return <span className="survey-note">Geen antwoorden</span>;
										const avg = nums.reduce((s, n) => s + n, 0) / nums.length;
										return (
											<span className="survey-result-stat">
												Gemiddeld {avg.toFixed(1)} · min {Math.min(...nums)} · max {Math.max(...nums)} · {nums.length} antwoorden
											</span>
										);
									})()}
								{q.kind === 'yes_no' &&
									(() => {
										const yes = answers.filter((a) => a.value_number === 1).length;
										const no = answers.filter((a) => a.value_number === 0).length;
										return (
											<span className="survey-result-stat">
												Ja: {yes} · Nee: {no}
											</span>
										);
									})()}
								{isChoice(q.kind) && (
									<ul className="survey-result-tally">
										{q.options.map((o) => {
											const n = answers.filter((a) => a.option_ids.includes(o.id)).length;
											return (
												<li key={o.id}>
													<span>{o.label}</span> <strong>{n}</strong>
												</li>
											);
										})}
									</ul>
								)}
								{(q.kind === 'text' || q.kind === 'date') && (
									<ul className="survey-result-list">
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

export default SurveyResults;
