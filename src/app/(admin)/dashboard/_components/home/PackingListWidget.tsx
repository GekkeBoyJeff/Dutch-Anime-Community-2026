'use client';

import { Toast } from '@base-ui/react/toast';
import { useState } from 'react';

import Switch from '@/components/components/Switch';
import { getBrowserClient } from '@/lib/supabase/client';

import type { WidgetProps } from './types';
import { useWidgetData } from './useWidgetData';
import WidgetShell from './WidgetShell';

interface PackItem {
	id: string;
	itemName: string;
	quantity: number;
	packed: boolean;
}

// Checkable packing list for the next upcoming convention you must bring items to. Same data +
// mutation as MyInventory's "Ingepakt" toggle (event_item_assignments + set_packed RPC). The toggle is
// optimistic: flip locally, sync in the background, reconcile (revert + toast) only on error.
const PackingListWidget = ({ session }: WidgetProps) => {
	const toast = Toast.useToastManager();
	const [overrides, setOverrides] = useState<Record<string, boolean>>({});

	const { loading, error, data } = useWidgetData(async (db) => {
		const today = new Date().toISOString().slice(0, 10);
		const [assignments, events, names] = await Promise.all([
			db.from('event_item_assignments').select('id, event_id, item_id, quantity, packed_at').eq('assigned_user_id', session.user.id).eq('expected_to_bring', true),
			db.from('events').select('id, name, starts_on').is('archived_at', null),
			db.rpc('my_assignment_item_names'),
		]);
		if (assignments.error) throw assignments.error;
		if (events.error) throw events.error;

		const rows = assignments.data ?? [];
		if (rows.length === 0) return null;

		// The soonest convention (starting today or later) that has items assigned to me.
		const eventById = new Map((events.data ?? []).map((e) => [e.id, e]));
		const assignedEventIds = new Set(rows.map((r) => r.event_id));
		const next = (events.data ?? [])
			.filter((e) => assignedEventIds.has(e.id) && e.starts_on !== null && e.starts_on >= today)
			.sort((a, b) => (a.starts_on! < b.starts_on! ? -1 : 1))[0];
		if (!next) return null;

		const nameById = new Map(((names.data ?? []) as { item_id: string; name: string }[]).map((n) => [n.item_id, n.name]));
		const items: PackItem[] = rows
			.filter((r) => r.event_id === next.id)
			.map((r) => ({ id: r.id, itemName: nameById.get(r.item_id) ?? r.item_id.slice(0, 8), quantity: r.quantity, packed: r.packed_at !== null }));

		return { eventName: eventById.get(next.id)?.name ?? next.name, items };
	});

	// set_packed is a SECURITY DEFINER RPC (a view-only holder may not UPDATE the assignment directly).
	const togglePacked = async (id: string, current: boolean) => {
		setOverrides((prev) => ({ ...prev, [id]: !current }));
		const { error: mutationError } = await getBrowserClient().rpc('set_packed', { assignment_id: id, packed: !current });
		if (mutationError) {
			setOverrides((prev) => ({ ...prev, [id]: current }));
			toast.add({ title: 'Kon inpakstatus niet opslaan', description: mutationError.message, type: 'error' });
		}
	};

	return (
		<WidgetShell
			title="Inpaklijst"
			href="/dashboard/my-inventory"
			linkLabel="Naar mijn conventies"
			loading={loading}
			error={error}
			isEmpty={!data}
			hideWhenEmpty
		>
			{data && (
				<>
					<p className="widget-lead-sub">{data.eventName}</p>
					<ul className="widget-list">
						{data.items.map((item) => {
							const packed = overrides[item.id] ?? item.packed;
							return (
								<li key={item.id} className="widget-check">
									<Switch checked={packed} aria-label={`${item.itemName} ingepakt`} onCheckedChange={() => togglePacked(item.id, packed)} />
									<span className="widget-check-label">
										{item.itemName}
										{item.quantity > 1 ? ` × ${item.quantity}` : ''}
									</span>
								</li>
							);
						})}
					</ul>
				</>
			)}
		</WidgetShell>
	);
};

export default PackingListWidget;
