'use client';

import { Toast } from '@base-ui/react/toast';
import { useEffect, useState } from 'react';

import Badge from '@/components/basics/Badge';
import Button from '@/components/basics/Button';
import Drawer from '@/components/components/Drawer';
import Field from '@/components/forms/Field';
import TextArea from '@/components/forms/TextArea';
import TextInput from '@/components/forms/TextInput';
import { getBrowserClient } from '@/lib/supabase/client';

type UnavailWindow = { id: string; starts_on: string; ends_on: string | null; reason: string | null; status: string };
type ItemRef = { id: string; name: string };
type Props = { item: ItemRef | null; onClose: () => void; onChanged: () => void };

const UNAVAIL_META: Record<string, { label: string; variant: 'warning' | 'info' | 'neutral' }> = {
	active: { label: 'Actief', variant: 'warning' },
	requested: { label: 'Aangevraagd', variant: 'info' },
	rejected: { label: 'Afgewezen', variant: 'neutral' },
};

// Beheer van onbeschikbaarheidsvensters van één item (inventory.manage): lijst + toevoegen (direct actief)
// + goed-/afkeuren van verzoeken (decide_item_unavailability-RPC) + verwijderen.
const ItemAvailabilityDrawer = ({ item, onClose, onChanged }: Props) => {
	const toast = Toast.useToastManager();
	const [windows, setWindows] = useState<UnavailWindow[]>([]);
	const [refreshKey, setRefreshKey] = useState(0);
	const [starts, setStarts] = useState('');
	const [ends, setEnds] = useState('');
	const [reason, setReason] = useState('');

	useEffect(() => {
		if (!item) return;
		let active = true;
		getBrowserClient()
			.from('item_unavailability')
			.select('id, starts_on, ends_on, reason, status')
			.eq('item_id', item.id)
			.order('starts_on', { ascending: false })
			.then(({ data }) => {
				if (active) setWindows((data ?? []) as UnavailWindow[]);
			});
		return () => {
			active = false;
		};
	}, [item, refreshKey]);

	const refresh = () => {
		setRefreshKey((k) => k + 1);
		onChanged();
	};

	const addWindow = async () => {
		if (!item || !starts) {
			toast.add({ title: 'Startdatum is verplicht.', type: 'error' });
			return;
		}
		const { error } = await getBrowserClient()
			.from('item_unavailability')
			.insert({ item_id: item.id, starts_on: starts, ends_on: ends || null, reason: reason.trim() || null, status: 'active' });
		if (error) {
			toast.add({ title: 'Er ging iets mis', description: error.message, type: 'error' });
			return;
		}
		setStarts('');
		setEnds('');
		setReason('');
		refresh();
		toast.add({ title: 'Venster toegevoegd', type: 'success' });
	};

	const decide = async (id: string, approve: boolean) => {
		const { error } = await getBrowserClient().rpc('decide_item_unavailability', { p_id: id, p_approve: approve });
		if (error) {
			toast.add({ title: 'Er ging iets mis', description: error.message, type: 'error' });
			return;
		}
		refresh();
		toast.add({ title: approve ? 'Goedgekeurd' : 'Afgewezen', type: 'success' });
	};

	const removeWindow = async (id: string) => {
		const { error } = await getBrowserClient().from('item_unavailability').delete().eq('id', id);
		if (error) {
			toast.add({ title: 'Er ging iets mis', description: error.message, type: 'error' });
			return;
		}
		refresh();
		toast.add({ title: 'Venster verwijderd', type: 'success' });
	};

	return (
		<Drawer
			open={item !== null}
			onOpenChange={(o) => !o && onClose()}
			title={item ? `Beschikbaarheid — ${item.name}` : 'Beschikbaarheid'}
			size="30rem"
			footer={
				<Button variant="secondary" onClick={onClose}>
					Sluiten
				</Button>
			}
		>
			{item && (
				<div className="inventory-form">
					<ul className="con-list">
						{windows.length === 0 && <li className="con-note">Geen onbeschikbaarheidsvensters.</li>}
						{windows.map((w) => (
							<li key={w.id} className="con-line">
								<div className="con-line-info">
									<span className="con-line-main">
										{w.starts_on} – {w.ends_on ?? 'onbepaald'}
									</span>
									{w.reason && <span className="con-note">{w.reason}</span>}
								</div>
								<div className="con-line-actions">
									<Badge variant={UNAVAIL_META[w.status]?.variant ?? 'neutral'}>{UNAVAIL_META[w.status]?.label ?? w.status}</Badge>
									{w.status === 'requested' && (
										<>
											<Button variant="primary" onClick={() => decide(w.id, true)}>
												Goedkeuren
											</Button>
											<Button variant="ghost" onClick={() => decide(w.id, false)}>
												Afwijzen
											</Button>
										</>
									)}
									<Button variant="ghost" icon="trash" onClick={() => removeWindow(w.id)}>
										Verwijder
									</Button>
								</div>
							</li>
						))}
					</ul>
					<Field name="starts">
						<Field.Label>Onbeschikbaar vanaf</Field.Label>
						<TextInput type="date" value={starts} onChange={(e) => setStarts(e.currentTarget.value)} />
					</Field>
					<Field name="ends">
						<Field.Label>Tot (leeg = onbepaald)</Field.Label>
						<TextInput type="date" value={ends} onChange={(e) => setEnds(e.currentTarget.value)} />
					</Field>
					<Field name="reason">
						<Field.Label>Reden</Field.Label>
						<TextArea value={reason} onChange={(e) => setReason(e.currentTarget.value)} />
					</Field>
					<Button variant="primary" onClick={addWindow}>
						Venster toevoegen
					</Button>
				</div>
			)}
		</Drawer>
	);
};

export default ItemAvailabilityDrawer;
