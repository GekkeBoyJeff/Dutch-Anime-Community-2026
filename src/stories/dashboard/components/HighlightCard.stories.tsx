import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import HighlightCard from '@/components/dashboard/components/HighlightCard';

const meta: Meta<typeof HighlightCard> = {
	title: 'Dashboard/Components/HighlightCard',
	component: HighlightCard,
	parameters: {
		docs: {
			description: {
				component:
					'The mega-menu\'s per-group highlight (right zone): eyebrow, a fixed-height body (skeleton · empty · lead) so nothing shifts, and a circle-arrow CTA. Presentational — the caller (NavHighlights) runs the query.',
			},
		},
	},
	decorators: [(Story) => <div style={{ maxWidth: '18rem', blockSize: '9rem' }}><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof HighlightCard>;

export const Default: Story = {
	args: {
		eyebrow: 'Volgende shift',
		href: '/dashboard/my-inventory',
		ctaLabel: 'Naar mijn conventies',
		loading: false,
		isEmpty: false,
		emptyLabel: 'Nog geen shifts toegewezen.',
	},
};

export const LeadAndSub: Story = {
	name: 'Lead+sub',
	args: {
		...Default.args,
		lead: '12–14 sep, 10:00–18:00',
		sub: 'AnimeCon 2026 · Infobalie',
	},
};

export const Loading: Story = {
	args: {
		...Default.args,
		loading: true,
	},
};

export const Empty: Story = {
	name: 'Leeg',
	args: {
		...Default.args,
		isEmpty: true,
	},
};

export const LongText: Story = {
	name: 'Lange tekst',
	args: {
		...Default.args,
		eyebrow: 'Laatste wijziging',
		lead: 'Een erg lange bestandsnaam-of-titel die de vaste hoogte van het blok op de proef stelt',
		sub: 'Events · 19 juli 2026, 23:47',
	},
};
