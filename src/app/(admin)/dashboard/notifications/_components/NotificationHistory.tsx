'use client';

import { Toast } from '@base-ui/react/toast';
import { useEffect, useState } from 'react';

import Badge from '@/components/basics/Badge';
import Button from '@/components/basics/Button';
import DataTable, { type DataTableColumn } from '@/components/components/DataTable';
import Drawer from '@/components/components/Drawer';
import { useDashboardGuard } from '@/hooks/useDashboardGuard';
import { getBrowserClient } from '@/lib/supabase/client';
import type { Json } from '@/types/database.types';

interface HistoryRow {
	id: string;
	type_key: string | null;
	title: string;
	body: string | null;
	sender_user_id: string | null;
	audience: Json;
	sent_at: string;
}

const BODY_PREVIEW_LEN = 80;
const fmt = (iso: string): string => new Date(iso).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' });

// Doelgroep-vormen die send-push resp. run_shift_reminders() in notification_history.audience schrijven:
// { kind:'manual', audience:'all', user_count } · { kind:'manual', user_count } · { kind:'shift-reminder', window_minutes, user_count }.
const audienceLabel = (audience: Json): string => {
	const a = (audience ?? {}) as Record<string, unknown>;
	const count = typeof a.user_count === 'number' ? a.user_count : null;
	if (a.kind === 'shift-reminder') {
		const w = typeof a.window_minutes === 'number' ? a.window_minutes : null;
		return w ? `Shift-herinnering (${w} min)` : 'Shift-herinnering';
	}
	if (a.audience === 'all') return `Alle leden${count !== null ? ` (${count})` : ''}`;
	if (count !== null) return `${count} ontvanger${count === 1 ? '' : 's'}`;
	return '—';
};

// Verzendhistorie (notifications.send): nieuwste eerst, met type-label + afzender via lookups (RLS geeft
// alleen zelf-lezen op profiles voor deze permissie, dus namen komen via list_notifiable_members()).
const NotificationHistory = () => {
	const { ready, fallback, session } = useDashboardGuard('notifications.send', { className: 'inventory', label: 'Historie laden' });
	const toast = Toast.useToastManager();
	const [rows, setRows] = useState<HistoryRow[]>([]);
	const [typeLabels, setTypeLabels] = useState<Map<string, string>>(new Map());
	const [names, setNames] = useState<Map<string, string>>(new Map());
	const [detail, setDetail] = useState<HistoryRow | null>(null);

	useEffect(() => {
		if (!ready || !session) return;
		let active = true;
		const db = getBrowserClient();
		Promise.all([
			db.from('notification_history').select('id, type_key, title, body, sender_user_id, audience, sent_at').order('sent_at', { ascending: false }).limit(300),
			db.from('notification_types').select('key, label'),
			db.rpc('list_notifiable_members'),
		]).then(([{ data: history, error }, { data: types }, { data: members }]) => {
			if (!active) return;
			if (error) {
				toast.add({ title: 'Kon historie niet laden', description: error.message, type: 'error' });
				return;
			}
			setRows((history ?? []) as HistoryRow[]);
			setTypeLabels(new Map((types ?? []).map((t) => [t.key as string, t.label as string])));
			setNames(new Map((members ?? []).map((m) => [m.id as string, (m.username as string | null) ?? (m.id as string).slice(0, 8)])));
		});
		return () => {
			active = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ready, session]);

	if (!ready || !session) return fallback;

	const columns: DataTableColumn<HistoryRow>[] = [
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
					<span className="con-line-info">
						<span className="con-line-main">{r.body.slice(0, BODY_PREVIEW_LEN)}…</span>
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
		{ key: 'audience', header: 'Doelgroep', cell: (r) => audienceLabel(r.audience) },
	];

	return (
		<div className="inventory-tab">
			<DataTable columns={columns} data={rows} empty={{ title: 'Geen historie', description: 'Er zijn nog geen meldingen verstuurd.' }} />

			<Drawer open={detail !== null} onOpenChange={(open) => !open && setDetail(null)} title={detail?.title ?? 'Melding'} description={detail ? fmt(detail.sent_at) : undefined} size="28rem">
				{detail && <p>{detail.body}</p>}
			</Drawer>
		</div>
	);
};

export default NotificationHistory;
