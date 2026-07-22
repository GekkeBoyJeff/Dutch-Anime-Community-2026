import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import DonationNotesContainer from '@/components/dashboard/shell/DonationNotesContainer';

const meta: Meta<typeof DonationNotesContainer> = {
	title: 'Dashboard/Shell/DonationNotesContainer',
	component: DonationNotesContainer,
	parameters: {
		docs: {
			description: {
				component:
					'Data container around Dashboard/Components/DonationNotesPanel: it reads the donation notes for one user and owns the add/delete mutations plus their toasts. Both "Mijn profiel" (read-only, `canManage=false`) and the moderation person page (`canManage=true`) mount this same component with the same query — RLS, not this prop, decides who may actually write.',
			},
		},
	},
	args: {
		// The fixture user; the Supabase stand-in matches its rows on this id.
		userId: 'usr-0001',
		canManage: false,
	},
};

export default meta;

type Story = StoryObj<typeof DonationNotesContainer>;

export const Default: Story = {};

export const Manageable: Story = {
	name: 'Beheerbaar',
	parameters: { docs: { description: { story: 'How the moderation person page mounts it: the add form and per-row delete appear.' } } },
	args: { canManage: true },
};
