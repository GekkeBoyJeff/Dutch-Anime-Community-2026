// Which permissions each role holds, mirroring what the my_permissions() RPC returns in production.
// Storybook's "Rol" toolbar picks one of these, so a single story can be inspected as a stand-staff
// volunteer, a yakuza organiser, an author or an admin — the four people this dashboard is for.
//
// This is a UX fixture, never a security statement: in the real app RLS decides what a role may read,
// and this table only decides what Storybook renders.

export const STORY_ROLES = ['stand-staff', 'yakuza', 'author', 'admin'] as const;
export type StoryRole = (typeof STORY_ROLES)[number];

const STAND_STAFF = ['inventory.view', 'expenses.view'];

const YAKUZA = [
	...STAND_STAFF,
	'inventory.manage',
	'expenses.manage',
	'staff.manage',
	'moderation.view',
	'badges.manage',
	'notifications.send',
];

const AUTHOR = [
	'pages.edit',
	'pages.delete',
	'structures.edit',
	'media.manage',
	'site.publish',
	'surveys.manage',
];

const ADMIN = [
	...new Set([
		...YAKUZA,
		...AUTHOR,
		'moderation.manage',
		'roles.manage',
		'logs.view',
		'records.delete',
	]),
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
