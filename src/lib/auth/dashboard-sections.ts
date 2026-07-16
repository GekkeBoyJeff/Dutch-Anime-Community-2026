import type { Permission } from '@/lib/auth/permissions';

// permission → dashboard section registry. The dashboard renders a section only when the user's
// effective permissions contain its `permission`, so a user granted a single permission sees a
// one-section dashboard — nothing meant for other roles leaks in. The same permission also guards the
// section's data via authorize() in RLS, so a hidden section is genuinely inaccessible, not just hidden.
export interface DashboardSection {
	key: string;
	title: string;
	description: string;
	href: string;
	permission: Permission;
}

export const DASHBOARD_SECTIONS: DashboardSection[] = [
	{ key: 'builder', title: 'Pagina-editor', description: "Bewerk pagina's met de visuele builder.", href: '/builder', permission: 'pages.edit' },
	{ key: 'media', title: 'Media', description: 'Upload en beheer afbeeldingen.', href: '/upload', permission: 'media.manage' },
	{ key: 'access', title: 'Toegangsbeheer', description: 'Ken rollen en permissies toe aan gebruikers.', href: '/dashboard/access', permission: 'roles.manage' },
	// Future: a moderation panel gated on 'moderation.view'.
];
