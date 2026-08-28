import type { Permission } from '@/lib/shared/auth/permissions';

// Een permissie die hier in geen enkele groep staat, is in het Toegang-scherm niet toe te kennen: voeg
// elke nieuwe permissie uit APP_PERMISSIONS hier aan de juiste groep toe.
export interface PermissionGroup {
	key: string;
	title: string;
	permissions: Permission[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
	{ key: 'pages', title: "Pagina's & CMS", permissions: ['pages.create', 'pages.edit', 'pages.delete', 'structures.edit'] },
	{ key: 'site', title: 'Site publiceren', permissions: ['site.publish_staging', 'site.approve'] },
	{ key: 'media', title: 'Media', permissions: ['media.upload', 'media.delete'] },
	{ key: 'moderation', title: 'Moderatie', permissions: ['moderation.view', 'moderation.manage'] },
	{ key: 'access', title: 'Toegang', permissions: ['roles.manage'] },
	{ key: 'events', title: 'Conventies & events', permissions: ['events.view', 'events.manage'] },
	{ key: 'inventory', title: 'Inventaris', permissions: ['inventory.view', 'inventory.manage'] },
	{ key: 'expenses', title: 'Declaraties', permissions: ['expenses.view', 'expenses.review'] },
	{ key: 'finance', title: 'Financiën', permissions: ['finance.view', 'finance.manage'] },
	{ key: 'team', title: 'Team', permissions: ['staff.view', 'staff.manage'] },
	{ key: 'surveys', title: 'Enquêtes', permissions: ['surveys.manage', 'surveys.results'] },
	{ key: 'notifications', title: 'Meldingen', permissions: ['notifications.send', 'notifications.manage'] },
	{ key: 'badges', title: 'Badges', permissions: ['badges.manage'] },
	{ key: 'logs', title: 'Logs & systeem', permissions: ['logs.view', 'records.delete'] },
];
