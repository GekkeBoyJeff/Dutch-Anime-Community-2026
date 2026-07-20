import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import StatusBadge from '@/components/basics/StatusBadge';
import AvatarRow from '@/components/dashboard/components/AvatarRow';

const noop = () => {};

const meta: Meta<typeof AvatarRow> = {
	title: 'Dashboard/Components/AvatarRow',
	component: AvatarRow,
	parameters: {
		docs: {
			description: {
				component:
					'A tappable roster row: an avatar, a title over an optional subtitle, optional badge and warning slots, and a trailing chevron. Presentational — the caller supplies the slot content and the click handler.',
			},
		},
	},
	argTypes: {
		chevron: { control: 'boolean' },
	},
	decorators: [
		(Story) => (
			<div className="moderation" style={{ maxInlineSize: '40rem' }}>
				<div className="mod-list">
					<Story />
				</div>
			</div>
		),
	],
};

export default meta;

type Story = StoryObj<typeof AvatarRow>;

export const Default: Story = {
	args: {
		initials: 'JR',
		title: 'Jeffrey de Ruiter',
		subtitle: '123456789012345678',
		badges: <StatusBadge domain="request" status="active" label="Account" />,
		warnings: <span className="con-note">Geen</span>,
		onClick: noop,
	},
};

export const LongName: Story = {
	name: 'Lange naam',
	args: {
		initials: 'AB',
		title: 'Alexandra Wilhelmina van der Bergh-Timmermans',
		subtitle: '987654321098765432',
		badges: <StatusBadge domain="request" status="requested" label="Schaduw" />,
		warnings: <span className="con-note">Geen</span>,
		onClick: noop,
	},
};

export const WithoutBadges: Story = {
	name: 'Zonder badges',
	args: {
		initials: 'MK',
		title: 'Mila Koster',
		subtitle: '—',
		onClick: noop,
	},
};

export const WithWarnings: Story = {
	name: 'Met warnings',
	args: {
		initials: 'TV',
		title: 'Tom Visser',
		subtitle: '456789012345678901',
		badges: <StatusBadge domain="request" status="active" label="Account" />,
		warnings: (
			<>
				<StatusBadge domain="warning" status="red" label="Rood 1" />
				<StatusBadge domain="warning" status="yellow" label="Geel 2" />
			</>
		),
		onClick: noop,
	},
};
