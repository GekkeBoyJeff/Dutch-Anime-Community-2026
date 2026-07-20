import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import DonationNotesPanel, { type DonationNote } from '@/components/dashboard/components/DonationNotesPanel';

const meta: Meta<typeof DonationNotesPanel> = {
	title: 'Dashboard/Components/DonationNotesPanel',
	component: DonationNotesPanel,
	parameters: {
		docs: {
			description: {
				component:
					'Presentational donation-notes list with a draft form and delete confirm. The caller (DonationNotesContainer) owns the Supabase query and mutations — RLS ("donation_notes …") is the real access boundary.',
			},
		},
	},
	decorators: [(Story) => <div style={{ maxWidth: '28rem' }}><Story /></div>],
	args: {
		onAdd: () => {},
		onDelete: () => {},
	},
};

export default meta;

type Story = StoryObj<typeof DonationNotesPanel>;

const notes: DonationNote[] = [
	{ id: '1', note: '€ 25 via Ko-fi', source: 'Ko-fi', noted_on: '2026-03-12', created_at: '2026-03-12T10:00:00Z' },
	{ id: '2', note: 'Merchandise gesponsord', source: null, noted_on: null, created_at: '2026-01-04T10:00:00Z' },
];

export const Default: Story = {
	args: { notes, canManage: true },
};

export const Empty: Story = {
	name: 'Leeg',
	args: { notes: [], canManage: true },
};

export const Loading: Story = {
	args: { notes: null, canManage: true },
};

export const ManageMode: Story = {
	name: 'Beheer-modus',
	args: { notes, canManage: true },
};

export const ReadOnly: Story = {
	name: 'Read-only',
	args: { notes, canManage: false },
};
