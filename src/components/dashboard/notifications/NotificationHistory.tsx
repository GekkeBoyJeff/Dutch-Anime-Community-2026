'use client';

import { Toast } from '@base-ui/react/toast';
import { useEffect, useState } from 'react';

import { recallRowCount } from '@/components/dashboard/components/DataTableSkeleton';
import NotificationHistoryTable, { type NotificationHistoryRow } from '@/components/dashboard/components/NotificationHistoryTable';
import { useDashboardGuard } from '@/hooks/useDashboardGuard';
import { getBrowserClient } from '@/lib/supabase/client';
import type { Json } from '@/types/database.types';

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
	const [rows, setRows] = useState<NotificationHistoryRow[] | null>(null);
	const [typeLabels, setTypeLabels] = useState<Map<string, string>>(new Map());
	const [names, setNames] = useState<Map<string, string>>(new Map());
	const [skeletonCount] = useState(() => recallRowCount('notification-history', 8));

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
			setRows((history ?? []) as NotificationHistoryRow[]);
			setTypeLabels(new Map((types ?? []).map((t) => [t.key as string, t.label as string])));
			setNames(new Map((members ?? []).map((m) => [m.id as string, (m.username as string | null) ?? (m.id as string).slice(0, 8)])));
		});
		return () => {
			active = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ready, session]);

	if (!ready || !session) return fallback;

	return (
		<div className="inventory-tab">
			<NotificationHistoryTable rows={rows} loading={rows === null} typeLabels={typeLabels} names={names} formatAudience={audienceLabel} skeletonRows={skeletonCount} />
		</div>
	);
};

export default NotificationHistory;
