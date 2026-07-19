'use client';

import { Toast } from '@base-ui/react/toast';
import { useEffect, useState } from 'react';

import Content from '@/components/basics/Content';
import DataTable, { type DataTableColumn } from '@/components/components/DataTable';
import Switch from '@/components/components/Switch';
import { useDashboardGuard } from '@/hooks/useDashboardGuard';
import { getBrowserClient } from '@/lib/supabase/client';

interface TypeRow {
	key: string;
	label: string;
	description: string | null;
	enabled: boolean;
}

// Type-configuratie (notifications.send): enkel de enabled-vlag bewerken, geen create/delete — de seeds
// (handmatige-melding, shift-reminder-30/-5) volstaan, het systeem kent ze bij key.
const NotificationTypes = () => {
	const { ready, fallback, session } = useDashboardGuard('notifications.send', { className: 'inventory', label: 'Types laden' });
	const toast = Toast.useToastManager();
	const [rows, setRows] = useState<TypeRow[]>([]);
	const [refreshKey, setRefreshKey] = useState(0);

	useEffect(() => {
		if (!ready || !session) return;
		let active = true;
		getBrowserClient()
			.from('notification_types')
			.select('key, label, description, enabled')
			.order('key')
			.then(({ data, error }) => {
				if (!active) return;
				if (error) {
					toast.add({ title: 'Kon types niet laden', description: error.message, type: 'error' });
					return;
				}
				setRows((data ?? []) as TypeRow[]);
			});
		return () => {
			active = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ready, session, refreshKey]);

	if (!ready || !session) return fallback;

	const toggleEnabled = async (row: TypeRow) => {
		const { error } = await getBrowserClient().from('notification_types').update({ enabled: !row.enabled }).eq('key', row.key);
		if (error) {
			toast.add({ title: 'Er ging iets mis', description: error.message, type: 'error' });
			return;
		}
		setRefreshKey((k) => k + 1);
		toast.add({ title: row.enabled ? 'Type uitgeschakeld' : 'Type ingeschakeld', type: 'success' });
	};

	const columns: DataTableColumn<TypeRow>[] = [
		{ key: 'label', header: 'Type', cell: (r) => r.label },
		{ key: 'description', header: 'Omschrijving', cell: (r) => r.description ?? '—' },
		{
			key: 'enabled',
			header: 'Aan',
			align: 'center',
			cell: (r) => <Switch checked={r.enabled} onCheckedChange={() => toggleEnabled(r)} aria-label={`${r.label} in-/uitschakelen`} />,
		},
	];

	return (
		<div className="inventory-tab">
			<DataTable columns={columns} data={rows} empty={{ title: 'Geen meldingstypes', description: 'Er zijn nog geen types geconfigureerd.' }} />
			<Content element="p" className="con-note">
				Een uitgeschakeld type wordt niet meer verstuurd — shift-herinneringen respecteren deze vlag al in de scheduler.
			</Content>
		</div>
	);
};

export default NotificationTypes;
