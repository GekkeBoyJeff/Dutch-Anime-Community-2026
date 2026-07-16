import type { Permission } from '@/lib/auth/permissions';

// Per-domein groepering van het permissie-vocabulaire, voor een leesbaar, verticaal Toegang-detail
// (i.p.v. een brede matrix). Nieuwe permissies uit latere fases voeg je hier aan de juiste groep toe.
export interface PermissionGroup {
	key: string;
	title: string;
	permissions: Permission[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
	{ key: 'pages', title: "Pagina's & CMS", permissions: ['pages.edit', 'pages.delete', 'structures.edit', 'site.publish'] },
	{ key: 'media', title: 'Media', permissions: ['media.manage'] },
	{ key: 'moderation', title: 'Moderatie', permissions: ['moderation.view', 'moderation.manage'] },
	{ key: 'access', title: 'Toegang', permissions: ['roles.manage'] },
	{ key: 'inventory', title: 'Inventory & conventies', permissions: ['inventory.view', 'inventory.manage'] },
	{ key: 'expenses', title: 'Declaraties', permissions: ['expenses.view', 'expenses.manage'] },
	{ key: 'badges', title: 'Badges', permissions: ['badges.manage'] },
	{ key: 'logs', title: 'Logs & systeem', permissions: ['logs.view', 'records.delete', 'notifications.send'] },
];
