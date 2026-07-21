import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import BadgeCard from '@/components/dashboard/components/BadgeCard';

const noop = () => {};

const dot =
	'data:image/svg+xml;utf8,' +
	encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><circle cx="32" cy="32" r="28" fill="%237c5cff"/></svg>',
	);

const meta: Meta<typeof BadgeCard> = {
	title: 'Dashboard/Components/BadgeCard',
	component: BadgeCard,
	parameters: {
		docs: {
			description: {
				component:
					'A single awarded badge: an optional image, the title, an optional description and the award date, with an optional archive ("intrekken") action. Lay several out in a `.badge-grid`.',
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="moderation">
				<div className="badge-grid">
					<Story />
				</div>
			</div>
		),
	],
};

export default meta;

type Story = StoryObj<typeof BadgeCard>;

export const WithImage: Story = {
	name: 'Met afbeelding',
	args: {
		imageUrl: dot,
		title: 'Vrijwilliger van het jaar',
		description: 'Uitzonderlijke inzet in 2025',
		awardedOn: '2025-12-20',
	},
};

export const WithoutImage: Story = {
	name: 'Zonder afbeelding',
	args: {
		title: 'Eerste conventie',
		description: 'Eerste keer als crew',
		awardedOn: '2026-03-14',
	},
};

export const LongDescription: Story = {
	name: 'Lange omschrijving',
	args: {
		imageUrl: dot,
		title: 'Held van de dag',
		description: 'Sprong bij toen de garderobe onderbezet was en heeft de hele middag zonder morren doorgewerkt.',
		awardedOn: '2026-05-02',
	},
};

export const Archivable: Story = {
	name: 'Archiveerbaar',
	args: {
		imageUrl: dot,
		title: 'Setup-crew',
		awardedOn: '2026-06-01',
		onArchive: noop,
	},
};

export const ReadOnly: Story = {
	name: 'Alleen-lezen',
	args: {
		imageUrl: dot,
		title: 'Setup-crew',
		awardedOn: '2026-06-01',
	},
};
