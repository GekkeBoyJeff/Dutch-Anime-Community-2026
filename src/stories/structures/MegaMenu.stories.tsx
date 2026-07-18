import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import MegaMenu, { type MegaMenuGroup } from '@/components/structures/MegaMenu';

// Mock groups mirroring the shape buildNavGroups() produces from DASHBOARD_GROUPS — no Supabase here.
const groups: MegaMenuGroup[] = [
	{
		key: 'mijn',
		label: 'Mijn',
		description: 'Je eigen profiel, spullen en declaraties.',
		links: [
			{ key: 'profiel', label: 'Profiel', description: 'Je account, warnings en badges.', href: '/account', icon: 'user' },
			{ key: 'my-inventory', label: 'Mijn spullen', description: 'Je eigen items en wat je moet meenemen.', href: '/dashboard/my-inventory', icon: 'star' },
			{ key: 'expenses', label: 'Declaraties', description: 'Dien kosten in met bon en beoordeel declaraties.', href: '/dashboard/expenses', icon: 'file' },
		],
	},
	{
		key: 'operaties',
		label: 'Operaties',
		description: 'Voorraad, conventies en moderatie.',
		links: [
			{ key: 'inventory', label: 'Inventory', description: 'Beheer items, conventies, toewijzingen en tickets.', href: '/dashboard/inventory', icon: 'calendar' },
			{ key: 'moderation', label: 'Moderatie', description: 'Profielen, warnings, links en bans.', href: '/dashboard/moderation', icon: 'warning' },
		],
	},
	{
		key: 'content',
		label: 'Content',
		description: "Pagina's, media en enquêtes.",
		links: [
			{ key: 'builder', label: "Pagina's", description: "Bewerk pagina's met de visuele builder.", href: '/builder', icon: 'edit' },
			{ key: 'media', label: 'Media', description: 'Upload en beheer afbeeldingen.', href: '/upload', icon: 'upload' },
			{ key: 'surveys', label: 'Enquêtes', description: 'Maak en beheer enquêtes en polls.', href: '/dashboard/surveys', icon: 'list' },
		],
	},
	{
		key: 'systeem',
		label: 'Systeem',
		description: 'Toegang, meldingen en logs.',
		links: [
			{ key: 'access', label: 'Toegang', description: 'Ken rollen en permissies toe aan gebruikers.', href: '/dashboard/access', icon: 'settings' },
			{ key: 'notifications', label: 'Meldingen', description: 'Stuur meldingen naar leden.', href: '/dashboard/notifications', icon: 'mail' },
			{ key: 'logs', label: 'Logs', description: 'Activiteit en audit-trail van het beheer.', href: '/dashboard/logs', icon: 'clock' },
		],
	},
];

const meta: Meta<typeof MegaMenu> = {
	title: 'Structures/MegaMenu',
	component: MegaMenu,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'Admin top bar with grouped, click-to-open mega-menu panels on Base UI Navigation Menu, plus a user/role chip and the "Terug naar de website" affordance. The dashboard wires sections + permissions into the generic `groups`/`user` props.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof MegaMenu>;

export const Default: Story = {
	args: {
		brand: { title: 'Beheer' },
		home: { label: 'Dashboard', href: '/dashboard' },
		groups,
		user: { name: 'Kaito Tanaka', roleLabel: 'Beheerder', initials: 'KT' },
		backLink: { label: 'Terug naar de website', href: '/' },
	},
};

// A single group whose panel carries a highlight column slot (empty for every other group).
export const WithHighlight: Story = {
	args: {
		...Default.args,
		groups: groups.map((group) =>
			group.key === 'content'
				? { ...group, highlight: <p style={{ margin: 0 }}>Tip: publiceer je pagina om een nieuwe build te starten.</p> }
				: group,
		),
	},
};

export const MemberOnly: Story = {
	args: {
		...Default.args,
		groups: [groups[0]!],
		user: { name: 'Yuki', roleLabel: 'Lid', initials: 'YU' },
	},
};
