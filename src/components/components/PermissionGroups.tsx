'use client';

import Title from '@/components/basics/Title';
import Switch from '@/components/components/Switch';
import { PERMISSION_GROUPS } from '@/lib/auth/permission-groups';
import type { Permission } from '@/lib/auth/permissions';

type PermissionGroupsProps = {
	/** De volledige permissieset van de persoon (user_permissions) — bewerkbaar */
	grants: ReadonlySet<Permission>;
	/** Zet/haal een permissie */
	onToggle: (permission: Permission, on: boolean) => void;
	/** Alles alleen-lezen (eigen rij of admin-doelwit) */
	disabled?: boolean;
};

// Toont het permissie-vocabulaire gegroepeerd per domein met een Switch per permissie — de volledige,
// per-persoon effectieve set (er is geen additief rol-bundel meer: user_permissions IS de set).
const PermissionGroups = ({ grants, onToggle, disabled = false }: PermissionGroupsProps) => {
	return (
		<div className="permission-groups">
			{PERMISSION_GROUPS.map((group) => (
				<section key={group.key} className="permission-group">
					<Title element="h3" size={6} value={group.title} />
					<ul className="permission-group-list">
						{group.permissions.map((permission) => (
							<li key={permission} className="permission-row">
								<span className="permission-label">{permission}</span>
								<Switch
									checked={grants.has(permission)}
									disabled={disabled}
									aria-label={permission}
									onCheckedChange={(on) => onToggle(permission, on)}
								/>
							</li>
						))}
					</ul>
				</section>
			))}
		</div>
	);
};

export default PermissionGroups;
