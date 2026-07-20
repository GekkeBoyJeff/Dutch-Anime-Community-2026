import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Badge from '@/components/basics/Badge';
import DetailRow from '@/components/dashboard/components/DetailRow';

const meta: Meta<typeof DetailRow> = {
	title: 'Dashboard/Components/DetailRow',
	component: DetailRow,
	parameters: {
		docs: {
			description: {
				component:
					'One row in a compact list: a main label with an optional sub-line, and a trailing slot for a status chip or amount. Renders a bare <li> — compose it inside the list\'s own <ul>/<ol>.',
			},
		},
	},
	decorators: [(Story) => <ul className="widget-list" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.5rem', minWidth: '20rem' }}><Story /></ul>],
};

export default meta;

type Story = StoryObj<typeof DetailRow>;

export const Default: Story = {
	args: {
		main: 'Open enquête: Merchandise 2026',
	},
};

export const WithSub: Story = {
	name: 'With sub',
	args: {
		main: 'Jasmijn de Vries',
		sub: '12 mei 2026',
	},
};

export const WithTrailingBadge: Story = {
	name: 'With trailing badge',
	args: {
		main: 'Jasmijn de Vries',
		sub: '12 mei 2026',
		trailing: <Badge variant="neutral">roles.manage</Badge>,
	},
};

export const LongTextTruncation: Story = {
	name: 'Long text truncation',
	args: {
		main: 'Een erg lange declaratie-omschrijving die niet meer past op één regel en dus moet afkappen',
		sub: '3 juni 2026',
		trailing: <span className="detail-row-amount">€ 84,50</span>,
	},
};
