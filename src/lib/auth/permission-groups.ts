import type { Permission } from '@/lib/auth/permissions';

// Per-domein groepering van het permissie-vocabulaire, voor een leesbaar, verticaal Toegang-detail
// (i.p.v. een brede matrix). Nieuwe permissies uit latere fases voeg je hier aan de juiste groep toe.
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
