'use client';

import { Toast } from '@base-ui/react/toast';
import { useEffect, useState } from 'react';

import Button from '@/components/basics/Button';
import Drawer from '@/components/components/Drawer';
import UnavailabilityWindowList, { type UnavailabilityWindow } from '@/components/dashboard/components/UnavailabilityWindowList';
import Field from '@/components/forms/Field';
import TextArea from '@/components/forms/TextArea';
import TextInput from '@/components/forms/TextInput';
import { getBrowserClient } from '@/lib/supabase/client';

type UnavailWindow = UnavailabilityWindow;
type ItemRef = { id: string; name: string };
type Props = { item: ItemRef | null; onClose: () => void; onChanged: () => void };

// Beheer van onbeschikbaarheidsvensters van één item (inventory.manage): lijst + toevoegen (direct actief)
// + goed-/afkeuren van verzoeken (decide_item_unavailability-RPC) + verwijderen.
const ItemAvailabilityDrawer = ({ item, onClose, onChanged }: Props) => {
	const toast = Toast.useToastManager();
	const [windows, setWindows] = useState<UnavailWindow[]>([]);
	const [refreshKey, setRefreshKey] = useState(0);
	const [starts, setStarts] = useState('');
	const [ends, setEnds] = useState('');
	const [reason, setReason] = useState('');

	// Reset lokale state zodra we naar een ander item wisselen (of sluiten): de drawer is één vaste
	// instance, dus zonder reset renderen we de vensters én actieknoppen van het vórige item onder de
	// nieuwe titel tot de nieuwe fetch binnen is — een klik daarin zou decide/remove op het verkeerde
	// item uitvoeren. Aanpassen-tijdens-render (i.p.v. een effect) is het aanbevolen React-patroon
	// hiervoor en behoudt de sluit-animatie (geen remount).
	const [shownItemId, setShownItemId] = useState<string | undefined>(item?.id);
	if (item?.id !== shownItemId) {
		setShownItemId(item?.id);
		setWindows([]);
		setStarts('');
		setEnds('');
		setReason('');
	}

	useEffect(() => {
		if (!item) return;
		let active = true;
		getBrowserClient()
			.from('item_unavailability')
			.select('id, starts_on, ends_on, reason, status')
			.eq('item_id', item.id)
			.order('starts_on', { ascending: false })
			.then(({ data, error }) => {
				if (!active) return;
				if (error) {
					toast.add({ title: 'Kon vensters niet laden', description: error.message, type: 'error' });
					return;
				}
				setWindows((data ?? []) as UnavailWindow[]);
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
					<UnavailabilityWindowList windows={windows} onDecide={decide} onRemove={removeWindow} />
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
