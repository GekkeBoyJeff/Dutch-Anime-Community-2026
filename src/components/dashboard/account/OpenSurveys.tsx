'use client';

import Button from '@/components/basics/Button';
import Entry from '@/components/components/Entry';
import Panel from '@/components/components/Panel';
import { useWidgetData } from '@/components/dashboard/home/useWidgetData';

// The open surveys THIS member may fill and hasn't yet — the one reason a plain user has to come back.
// Reuses my_open_surveys() (audience + not-yet-submitted filter live in the SECURITY DEFINER RPC), and
// each row deep-links into the /enquete fill flow.
const OpenSurveys = () => {
	const { loading, error, data } = useWidgetData(async (db) => {
		const { data: rows, error: queryError } = await db.rpc('my_open_surveys');
		if (queryError) throw queryError;
		return (rows ?? []).map((row) => ({ id: row.survey_id, title: row.title, questions: Number(row.question_count) }));
	});

	return (
		<Panel title="Enquêtes voor jou" error={error} isEmpty={!loading && (!data || data.length === 0)} hideWhenEmpty>
			<Entry.List>
				{loading && [0, 1].map((row) => <Entry key={row} main="" loading />)}
				{data?.map((survey) => (
					<Entry
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
			</Entry.List>
		</Panel>
	);
};

export default OpenSurveys;
