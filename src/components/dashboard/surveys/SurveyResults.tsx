'use client';

import { useEffect, useState } from 'react';

import SurveyResultsView, { type SurveyResults as SurveyResultsData } from '@/components/dashboard/components/SurveyResultsView';
import { getBrowserClient } from '@/lib/supabase/client';

const SurveyResults = ({ surveyId }: { surveyId: string | null }) => {
	const [results, setResults] = useState<SurveyResultsData | null>(null);
	const [loadedFor, setLoadedFor] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	if (surveyId !== loadedFor) {
		setLoadedFor(surveyId);
		setResults(null);
		setError(null);
	}

	useEffect(() => {
		if (!surveyId) return;
		let active = true;
		getBrowserClient()
			.rpc('get_survey_results', { p_id: surveyId })
			.then(({ data, error: err }) => {
				if (!active) return;
				if (err) setError(err.message);
				else setResults(data as unknown as SurveyResultsData);
			});
		return () => {
			active = false;
		};
	}, [surveyId]);

	if (!surveyId) return null;

	return <SurveyResultsView key={surveyId} results={results} error={error} />;
};

export default SurveyResults;
