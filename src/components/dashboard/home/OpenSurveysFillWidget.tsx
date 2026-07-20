'use client';

import Button from '@/components/basics/Button';
import DetailRow from '@/components/dashboard/components/DetailRow';
import AsyncCard from '@/components/dashboard/structures/AsyncCard';

import type { WidgetProps } from './types';
import { useWidgetData } from './useWidgetData';

// The open surveys THIS member may fill and hasn't yet — the one reason a plain user has to come back.
// Reuses my_open_surveys() (audience + not-yet-submitted filter live in the SECURITY DEFINER RPC), and
// each row deep-links into the /enquete fill flow. gate='always' in the registry, so every member sees it.
const OpenSurveysFillWidget = ({ session: _session }: WidgetProps) => {
	const { loading, error, data } = useWidgetData(async (db) => {
		const { data: rows, error: queryError } = await db.rpc('my_open_surveys');
		if (queryError) throw queryError;
		return (rows ?? []).map((row) => ({ id: row.survey_id, title: row.title, questions: Number(row.question_count) }));
	});

	return (
		<AsyncCard title="Enquêtes voor jou" loading={loading} error={error} isEmpty={!data || data.length === 0} hideWhenEmpty>
			{data && data.length > 0 && (
				<ul className="widget-list">
					{data.map((survey) => (
						<DetailRow
							key={survey.id}
							main={survey.title}
							sub={`${survey.questions} ${survey.questions === 1 ? 'vraag' : 'vragen'}`}
							trailing={
								<Button variant="primary" url={`/enquete?id=${survey.id}`}>
									Vul in
								</Button>
							}
						/>
					))}
				</ul>
			)}
		</AsyncCard>
	);
};

export default OpenSurveysFillWidget;
