import Badge from '@/components/basics/Badge';
import Button from '@/components/basics/Button';
import StatusBadge from '@/components/basics/StatusBadge';
import DataTable, { type DataTableColumn } from '@/components/dashboard/components/DataTable';
import DataTableSkeleton from '@/components/dashboard/components/DataTableSkeleton';
import Select from '@/components/forms/Select';
import { APP_ROLES, type Permission } from '@/lib/auth/permissions';

export interface AccessRow {
	id: string;
	username: string | null;
	role: string;
	grants: Set<Permission>;
}

const roleOptions = APP_ROLES.map((role) => ({ value: role, label: role }));
const nameOf = (row: AccessRow) => row.username ?? row.id.slice(0, 8);
const SKELETON_COLUMNS = [{ header: 'Gebruiker' }, { header: 'Rol' }, { header: 'Uitzonderingen' }, { header: '', align: 'end' as const }];

interface AccessMatrixTableProps {
	rows: AccessRow[];
	loading: boolean;
	selfId: string;
	roleGrants: Map<string, Set<Permission>>;
	/** Rijen (admin-ids + de eigen id) waarvan de rol niet via de app wijzigbaar is (admin-slot) */
	lockedIds: ReadonlySet<string>;
	empty: { title: string; description: string };
	onSetRole: (userId: string, role: string) => void;
	onOpenUser: (userId: string) => void;
}

/**
 * The access-control users table: username, an inline role select, an exceptions badge and a "Beheer"
 * action. Exceptions count the symmetric difference with the role preset — grants the role doesn't
 * cover, plus preset grants this user was stripped of. Rows in
 * `lockedIds` (admins + the caller's own row) show the role as a static chip instead of a selector,
 * matching the RLS admin-slot. Presentational — the caller owns the data and writes.
 */
const AccessMatrixTable = ({ rows, loading, selfId, roleGrants, lockedIds, empty, onSetRole, onOpenUser }: AccessMatrixTableProps) => {
	const exceptionsOf = (row: AccessRow) => {
		const preset = roleGrants.get(row.role);
		const additions = [...row.grants].filter((p) => !preset?.has(p)).length;
		const removals = preset ? [...preset].filter((p) => !row.grants.has(p)).length : 0;
		return additions + removals;
	};

	const columns: DataTableColumn<AccessRow>[] = [
		{ key: 'user', header: 'Gebruiker', sortable: true, sortValue: (row) => nameOf(row), cell: (row) => nameOf(row) },
		{
			key: 'role',
			header: 'Rol',
			sortable: true,
			sortValue: (row) => row.role,
			cell: (row) =>
				row.id === selfId || lockedIds.has(row.id) ? (
					<Badge variant="neutral">{row.role}</Badge>
				) : (
					<Select
						native
						className="access-role-select"
						aria-label={`Rol voor ${nameOf(row)}`}
						value={row.role}
						options={roleOptions}
						onValueChange={(value) => onSetRole(row.id, value as string)}
					/>
				),
		},
		{
			key: 'exceptions',
			header: 'Uitzonderingen',
			sortable: true,
			sortValue: (row) => exceptionsOf(row),
			cell: (row) => {
				const count = exceptionsOf(row);
				return count === 0 ? (
					<span className="access-default">standaard</span>
				) : (
					<StatusBadge domain="request" status="requested" label={`+${count} uitzondering${count === 1 ? '' : 'en'}`} />
				);
			},
		},
		{
			key: 'actions',
			header: '',
			align: 'end',
			cell: (row) => (
				<Button variant="secondary" onClick={() => onOpenUser(row.id)}>
					Beheer
				</Button>
			),
		},
	];

	if (loading) return <DataTableSkeleton columns={SKELETON_COLUMNS} storageKey="access" />;

	return (
		<div className="media-reveal">
			<DataTable columns={columns} data={rows} pageSize={20} empty={empty} />
		</div>
	);
};

export default AccessMatrixTable;
