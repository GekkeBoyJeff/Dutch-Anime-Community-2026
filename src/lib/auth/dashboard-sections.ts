import type { Permission } from '@/lib/auth/permissions';

// permission → dashboard section registry. The dashboard renders a section only when the user's
// effective permissions contain its `permission`, so a user granted a single permission sees a
// one-section dashboard — nothing meant for other roles leaks in. The same permission also guards the
// section's data via authorize() in RLS, so a hidden section is genuinely inaccessible, not just hidden.
export interface DashboardSection {
	key: string;
	title: string;
	/** Short label for the beheer nav; `title` is the fuller hub-card heading */
	navLabel: string;
	description: string;
	href: string;
	permission: Permission;
}

export const DASHBOARD_SECTIONS: DashboardSection[] = [
	{ key: 'builder', title: 'Pagina-editor', navLabel: "Pagina's", description: "Bewerk pagina's met de visuele builder.", href: '/builder', permission: 'pages.edit' },
	{ key: 'media', title: 'Media', navLabel: 'Media', description: 'Upload en beheer afbeeldingen.', href: '/upload', permission: 'media.manage' },
	{ key: 'access', title: 'Toegangsbeheer', navLabel: 'Toegang', description: 'Ken rollen en permissies toe aan gebruikers.', href: '/dashboard/access', permission: 'roles.manage' },
	{ key: 'inventory', title: 'Inventory & conventies', navLabel: 'Inventory', description: 'Beheer items, conventies, toewijzingen en tickets.', href: '/dashboard/inventory', permission: 'inventory.manage' },
	{ key: 'my-inventory', title: 'Mijn inventory & conventies', navLabel: 'Mijn spullen', description: 'Je eigen items en wat je moet meenemen.', href: '/dashboard/my-inventory', permission: 'inventory.view' },
	// Eén route: tab "Mijn declaraties" (expenses.view) + tab "Beheer" die alleen verschijnt bij expenses.manage.
	{ key: 'expenses', title: 'Declaraties', navLabel: 'Declaraties', description: 'Dien kosten in met bon en beoordeel declaraties.', href: '/dashboard/expenses', permission: 'expenses.view' },
	{ key: 'moderation', title: 'Moderatie', navLabel: 'Moderatie', description: 'Profielen, warnings, links en bans.', href: '/dashboard/moderation', permission: 'moderation.view' },
	{ key: 'logs', title: 'Logs', navLabel: 'Logs', description: 'Activiteit en audit-trail van het beheer.', href: '/dashboard/logs', permission: 'logs.view' },
];
