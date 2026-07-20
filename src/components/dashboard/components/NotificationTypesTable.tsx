import Switch from '@/components/components/Switch';
import DataTable, { type DataTableColumn } from '@/components/dashboard/components/DataTable';
import DataTableSkeleton from '@/components/dashboard/components/DataTableSkeleton';

export interface NotificationTypeRow {
	key: string;
	label: string;
	description: string | null;
	enabled: boolean;
}

interface NotificationTypesTableProps {
	rows: NotificationTypeRow[] | null;
	loading: boolean;
	onToggle: (row: NotificationTypeRow) => void;
}

/**
 * The notification-type toggle table: label, description and an on/off Switch per type. Presentational —
 * the caller supplies the rows and handles the toggle mutation.
 */
const NotificationTypesTable = ({ rows, loading, onToggle }: NotificationTypesTableProps) => {
	const columns: DataTableColumn<NotificationTypeRow>[] = [
		{ key: 'label', header: 'Type', cell: (r) => r.label },
		{ key: 'description', header: 'Omschrijving', cell: (r) => r.description ?? '—' },
		{
			key: 'enabled',
			header: 'Aan',
			align: 'center',
			cell: (r) => <Switch checked={r.enabled} onCheckedChange={() => onToggle(r)} aria-label={`${r.label} in-/uitschakelen`} />,
		},
	];

	if (loading || rows === null) {
		return <DataTableSkeleton columns={[{ header: 'Type' }, { header: 'Omschrijving' }, { header: 'Aan', align: 'center' }]} rows={3} />;
	}

	return (
		<div className="reveal">
			<DataTable columns={columns} data={rows} empty={{ title: 'Geen meldingstypes', description: 'Er zijn nog geen types geconfigureerd.' }} />
		</div>
	);
};

export default NotificationTypesTable;
