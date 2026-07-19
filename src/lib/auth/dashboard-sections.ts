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
	{ key: 'events', title: 'Conventies & events', navLabel: 'Conventies & events', description: 'Beheer conventies, aanwezigheid en agenda.', href: '/dashboard/events', permission: 'inventory.manage' },
	{ key: 'inventory', title: 'Inventaris', navLabel: 'Inventaris', description: 'Beheer items en toewijzingen.', href: '/dashboard/inventory', permission: 'inventory.manage' },
	{ key: 'my-inventory', title: 'Mijn inventory & conventies', navLabel: 'Mijn spullen', description: 'Je eigen items en wat je moet meenemen.', href: '/dashboard/my-inventory', permission: 'inventory.view' },
	// Eén route: tab "Mijn declaraties" (expenses.view) + tab "Beheer" die alleen verschijnt bij expenses.manage.
	{ key: 'expenses', title: 'Declaraties', navLabel: 'Declaraties', description: 'Dien kosten in met bon en beoordeel declaraties.', href: '/dashboard/expenses', permission: 'expenses.view' },
	{ key: 'finance', title: 'Financiën', navLabel: 'Financiën', description: 'Org-breed overzicht van kosten en declaraties.', href: '/dashboard/finance', permission: 'expenses.manage' },
	{ key: 'team', title: 'Team', navLabel: 'Team', description: 'Standteam en yakuza met shifts en warnings.', href: '/dashboard/team', permission: 'staff.manage' },
	{ key: 'moderation', title: 'Moderatie', navLabel: 'Moderatie', description: 'Profielen, warnings, links en bans.', href: '/dashboard/moderation', permission: 'moderation.view' },
	{ key: 'notifications', title: 'Meldingen', navLabel: 'Meldingen', description: 'Stuur meldingen naar leden.', href: '/dashboard/notifications', permission: 'notifications.send' },
	{ key: 'surveys', title: 'Enquêtes & polls', navLabel: 'Enquêtes', description: 'Maak en beheer enquêtes en polls.', href: '/dashboard/surveys', permission: 'surveys.manage' },
	{ key: 'logs', title: 'Logs', navLabel: 'Logs', description: 'Activiteit en audit-trail van het beheer.', href: '/dashboard/logs', permission: 'logs.view' },
];

// A render-ready nav link for the admin mega-menu: an icon, a label and a one-line description pointing
// at a route. Permission gating happens before render (buildNavGroups), so a link that reaches the UI is
// one the caller may see — UX only, RLS stays the real boundary.
export interface NavGroupLink {
	key: string;
	label: string;
	description: string;
	href: string;
	icon: string;
	/** Extra routes that should light up this link even though they don't nest under `href` (see below). */
	activeHrefs?: string[];
}

// Dashboard routes that aren't sections themselves but are reached from one, so the nav group they belong
// to still lights up. The event editor (/dashboard/events?id=…) nests under its own section's href, so it
// needs no entry here. Extend this map as future detail routes appear that don't nest under their section.
export const DASHBOARD_ROUTE_OWNERSHIP: Record<string, string> = {};

export interface NavGroup {
	key: string;
	label: string;
	description: string;
	links: NavGroupLink[];
}

// Domain grouping laid over the flat sections — the top bar shows one panel per group. An entry either
// references a DASHBOARD_SECTIONS key (label/href/permission come from there, so nothing drifts) or
// inlines a standalone link every signed-in member holds (Profiel has no permission gate). Add a group,
// reorder, or move a section by editing this list alone; groups with no visible links are hidden.
interface GroupSectionEntry {
	section: string;
	icon: string;
}
interface GroupStandaloneEntry {
	key: string;
	label: string;
	description: string;
	href: string;
	icon: string;
}
type GroupEntry = GroupSectionEntry | GroupStandaloneEntry;

interface DashboardGroupMeta {
	key: string;
	label: string;
	description: string;
	entries: GroupEntry[];
}

export const DASHBOARD_GROUPS: DashboardGroupMeta[] = [
	{
		key: 'mijn',
		label: 'Mijn',
		description: 'Je eigen profiel, spullen en declaraties.',
		entries: [
			{ key: 'profiel', label: 'Profiel', description: 'Je account, warnings en badges.', href: '/account', icon: 'user' },
			{ section: 'my-inventory', icon: 'star' },
			{ section: 'expenses', icon: 'file' },
		],
	},
	{
		key: 'operaties',
		label: 'Operaties',
		description: 'Voorraad, conventies en moderatie.',
		entries: [
			{ section: 'events', icon: 'calendar' },
			{ section: 'inventory', icon: 'list' },
			{ section: 'team', icon: 'users' },
			{ section: 'moderation', icon: 'warning' },
		],
	},
	{
		key: 'financien',
		label: 'Financiën',
		description: 'Org-breed overzicht van kosten en declaraties.',
		entries: [{ section: 'finance', icon: 'file' }],
	},
	{
		key: 'content',
		label: 'Content',
		description: "Pagina's, media en enquêtes.",
		entries: [
			{ section: 'builder', icon: 'edit' },
			{ section: 'media', icon: 'upload' },
			{ section: 'surveys', icon: 'list' },
		],
	},
	{
		key: 'systeem',
		label: 'Systeem',
		description: 'Toegang, meldingen en logs.',
		entries: [
			{ section: 'access', icon: 'settings' },
			{ section: 'notifications', icon: 'mail' },
			{ section: 'logs', icon: 'clock' },
		],
	},
];

// Primary "field" destinations for the mobile bottom tab bar, permission-filtered the same way as
// buildNavGroups. Add a future tab (Shifts, Packing) with one entry here.
const TAB_BAR_SECTIONS: { section: string; icon: string }[] = [
	{ section: 'my-inventory', icon: 'star' },
	{ section: 'expenses', icon: 'file' },
];

export interface TabBarItem {
	key: string;
	label: string;
	href: string;
	icon: string;
	exact?: boolean;
}

const SECTION_BY_KEY = new Map(DASHBOARD_SECTIONS.map((section) => [section.key, section]));

// Reverse of DASHBOARD_ROUTE_OWNERSHIP: section key → the extra routes it owns.
const OWNED_ROUTES_BY_SECTION = new Map<string, string[]>();
for (const [route, sectionKey] of Object.entries(DASHBOARD_ROUTE_OWNERSHIP)) {
	OWNED_ROUTES_BY_SECTION.set(sectionKey, [...(OWNED_ROUTES_BY_SECTION.get(sectionKey) ?? []), route]);
}

// Resolve the group metadata against the caller's permissions into render-ready groups: section entries
// inherit their section's label/href and are dropped when the permission is missing, standalone entries
// always show, and any group left with zero links is omitted so the bar never opens an empty panel.
export const buildNavGroups = (permissions: ReadonlySet<Permission>): NavGroup[] => {
	const groups: NavGroup[] = [];
	for (const group of DASHBOARD_GROUPS) {
		const links: NavGroupLink[] = [];
		for (const entry of group.entries) {
			if ('section' in entry) {
				const section = SECTION_BY_KEY.get(entry.section);
				if (!section || !permissions.has(section.permission)) continue;
				links.push({
					key: section.key,
					label: section.navLabel,
					description: section.description,
					href: section.href,
					icon: entry.icon,
					activeHrefs: OWNED_ROUTES_BY_SECTION.get(section.key),
				});
			} else {
				links.push({ key: entry.key, label: entry.label, description: entry.description, href: entry.href, icon: entry.icon });
			}
		}
		if (links.length > 0) {
			groups.push({ key: group.key, label: group.label, description: group.description, links });
		}
	}
	return groups;
};

// Resolve TAB_BAR_SECTIONS against the caller's permissions into the mobile bottom tab bar's items.
// Home has no permission gate — every signed-in member reaches the dashboard hub.
export const buildTabBarItems = (permissions: ReadonlySet<Permission>): TabBarItem[] => {
	const items: TabBarItem[] = [{ key: 'home', label: 'Home', href: '/dashboard', icon: 'home', exact: true }];
	for (const entry of TAB_BAR_SECTIONS) {
		const section = SECTION_BY_KEY.get(entry.section);
		if (!section || !permissions.has(section.permission)) continue;
		items.push({ key: section.key, label: section.navLabel, href: section.href, icon: entry.icon });
	}
	return items;
};
