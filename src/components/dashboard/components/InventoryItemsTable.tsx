import StatusBadge from '@/components/basics/StatusBadge';
import DataTable, { type DataTableColumn } from '@/components/dashboard/components/DataTable';
import RowActions, { RowActionItems, type RowAction } from '@/components/dashboard/components/RowActions';
import type { PersonOption } from '@/components/dashboard/forms/PersonPicker';

export interface InventoryItem {
	id: string;
	name: string;
	owner_user_id: string | null;
	owner_label: string | null;
	quantity: number;
	value_eur: number | null;
	available: boolean;
	notes: string | null;
	archived_at: string | null;
}

const ownerName = (item: InventoryItem, users: PersonOption[]): string =>
	item.owner_user_id ? users.find((u) => u.id === item.owner_user_id)?.username ?? item.owner_user_id.slice(0, 8) : item.owner_label ?? '—';

interface InventoryItemsTableProps {
	items: InventoryItem[];
	users: PersonOption[];
	unavailTodayIds: Set<string>;
	pendingRequestIds: Set<string>;
	canHardDelete: boolean;
	empty: { title: string; description: string };
	onEdit: (item: InventoryItem) => void;
	onArchive: (id: string, archived: boolean) => void;
	onDelete: (item: InventoryItem) => void;
	onAvailability: (item: InventoryItem) => void;
}

/**
 * The inventory items table: name, owner, quantity, value, a derived availability badge (unavailable /
 * active window / available, plus an open-request dot) and per-row edit/archive/delete/availability
 * actions. Presentational — the caller owns the data, the availability sets and every mutation.
 */
const InventoryItemsTable = ({ items, users, unavailTodayIds, pendingRequestIds, canHardDelete, empty, onEdit, onArchive, onDelete, onAvailability }: InventoryItemsTableProps) => {
	// One action list per row, shared by the visible overflow menu and the row's right-click menu. Edit
	// (or Restore) stays a pinned button; the rest fold into "⋯"; delete carries the danger idiom.
	const actionsFor = (item: InventoryItem): RowAction[] => {
		const actions: RowAction[] = [];
		if (item.archived_at) {
			actions.push({ label: 'Herstellen', pinned: true, onClick: () => onArchive(item.id, false) });
		} else {
			actions.push({ label: 'Bewerk', pinned: true, onClick: () => onEdit(item) });
			actions.push({ label: 'Archiveren', onClick: () => onArchive(item.id, true) });
		}
		actions.push({ label: 'Beschikbaarheid', onClick: () => onAvailability(item) });
		if (canHardDelete) actions.push({ label: 'Verwijder', icon: 'trash', danger: true, onClick: () => onDelete(item) });
		return actions;
	};

	const columns: DataTableColumn<InventoryItem>[] = [
		{ key: 'name', header: 'Naam', sortable: true, sortValue: (item) => item.name, cell: (item) => item.name },
		{ key: 'owner', header: 'Eigenaar', sortable: true, sortValue: (item) => ownerName(item, users), cell: (item) => ownerName(item, users) },
		{ key: 'quantity', header: 'Aantal', align: 'center', sortable: true, sortValue: (item) => item.quantity, cell: (item) => String(item.quantity) },
		{
			key: 'value',
			header: 'Waarde',
			align: 'end',
			sortable: true,
			sortValue: (item) => item.value_eur ?? 0,
			cell: (item) => (item.value_eur !== null ? `€ ${item.value_eur.toFixed(2)}` : '—'),
		},
		{
			key: 'available',
			header: 'Beschikbaar',
			align: 'center',
			sortable: true,
			sortValue: (item) => (item.available ? 1 : 0),
			cell: (item) => {
				const status = !item.available ? (
					<StatusBadge domain="request" status="cancelled" label="Niet beschikbaar" />
				) : unavailTodayIds.has(item.id) ? (
					<StatusBadge domain="request" status="requested" label="Venster actief" />
				) : (
					<StatusBadge domain="request" status="active" label="Beschikbaar" />
				);
				return (
					<span className="inventory-avail-cell">
						{status}
						{pendingRequestIds.has(item.id) && <StatusBadge domain="request" status="requested" label="Verzoek open" dot />}
					</span>
				);
			},
		},
		{
			key: 'actions',
			header: '',
			align: 'end',
			cell: (item) => <RowActions actions={actionsFor(item)} />,
		},
	];

	return <DataTable columns={columns} data={items} empty={empty} rowContextMenu={(item) => <RowActionItems actions={actionsFor(item)} />} />;
};

export default InventoryItemsTable;
