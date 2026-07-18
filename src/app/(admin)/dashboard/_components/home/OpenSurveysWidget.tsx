'use client';

import Badge from '@/components/basics/Badge';

import type { WidgetProps } from './types';
import { useWidgetData } from './useWidgetData';
import WidgetShell from './WidgetShell';

// Currently-open surveys with their submission counts, for survey managers. "Open" mirrors
// SurveysManager's statusOf(): published (opens_at set), not archived, not past its close date.
const OpenSurveysWidget = ({ session: _session }: WidgetProps) => {
	const { loading, error, data } = useWidgetData(async (db) => {
		const now = new Date().toISOString();
		const [surveys, counts] = await Promise.all([
			db.from('surveys').select('id, title, opens_at, closes_at, archived_at').is('archived_at', null).not('opens_at', 'is', null).order('opens_at', { ascending: false }),
			db.rpc('survey_response_counts'),
		]);
		if (surveys.error) throw surveys.error;

		const open = (surveys.data ?? []).filter((s) => s.closes_at === null || s.closes_at > now);
		if (open.length === 0) return null;

		const countById = new Map(((counts.data ?? []) as { survey_id: string; response_count: number }[]).map((c) => [c.survey_id, Number(c.response_count)]));
		return open.slice(0, 5).map((s) => ({ id: s.id, title: s.title, responses: countById.get(s.id) ?? 0 }));
	});

	return (
		<WidgetShell title="Open enquêtes" href="/dashboard/surveys" linkLabel="Naar enquêtes" loading={loading} error={error} isEmpty={!data} hideWhenEmpty>
			{data && (
				<ul className="widget-list">
					{data.map((survey) => (
						<li key={survey.id} className="widget-row">
							<span className="widget-row-main">{survey.title}</span>
							<Badge variant="info">{survey.responses} inzending{survey.responses === 1 ? '' : 'en'}</Badge>
						</li>
					))}
				</ul>
			)}
		</WidgetShell>
	);
};

export default OpenSurveysWidget;
