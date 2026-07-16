'use client';

import Title from '@/components/basics/Title';
import Switch from '@/components/components/Switch';
import { PERMISSION_GROUPS } from '@/lib/auth/permission-groups';
import type { Permission } from '@/lib/auth/permissions';

type PermissionGroupsProps = {
	/** Permissies die de rol al geeft — getoond als 'via rol' (aan, niet-bewerkbaar) */
	roleGrants: ReadonlySet<Permission>;
	/** Per-persoon extra grants (user_permissions) — bewerkbaar */
	userGrants: ReadonlySet<Permission>;
	/** Zet/haal een per-persoon-grant */
	onToggle: (permission: Permission, on: boolean) => void;
	/** Alles alleen-lezen (bv. je eigen rij) */
	disabled?: boolean;
};

// Toont het permissie-vocabulaire gegroepeerd per domein met een Switch per permissie. Wat de rol al
// dekt staat als 'via rol' (aan + disabled); de rest is een per-persoon-toggle (additief bovenop de rol).
const PermissionGroups = ({ roleGrants, userGrants, onToggle, disabled = false }: PermissionGroupsProps) => {
	return (
		<div className="permission-groups">
			{PERMISSION_GROUPS.map((group) => (
				<section key={group.key} className="permission-group">
					<Title element="h3" size={6} value={group.title} />
					<ul className="permission-group-list">
						{group.permissions.map((permission) => {
							const viaRole = roleGrants.has(permission);
							return (
								<li key={permission} className="permission-row">
									<span className="permission-label">{permission}</span>
									{viaRole ? (
										<span className="permission-via-role">
											<Switch checked readOnly disabled aria-label={`${permission} (via rol)`} />
											<span className="permission-hint">via rol</span>
										</span>
									) : (
										<Switch
											checked={userGrants.has(permission)}
											disabled={disabled}
											aria-label={permission}
											onCheckedChange={(on) => onToggle(permission, on)}
										/>
									)}
								</li>
							);
						})}
					</ul>
				</section>
			))}
		</div>
	);
};

export default PermissionGroups;
