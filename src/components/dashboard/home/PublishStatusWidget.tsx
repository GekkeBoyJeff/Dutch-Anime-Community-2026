'use client';

import Button from '@/components/basics/Button';
import LeadLine from '@/components/dashboard/components/LeadLine';
import AsyncCard from '@/components/dashboard/structures/AsyncCard';
import { formatDate } from '@/lib/formatDate';

import type { WidgetProps } from './types';
import { useWidgetData } from './useWidgetData';

// Content-status (blueprint §1b/C10), for authors: how many pages carry edits and when the site was last
// touched, with a one-click route to publish. The schema has no publish-timestamp anchor, so "changes
// since publish" can't be computed exactly — this reports edits in the last 14 days as the honest proxy
// (a deploy-log table would sharpen it; noted for H4). Reads the `pages` table only.
const RECENT_DAYS = 14;

const PublishStatusWidget = ({ session: _session }: WidgetProps) => {
	const { loading, error, data } = useWidgetData(async (db) => {
		const { data: rows, error: queryError } = await db.from('pages').select('path, updated_at').order('updated_at', { ascending: false });
		if (queryError) throw queryError;
		const pages = rows ?? [];
		if (pages.length === 0) return null;
		const cutoff = Date.now() - RECENT_DAYS * 86_400_000;
		const recent = pages.filter((page) => new Date(page.updated_at).getTime() >= cutoff).length;
		return { total: pages.length, recent, latest: pages[0]!.updated_at };
	});

	return (
		<AsyncCard title="Content-status" href="/builder" linkLabel="Naar de pagina-editor" loading={loading} error={error} isEmpty={!data} hideWhenEmpty>
			{data && (
				<div className="widget-publish">
					<LeadLine
						main={data.recent > 0 ? `${data.recent} ${data.recent === 1 ? 'pagina' : "pagina's"} recent gewijzigd` : 'Geen recente wijzigingen'}
						sub={`${data.total} ${data.total === 1 ? 'pagina' : "pagina's"} · laatst bewerkt ${formatDate(data.latest, { dateStyle: 'medium' }) ?? data.latest}`}
					/>
					<Button variant="primary" icon="upload" url="/builder">
						Publiceren
					</Button>
				</div>
			)}
		</AsyncCard>
	);
};

export default PublishStatusWidget;
