// Which permissions each role holds, mirroring what the my_permissions() RPC returns in production.
// Storybook's "Rol" toolbar picks one of these, so a single story can be inspected as a stand-staff
// volunteer, a yakuza organiser, an author or an admin — the four people this dashboard is for.
//
// This is a UX fixture, never a security statement: in the real app RLS decides what a role may read,
// and this table only decides what Storybook renders.

export const STORY_ROLES = ['stand-staff', 'yakuza', 'author', 'admin'] as const;
export type StoryRole = (typeof STORY_ROLES)[number];

const STAND_STAFF = ['inventory.view', 'events.view', 'expenses.view', 'staff.view'];

const YAKUZA = [
	'moderation.view',
	'moderation.manage',
	'events.view',
	'events.manage',
	'inventory.view',
	'inventory.manage',
	'expenses.view',
	'expenses.review',
	'finance.view',
	'finance.manage',
	'staff.view',
	'staff.manage',
	'surveys.manage',
	'surveys.results',
	'notifications.send',
	'notifications.manage',
	'badges.manage',
];

const AUTHOR = [
	'pages.create',
	'pages.edit',
	'structures.edit',
	'media.upload',
	'site.publish_staging',
	'surveys.manage',
	'surveys.results',
];

const ADMIN = [
	'pages.create',
	'pages.edit',
	'pages.delete',
	'structures.edit',
	'media.upload',
	'media.delete',
	'site.publish_staging',
	'site.approve',
	'moderation.view',
	'moderation.manage',
	'roles.manage',
	'events.view',
	'events.manage',
	'inventory.view',
	'inventory.manage',
	'expenses.view',
	'expenses.review',
	'finance.view',
	'finance.manage',
	'staff.view',
	'staff.manage',
	'surveys.manage',
	'surveys.results',
	'notifications.send',
	'notifications.manage',
	'logs.view',
	'badges.manage',
	'records.delete',
];

export const PERMISSIONS_BY_ROLE: Record<StoryRole, string[]> = {
	'stand-staff': STAND_STAFF,
	yakuza: YAKUZA,
	author: AUTHOR,
	admin: ADMIN,
};

export const ROLE_LABEL: Record<StoryRole, string> = {
	'stand-staff': 'Standteam',
	yakuza: 'Yakuza',
	author: 'Auteur',
	admin: 'Beheerder',
};
