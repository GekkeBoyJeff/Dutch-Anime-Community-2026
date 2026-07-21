import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Metric from '@/components/components/Metric';
import Moment from '@/components/components/Moment';
import Panel from '@/components/components/Panel';
import Navigation, { type MegaMenuGroup } from '@/components/structures/Navigation';
import { NavigationProps } from '@/lib/content/schema/structures/navigation';

// Static stand-ins for the live highlights the dashboard wires per group (NavHighlights), in the same
// two shapes: a moment on a rail, or a single figure.
const mockMoment = (panelTitle: string, marker: string, title: string, meta: string, linkLabel: string) => (
	<Panel title={panelTitle} href="#" linkLabel={linkLabel}>
		<Moment.List>
			<Moment marker={marker} title={title} meta={meta} />
		</Moment.List>
	</Panel>
);

const mockMetric = (panelTitle: string, label: string, value: string, linkLabel: string) => (
	<Panel title={panelTitle} href="#" linkLabel={linkLabel}>
		<Metric label={label} value={value} />
	</Panel>
);

// Mock groups mirroring buildNavGroups()'s shape from DASHBOARD_GROUPS — no Supabase here.
const dashboardGroups: MegaMenuGroup[] = [
	{
		key: 'mijn',
		label: 'Mijn',
		description: 'Je eigen profiel, spullen en declaraties.',
		links: [
			{ key: 'profiel', label: 'Profiel', description: 'Je account, warnings en badges.', href: '/account', icon: 'user' },
			{ key: 'my-inventory', label: 'Mijn spullen', description: 'Je eigen items en wat je moet meenemen.', href: '/dashboard/my-inventory', icon: 'star' },
			{ key: 'expenses', label: 'Declaraties', description: 'Dien kosten in met bon en beoordeel declaraties.', href: '/dashboard/expenses', icon: 'file' },
		],
		highlight: mockMoment('Volgende shift', '12 aug', '12-08 10:00 – 16:00', 'Abunai! · Kassa', 'Naar mijn conventies'),
	},
	{
		key: 'operaties',
		label: 'Operaties',
		description: 'Voorraad, conventies en moderatie.',
		links: [
			{ key: 'events', label: 'Conventies & events', description: 'Beheer conventies, aanwezigheid en agenda.', href: '/dashboard/events', icon: 'calendar' },
			{ key: 'inventory', label: 'Inventaris', description: 'Beheer items en toewijzingen.', href: '/dashboard/inventory', icon: 'list' },
			{ key: 'team', label: 'Team', description: 'Standteam en yakuza met shifts en warnings.', href: '/dashboard/team', icon: 'users' },
			{ key: 'moderation', label: 'Moderatie', description: 'Profielen, warnings, links en bans.', href: '/dashboard/moderation', icon: 'warning' },
		],
		highlight: mockMoment('Volgende conventie', '14 aug', 'Abunai! 2026', 'vrijdag 14 augustus 2026 · Veldhoven', 'Open conventie'),
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
		highlight: mockMetric('Media', 'Laatst geüpload bestand', 'hero-abunai-2026.jpg', 'Naar media'),
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
		highlight: mockMoment('Laatste wijziging', '14:22', 'Abunai! 2026', 'Events · 19 jul', 'Naar logs'),
	},
];

const meta: Meta<typeof Navigation> = {
	title: 'Structures/Navigation',
	component: Navigation,
	parameters: {
		layout: 'fullscreen',
		docs: { description: { component: 'Generalised site header: brand, desktop links, a CTA and a mobile menu. The shell is a Server Component; only the mobile toggle is a small client island. Drive all content from site.ts.' } },
		jsonSchema: { schema: NavigationProps },
	},
	argTypes: {
		items: { control: 'object' },
		cta: { control: 'object' },
		brand: { control: 'object' },
	},
};

export default meta;

type Story = StoryObj<typeof Navigation>;

export const Default: Story = {
	args: {
		brand: { title: 'Dutch Anime Community' },
		items: [
			{ label: 'Home', url: '/' },
			{ label: 'Community', url: '/community' },
			{ label: 'Evenementen', url: '/evenementen' },
		],
		cta: { label: 'Word lid', url: '/word-lid', variant: 'primary' },
	},
};

export const WithoutCta: Story = {
	...Default,
	args: {
		...Default.args,
		cta: undefined,
	},
};

// Dashboard mode: passing `groups` turns the same pill nav into the staff mega-menu — group triggers open
// full-width fused panels, and the right cluster holds the user chip and back link instead of the CTA.
export const Dashboard: Story = {
	args: {
		brand: { title: 'Beheer' },
		home: { label: 'Dashboard', href: '/dashboard' },
		groups: dashboardGroups,
		user: { name: 'Kaito Tanaka', roleLabel: 'Beheerder', initials: 'KT' },
		backLink: { label: 'Terug naar de website', href: '/' },
	},
};
