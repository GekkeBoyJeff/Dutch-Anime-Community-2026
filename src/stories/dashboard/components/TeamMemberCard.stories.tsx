import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import TeamMemberCard from '@/components/dashboard/components/TeamMemberCard';

const meta: Meta<typeof TeamMemberCard> = {
	title: 'Dashboard/Components/TeamMemberCard',
	component: TeamMemberCard,
	parameters: {
		docs: {
			description: {
				component:
					'One staff member as a card: avatar, name, Discord tag and role badge, a next-shift line and an open-warnings line. An omitted onOpenModeration/onOpenShift hides its button.',
			},
		},
	},
	args: {
		onOpenModeration: () => {},
		onOpenShift: () => {},
	},
	decorators: [(Story) => <div className="team" style={{ maxWidth: '22rem' }}><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof TeamMemberCard>;

export const Default: Story = {
	args: {
		member: {
			displayName: 'Jasmijn de Vries',
			discordTag: 'jasmijn',
			role: 'yakuza',
			nextShiftAt: '2026-08-15T10:00:00Z',
			nextShiftEventName: 'Nishikigoi Winterconventie',
			openWarnings: 0,
		},
	},
};

export const WithWarnings: Story = {
	name: 'Met warnings',
	args: {
		member: {
			displayName: 'Tom Bakker',
			discordTag: 'tombakker',
			role: 'stand-staff',
			nextShiftAt: '2026-09-01T13:30:00Z',
			nextShiftEventName: 'Sakura Lentemarkt',
			openWarnings: 2,
		},
	},
};

export const WithoutShift: Story = {
	name: 'Zonder shift',
	args: {
		member: {
			displayName: 'Noor Jansen',
			discordTag: null,
			role: 'stand-staff',
			nextShiftAt: null,
			nextShiftEventName: null,
			openWarnings: 0,
		},
		onOpenShift: undefined,
	},
};

export const LongName: Story = {
	name: 'Lange naam',
	args: {
		member: {
			displayName: 'Alexandra-Wilhelmina van der Bergh-Nakamura',
			discordTag: 'alexandrawilhelmina',
			role: 'yakuza',
			nextShiftAt: '2026-10-12T09:00:00Z',
			nextShiftEventName: 'Herfstconventie & Artist Alley Rotterdam',
			openWarnings: 1,
		},
	},
};
