import { useState } from 'react';

import Badge from '@/components/basics/Badge';
import Button from '@/components/basics/Button';
import Drawer from '@/components/components/Drawer';
import DataTable, { type DataTableColumn } from '@/components/dashboard/components/DataTable';
import DataTableSkeleton from '@/components/dashboard/components/DataTableSkeleton';
import type { Json } from '@/types/database.types';

export interface NotificationHistoryRow {
	id: string;
	type_key: string | null;
	title: string;
	body: string | null;
	sender_user_id: string | null;
	audience: Json;
	sent_at: string;
}

interface NotificationHistoryTableProps {
	rows: NotificationHistoryRow[] | null;
	loading: boolean;
	typeLabels: Map<string, string>;
	names: Map<string, string>;
	/** Injectable formatter for the opaque `audience` json — the domain rules live in the caller. */
	formatAudience: (audience: Json) => string;
	skeletonRows?: number;
}

const BODY_PREVIEW_LEN = 80;
const fmt = (iso: string): string => new Date(iso).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' });

/**
 * Sent-notification history as a sortable table: date, type label, title, a truncated body with a
 * "Bekijk" drawer, sender name and the formatted audience. Presentational — the caller supplies the
 * rows and the lookup maps; the full-body drawer is local view state.
 */
const NotificationHistoryTable = ({ rows, loading, typeLabels, names, formatAudience, skeletonRows = 8 }: NotificationHistoryTableProps) => {
	const [detail, setDetail] = useState<NotificationHistoryRow | null>(null);

	const columns: DataTableColumn<NotificationHistoryRow>[] = [
		{ key: 'sent_at', header: 'Verzonden op', sortable: true, sortValue: (r) => r.sent_at, cell: (r) => fmt(r.sent_at) },
		{ key: 'type', header: 'Type', cell: (r) => (r.type_key ? typeLabels.get(r.type_key) ?? r.type_key : '—') },
		{ key: 'title', header: 'Titel', cell: (r) => r.title },
		{
			key: 'body',
			header: 'Bericht',
			cell: (r) => {
				if (!r.body) return '—';
				if (r.body.length <= BODY_PREVIEW_LEN) return r.body;
				return (
					<span className="stacked-value">
						<span className="stacked-value-main">{r.body.slice(0, BODY_PREVIEW_LEN)}…</span>
						<Button variant="secondary" onClick={() => setDetail(r)}>
							Bekijk
						</Button>
					</span>
				);
			},
		},
		{
			key: 'sender',
			header: 'Afzender',
			cell: (r) => (r.sender_user_id ? names.get(r.sender_user_id) ?? r.sender_user_id.slice(0, 8) : <Badge variant="neutral">Systeem</Badge>),
		},
		{ key: 'audience', header: 'Doelgroep', cell: (r) => formatAudience(r.audience) },
	];

	return (
		<>
			{loading || rows === null ? (
				<DataTableSkeleton
					columns={[
						{ header: 'Verzonden op' },
						{ header: 'Type' },
						{ header: 'Titel' },
						{ header: 'Bericht' },
						{ header: 'Afzender' },
						{ header: 'Doelgroep' },
					]}
					rows={skeletonRows}
				/>
			) : (
				<div className="reveal">
					<DataTable columns={columns} data={rows} empty={{ title: 'Geen historie', description: 'Er zijn nog geen meldingen verstuurd.' }} />
				</div>
			)}

			<Drawer open={detail !== null} onOpenChange={(open) => !open && setDetail(null)} title={detail?.title ?? 'Melding'} description={detail ? fmt(detail.sent_at) : undefined} size="28rem">
				{detail && <p>{detail.body}</p>}
			</Drawer>
		</>
	);
};

export default NotificationHistoryTable;
