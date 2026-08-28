'use client';

import Title from '@/components/basics/Title';
import Switch from '@/components/components/Switch';
import { PERMISSION_GROUPS } from '@/lib/shared/auth/permission-groups';
import type { Permission } from '@/lib/shared/auth/permissions';

type PermissionGroupsProps = {
	/** The person's complete, editable permission set (user_permissions) */
	grants: ReadonlySet<Permission>;
	/** Turns a single permission on or off */
	onToggle: (permission: Permission, on: boolean) => void;
	/** Renders everything read-only (own row, or an admin target) */
	disabled?: boolean;
};

const PermissionGroups = ({
	grants,
	onToggle,
	disabled = false,
}: PermissionGroupsProps) => {
	return (
		<div className="permission-groups">
			{PERMISSION_GROUPS.map((group) => (
				<section key={group.key} className="permission-groups-permission-group">
					<Title element="h3" size={6} value={group.title} />
					<ul className="permission-groups-permission-group-list">
						{group.permissions.map((permission) => (
							<li key={permission} className="permission-groups-permission-row">
								<span className="permission-groups-permission-label">{permission}</span>
								<Switch
									checked={grants.has(permission)}
									disabled={disabled}
									ariaLabel={permission}
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
