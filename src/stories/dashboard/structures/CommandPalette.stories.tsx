import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import Button from '@/components/basics/Button';
import CommandPalette, { type PaletteResult } from '@/components/dashboard/structures/CommandPalette';
import type { PaletteCommand } from '@/lib/auth/dashboard-sections';

const pages: PaletteCommand[] = [
	{ key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'home' },
	{ key: 'profiel', label: 'Profiel', href: '/account', icon: 'user' },
	{ key: 'events', label: 'Conventies & events', href: '/dashboard/events', icon: 'calendar' },
	{ key: 'inventory', label: 'Inventaris', href: '/dashboard/inventory', icon: 'list' },
	{ key: 'moderation', label: 'Moderatie', href: '/dashboard/moderation', icon: 'warning' },
	{ key: 'finance', label: 'Financiën', href: '/dashboard/finance', icon: 'file' },
];

const actions: PaletteCommand[] = [
	{ key: 'new-event', label: 'Nieuwe conventie', href: '/dashboard/events?new=1', icon: 'calendar' },
	{ key: 'new-income', label: 'Inkomst toevoegen', href: '/dashboard/finance?new=1', icon: 'file' },
	{ key: 'send-notification', label: 'Melding sturen', href: '/dashboard/notifications', icon: 'mail' },
	{ key: 'upload-media', label: 'Media uploaden', href: '/upload', icon: 'upload' },
];

// Mock live search (no Supabase in Storybook): matches a couple of fake conventions and members.
const mockEntities: PaletteResult[] = [
	{ key: 'event:1', group: 'events', label: 'Dutch Comic Con', sublabel: 'Jaarbeurs Utrecht', href: '/dashboard/events?id=1', icon: 'calendar' },
	{ key: 'event:2', group: 'events', label: 'Dutch Anime Con', sublabel: 'Van der Valk Eindhoven', href: '/dashboard/events?id=2', icon: 'calendar' },
	{ key: 'person:1', group: 'people', label: 'Jeffrey', href: '/dashboard/moderation?id=1', icon: 'user' },
];
const searchEntities = async (query: string): Promise<PaletteResult[]> => {
	const q = query.toLowerCase();
	return mockEntities.filter((entity) => entity.label.toLowerCase().includes(q));
};

const meta: Meta<typeof CommandPalette> = {
	title: 'Dashboard/Structures/CommandPalette',
	component: CommandPalette,
	parameters: {
		// The palette navigates via next/navigation useRouter, so mount Storybook's App Router mock.
		nextjs: { appDirectory: true },
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'The dashboard ⌘K palette on cmdk (Command.Dialog). Static groups (Recent/Pagina\'s/Acties) fuzzy-match client-side; Conventies + Personen are live record hits from `searchEntities` (debounced, deep-linking to the editor / profile). Fixed-size box (no layout shift while filtering), localStorage MRU, Dutch labels. Try typing "dutch".',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof CommandPalette>;

export const Default: Story = {
	args: { pages, actions, searchEntities, personSearchHref: (query) => (query ? `/dashboard/moderation?q=${query}` : '/dashboard/moderation') },
	render: function Render(args) {
		const [open, setOpen] = useState(true);
		return (
			<>
				<Button onClick={() => setOpen(true)}>Open palette</Button>
				<CommandPalette {...args} open={open} onOpenChange={setOpen} />
			</>
		);
	},
};

export const WithoutPeople: Story = {
	...Default,
	args: { pages, actions },
	parameters: {
		...Default.parameters,
		docs: { description: { story: 'No `personSearchHref`: a caller without moderation/team access sees only Pagina\'s and Acties.' } },
	},
};
