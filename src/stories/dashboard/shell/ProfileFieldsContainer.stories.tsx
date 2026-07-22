import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ProfileFieldsContainer from '@/components/dashboard/shell/ProfileFieldsContainer';

const meta: Meta<typeof ProfileFieldsContainer> = {
	title: 'Dashboard/Shell/ProfileFieldsContainer',
	component: ProfileFieldsContainer,
	parameters: {
		docs: {
			description: {
				component:
					'Data container around Dashboard/Forms/ProfileFields: it reads the organisation profile of one user, uploads a new photo to the `avatars` bucket and writes the row back. Shared by "Mijn profiel" (own row) and the moderation person page (an admin editing someone else\'s), with the same query either way — an update that RLS refuses comes back as zero rows, which the container reports as "Geen rechten".',
			},
		},
	},
	args: {
		// The fixture user; the Supabase stand-in matches its rows on this id.
		userId: 'usr-0001',
		canEdit: true,
	},
};

export default meta;

type Story = StoryObj<typeof ProfileFieldsContainer>;

export const Default: Story = {};

export const ReadOnly: Story = {
	name: 'Alleen lezen',
	parameters: { docs: { description: { story: 'Without edit rights the fields render as a read-only summary.' } } },
	args: { canEdit: false },
};
