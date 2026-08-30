import type { AppRole, Permission } from '@/lib/shared/auth/permissions';

// permission → dashboard section registry. Hiding a section is UX only; the same permission guards the
// section's data via authorize() in RLS, which is what makes it genuinely inaccessible.
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
	{ key: 'media', title: 'Media', navLabel: 'Media', description: 'Upload en beheer afbeeldingen.', href: '/upload', permission: 'media.upload' },
	{ key: 'access', title: 'Toegangsbeheer', navLabel: 'Toegang', description: 'Ken rollen en permissies toe aan gebruikers.', href: '/dashboard/access', permission: 'roles.manage' },
	{ key: 'events', title: 'Conventies & events', navLabel: 'Conventies & events', description: 'Beheer conventies, aanwezigheid en agenda.', href: '/dashboard/events', permission: 'events.view' },
	{ key: 'inventory', title: 'Inventaris', navLabel: 'Inventaris', description: 'Beheer items en toewijzingen.', href: '/dashboard/inventory', permission: 'inventory.manage' },
	{ key: 'my-inventory', title: 'Mijn inventory & conventies', navLabel: 'Mijn spullen', description: 'Je eigen items en wat je moet meenemen.', href: '/dashboard/my-inventory', permission: 'inventory.view' },
	// Eén route: tab "Mijn declaraties" (expenses.view) + tab "Beheer" die alleen verschijnt bij expenses.review.
	{ key: 'expenses', title: 'Declaraties', navLabel: 'Declaraties', description: 'Dien kosten in met bon en beoordeel declaraties.', href: '/dashboard/expenses', permission: 'expenses.view' },
	{ key: 'finance', title: 'Financiën', navLabel: 'Financiën', description: 'Org-breed overzicht van kosten en declaraties.', href: '/dashboard/finance', permission: 'finance.view' },
	{ key: 'team', title: 'Team', navLabel: 'Team', description: 'Standteam en yakuza met shifts en warnings.', href: '/dashboard/team', permission: 'staff.view' },
	{ key: 'moderation', title: 'Moderatie', navLabel: 'Moderatie', description: 'Profielen, warnings, links en bans.', href: '/dashboard/moderation', permission: 'moderation.view' },
	{ key: 'notifications', title: 'Meldingen', navLabel: 'Meldingen', description: 'Stuur meldingen naar leden.', href: '/dashboard/notifications', permission: 'notifications.send' },
	{ key: 'surveys', title: 'Enquêtes & polls', navLabel: 'Enquêtes', description: 'Maak en beheer enquêtes en polls.', href: '/dashboard/surveys', permission: 'surveys.manage' },
	{ key: 'logs', title: 'Logs', navLabel: 'Logs', description: 'Activiteit en audit-trail van het beheer.', href: '/dashboard/logs', permission: 'logs.view' },
];

export interface NavGroupLink {
	key: string;
	label: string;
	description: string;
	href: string;
	icon: string;
}

export interface NavGroup {
	key: string;
	label: string;
	description: string;
	links: NavGroupLink[];
	directHref?: string;
	muted?: boolean;
}

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

// Per-role group order — presentation only; permission-hiding stays the mechanism that decides what is visible.
const GROUP_ORDER: Partial<Record<AppRole, string[]>> = {
	yakuza: ['operaties', 'mijn', 'financien', 'content', 'systeem'],
	author: ['content', 'mijn', 'operaties', 'financien', 'systeem'],
	admin: ['operaties', 'financien', 'mijn', 'content', 'systeem'],
};

const orderGroups = (groups: NavGroup[], role: AppRole | undefined): NavGroup[] => {
	const order = role ? GROUP_ORDER[role] : undefined;
	if (!order) return groups;
	const rank = (key: string) => {
		const i = order.indexOf(key);
		return i === -1 ? order.length : i;
	};
	return [...groups].sort((a, b) => rank(a.key) - rank(b.key));
};

export const buildNavGroups = (permissions: ReadonlySet<Permission>, role?: AppRole): NavGroup[] => {
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
				});
			} else {
				links.push({ key: entry.key, label: entry.label, description: entry.description, href: entry.href, icon: entry.icon });
			}
		}
		if (links.length === 0) continue;
		const resolved: NavGroup = { key: group.key, label: group.label, description: group.description, links };
		if (group.key === 'mijn' && links.length === 1) {
			resolved.directHref = links[0]!.href;
			resolved.label = 'Mijn DAC';
		}
		if (group.key === 'systeem') resolved.muted = true;
		groups.push(resolved);
	}
	return orderGroups(groups, role);
};

export interface PaletteCommand {
	key: string;
	label: string;
	href: string;
	icon: string;
}

interface PaletteActionMeta extends PaletteCommand {
	permission: Permission;
}
const DASHBOARD_ACTIONS: PaletteActionMeta[] = [
	{ key: 'declare-now', label: 'Declareer nu', href: '/dashboard/expenses?new=1', icon: 'file', permission: 'expenses.view' },
	{ key: 'new-event', label: 'Nieuwe conventie', href: '/dashboard/events?new=1', icon: 'calendar', permission: 'events.manage' },
	{ key: 'new-income', label: 'Inkomst toevoegen', href: '/dashboard/finance?new=1', icon: 'file', permission: 'finance.manage' },
	{ key: 'send-notification', label: 'Melding sturen', href: '/dashboard/notifications', icon: 'mail', permission: 'notifications.send' },
	{ key: 'upload-media', label: 'Media uploaden', href: '/upload', icon: 'upload', permission: 'media.upload' },
	{ key: 'upload-transcript', label: 'Transcript uploaden', href: '/dashboard/moderation', icon: 'file', permission: 'moderation.view' },
	{ key: 'new-survey', label: 'Nieuwe enquête', href: '/dashboard/surveys?new=1', icon: 'list', permission: 'surveys.manage' },
];

export const buildPalettePages = (permissions: ReadonlySet<Permission>): PaletteCommand[] => {
	const pages: PaletteCommand[] = [{ key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'home' }];
	for (const group of buildNavGroups(permissions)) {
		for (const link of group.links) {
			pages.push({ key: link.key, label: link.label, href: link.href, icon: link.icon });
		}
	}
	return pages;
};

export const buildPaletteActions = (permissions: ReadonlySet<Permission>): PaletteCommand[] =>
	DASHBOARD_ACTIONS.filter((action) => permissions.has(action.permission)).map(({ permission: _permission, ...command }) => command);

export const palettePersonSearchHref = (permissions: ReadonlySet<Permission>): ((query: string) => string) | null => {
	const base = permissions.has('moderation.view') ? '/dashboard/moderation' : permissions.has('staff.view') ? '/dashboard/team' : null;
	if (!base) return null;
	return (query: string) => (query ? `${base}?q=${encodeURIComponent(query)}` : base);
};

// The "Shifts" tab is gated on inventory.view and deep-links into Mijn spullen: stand-staff can't reach
// the manager events editor, so their own shift-week lives in the read-only agenda there.
export const buildTabBarItems = (permissions: ReadonlySet<Permission>): TabBarItem[] => {
	const items: TabBarItem[] = [{ key: 'home', label: 'Home', href: '/dashboard', icon: 'home', exact: true }];
	for (const entry of TAB_BAR_SECTIONS) {
		const section = SECTION_BY_KEY.get(entry.section);
		if (!section || !permissions.has(section.permission)) continue;
		items.push({ key: section.key, label: section.navLabel, href: section.href, icon: entry.icon });
	}
	if (permissions.has('inventory.view')) {
		items.push({ key: 'shifts', label: 'Shifts', href: '/dashboard/my-inventory#shifts', icon: 'calendar' });
	}
	return items;
};
