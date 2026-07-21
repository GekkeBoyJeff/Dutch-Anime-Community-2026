'use client';

import { Toast } from '@base-ui/react/toast';
import { useEffect, useMemo, useState } from 'react';

import Button from '@/components/basics/Button';
import Container from '@/components/basics/Container';
import Title from '@/components/basics/Title';
import ConfirmDialog from '@/components/components/ConfirmDialog';
import Drawer from '@/components/components/Drawer';
import FilterBar from '@/components/components/FilterBar';
import InventoryItemsTable, { type InventoryItem } from '@/components/dashboard/components/InventoryItemsTable';
import PersonPicker, { type PersonOption, type PersonValue } from '@/components/dashboard/forms/PersonPicker';
import ItemAvailabilityDrawer from '@/components/dashboard/inventory/ItemAvailabilityDrawer';
import Checkbox from '@/components/forms/Checkbox';
import Field from '@/components/forms/Field';
import TextArea from '@/components/forms/TextArea';
import TextInput from '@/components/forms/TextInput';
import { useDashboardGuard } from '@/hooks/useDashboardGuard';
import { getBrowserClient } from '@/lib/supabase/client';

type Item = InventoryItem;
interface ItemForm {
	id?: string;
	name: string;
	owner: PersonValue;
	quantity: string;
	value_eur: string;
	available: boolean;
	notes: string;
}

const EMPTY_ITEM: ItemForm = { name: '', owner: { userId: null, label: null }, quantity: '1', value_eur: '', available: true, notes: '' };

// Resolve an item's owner to a display name: a linked user's username, else the free-text label.
const ownerName = (item: Item, users: PersonOption[]): string =>
	item.owner_user_id ? users.find((u) => u.id === item.owner_user_id)?.username ?? item.owner_user_id.slice(0, 8) : item.owner_label ?? '—';

const InventoryManager = () => {
	const { ready, fallback, session, permissions } = useDashboardGuard('inventory.manage', { className: 'inventory', label: 'Inventaris laden' });

	const [users, setUsers] = useState<PersonOption[]>([]);
	const [items, setItems] = useState<Item[]>([]);
	const [unavail, setUnavail] = useState<{ item_id: string; starts_on: string; ends_on: string | null; status: string }[]>([]);
	const [availItem, setAvailItem] = useState<Item | null>(null);
	const [refreshKey, setRefreshKey] = useState(0);
	const [itemForm, setItemForm] = useState<ItemForm | null>(null);
	const toast = Toast.useToastManager();
	const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
	const [itemSearch, setItemSearch] = useState('');
	const [itemFilter, setItemFilter] = useState('');
	const [showArchivedItems, setShowArchivedItems] = useState(false);

	useEffect(() => {
		if (!ready || !session) return;
		let active = true;
		const db = getBrowserClient();
		Promise.all([
			db.from('profiles').select('id, username').order('username'),
			db.from('inventory_items').select('*').order('name'),
			db.from('item_unavailability').select('item_id, starts_on, ends_on, status').in('status', ['active', 'requested']),
		]).then((res) => {
			if (!active) return;
			// Fout op één van de queries niet stil inslikken tot een misleidend lege tabel — toon 'm.
			const failed = res.find((r) => r.error)?.error;
			if (failed) {
				toast.add({ title: 'Kon inventaris niet laden', description: failed.message, type: 'error' });
				return;
			}
			const [{ data: profiles }, { data: itemRows }, { data: unavailRows }] = res;
			setUsers((profiles ?? []) as PersonOption[]);
			setItems((itemRows ?? []) as Item[]);
			setUnavail((unavailRows ?? []) as { item_id: string; starts_on: string; ends_on: string | null; status: string }[]);
		});
		return () => {
			active = false;
		};
	}, [ready, session, refreshKey]);

	const saveItem = async () => {
		if (!itemForm || !session) return;
		const payload = {
			...(itemForm.id ? { id: itemForm.id } : {}),
			name: itemForm.name.trim(),
			owner_user_id: itemForm.owner.userId,
			owner_label: itemForm.owner.userId ? null : itemForm.owner.label,
			quantity: Number(itemForm.quantity) || 1,
			value_eur: itemForm.value_eur ? Number(itemForm.value_eur) : null,
			available: itemForm.available,
			notes: itemForm.notes.trim() || null,
			created_by: session.user.id,
		};
		if (!payload.name) {
			toast.add({ title: 'Naam is verplicht.', type: 'error' });
			return;
		}
		const { error: err } = await getBrowserClient().from('inventory_items').upsert(payload);
		if (err) {
			toast.add({ title: 'Er ging iets mis', description: err.message, type: 'error' });
			return;
		}
		setItemForm(null);
		setRefreshKey((key) => key + 1);
		toast.add({ title: 'Item opgeslagen', type: 'success' });
	};

	// Archiveren (omkeerbaar) is de normale "weg"-actie voor iedereen met manage; hard delete is admin-only.
	const archiveItem = async (id: string, archived: boolean) => {
		const { error: err } = await getBrowserClient()
			.from('inventory_items')
			.update({ archived_at: archived ? new Date().toISOString() : null, archived_by: archived ? session?.user.id ?? null : null })
			.eq('id', id);
		if (err) {
			toast.add({ title: 'Er ging iets mis', description: err.message, type: 'error' });
			return;
		}
		setRefreshKey((key) => key + 1);
		toast.add({ title: archived ? 'Item gearchiveerd' : 'Item hersteld', type: 'success' });
	};

	// Hard delete via de records.delete-gated RPC: die geeft de storage-paden terug die verweesd raken,
	// waarna de client ze via de Storage-API opruimt (Postgres kan het S3-object niet zelf wissen).
	const hardDeleteItem = async (id: string) => {
		const db = getBrowserClient();
		const { data, error: err } = await db.rpc('hard_delete', { target_table: 'inventory_items', target_id: id });
		if (err) {
			toast.add({ title: 'Er ging iets mis', description: err.message, type: 'error' });
			return;
		}
		for (const row of (data ?? []) as { bucket_id: string; path: string }[]) {
			if (row.path) await db.storage.from(row.bucket_id).remove([row.path]);
		}
		setRefreshKey((key) => key + 1);
		toast.add({ title: 'Item definitief verwijderd', type: 'success' });
	};

	// Effectieve beschikbaarheid = available én geen ACTIEF venster vandaag (spiegelt item_available_on);
	// een requested-venster markeert een openstaand verzoek, geen onbeschikbaarheid.
	const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
	const unavailTodayIds = useMemo(
		() => new Set(unavail.filter((u) => u.status === 'active' && u.starts_on <= today && (u.ends_on === null || u.ends_on >= today)).map((u) => u.item_id)),
		[unavail, today],
	);
	const pendingRequestIds = useMemo(() => new Set(unavail.filter((u) => u.status === 'requested').map((u) => u.item_id)), [unavail]);

	const filteredItems = useMemo(() => {
		const q = itemSearch.trim().toLowerCase();
		return items.filter((item) => {
			const matchesSearch = q === '' || item.name.toLowerCase().includes(q) || ownerName(item, users).toLowerCase().includes(q);
			const effectiveAvailable = item.available && !unavailTodayIds.has(item.id);
			const matchesFilter =
				itemFilter === '' ||
				(itemFilter === 'available'
					? effectiveAvailable
					: itemFilter === 'pending'
						? pendingRequestIds.has(item.id)
						: !effectiveAvailable);
			const matchesArchived = showArchivedItems || item.archived_at === null;
			return matchesSearch && matchesFilter && matchesArchived;
		});
	}, [items, users, itemSearch, itemFilter, showArchivedItems, unavailTodayIds, pendingRequestIds]);

	if (!ready || !session) return fallback;

	const canHardDelete = permissions.has('records.delete');


	return (
		<Container className="inventory">
			<Title size={2}>Inventaris</Title>

			<div className="inventory-tab">
				<div className="inventory-toolbar">
					<FilterBar
						filters={[
							{ label: 'Alle', value: '' },
							{ label: 'Beschikbaar', value: 'available' },
							{ label: 'Niet beschikbaar', value: 'unavailable' },
							{ label: 'Openstaande verzoeken', value: 'pending' },
						]}
						value={itemFilter}
						onValueChange={setItemFilter}
						label="Filter items"
						filterIcon="filter"
						searchable
						searchValue={itemSearch}
						onSearchValueChange={setItemSearch}
						searchPlaceholder="Zoek op naam of eigenaar…"
						searchLabel="Zoek item"
					/>
					<Button variant="primary" icon="plus" onClick={() => setItemForm({ ...EMPTY_ITEM })}>
						Nieuw item
					</Button>
					<Checkbox checked={showArchivedItems} onCheckedChange={(v) => setShowArchivedItems(v)} label="Toon gearchiveerd" />
				</div>
				<InventoryItemsTable
					items={filteredItems}
					users={users}
					unavailTodayIds={unavailTodayIds}
					pendingRequestIds={pendingRequestIds}
					canHardDelete={canHardDelete}
					empty={{
						title: 'Geen items gevonden',
						description: itemSearch || itemFilter ? 'Pas je zoekopdracht of filter aan.' : 'Voeg je eerste item toe.',
					}}
					onEdit={(item) =>
						setItemForm({
							id: item.id,
							name: item.name,
							owner: { userId: item.owner_user_id, label: item.owner_label },
							quantity: String(item.quantity),
							value_eur: item.value_eur?.toString() ?? '',
							available: item.available,
							notes: item.notes ?? '',
						})
					}
					onArchive={archiveItem}
					onDelete={(item) => setItemToDelete(item)}
					onAvailability={(item) => setAvailItem(item)}
				/>
			</div>

			<Drawer
				open={itemForm !== null}
				onOpenChange={(open) => !open && setItemForm(null)}
				title={itemForm?.id ? 'Item bewerken' : 'Nieuw item'}
				size="30rem"
				footer={
					<>
						<Button variant="secondary" onClick={() => setItemForm(null)}>
							Annuleren
						</Button>
						<Button variant="primary" onClick={saveItem}>
							Opslaan
						</Button>
					</>
				}
			>
				{itemForm && (
					<div className="inventory-form">
						<Field name="name">
							<Field.Label>Naam</Field.Label>
							<TextInput value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.currentTarget.value })} />
						</Field>
						<PersonPicker labelText="Eigenaar" users={users} value={itemForm.owner} onChange={(owner) => setItemForm({ ...itemForm, owner })} />
						<Field name="quantity">
							<Field.Label>Aantal</Field.Label>
							<TextInput type="number" value={itemForm.quantity} onChange={(e) => setItemForm({ ...itemForm, quantity: e.currentTarget.value })} />
						</Field>
						<Field name="value">
							<Field.Label>Waarde (€)</Field.Label>
							<TextInput type="number" value={itemForm.value_eur} onChange={(e) => setItemForm({ ...itemForm, value_eur: e.currentTarget.value })} />
						</Field>
						<Checkbox checked={itemForm.available} onCheckedChange={(available) => setItemForm({ ...itemForm, available })} label="Beschikbaar" />
						<Field name="notes">
							<Field.Label>Notities</Field.Label>
							<TextArea value={itemForm.notes} onChange={(e) => setItemForm({ ...itemForm, notes: e.currentTarget.value })} />
						</Field>
					</div>
				)}
			</Drawer>

			<ItemAvailabilityDrawer item={availItem} onClose={() => setAvailItem(null)} onChanged={() => setRefreshKey((key) => key + 1)} />

			<ConfirmDialog
				open={itemToDelete !== null}
				onOpenChange={(open) => !open && setItemToDelete(null)}
				title="Item definitief verwijderen?"
				description={itemToDelete ? `"${itemToDelete.name}" en gekoppelde bestanden worden onherstelbaar verwijderd.` : undefined}
				confirmLabel="Definitief verwijderen"
				destructive
				onConfirm={() => {
					if (itemToDelete) hardDeleteItem(itemToDelete.id);
					setItemToDelete(null);
				}}
			/>
		</Container>
	);
};

export default InventoryManager;
