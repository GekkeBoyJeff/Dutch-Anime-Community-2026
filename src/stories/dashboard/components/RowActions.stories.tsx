import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import RowActions, { type RowAction } from '@/components/dashboard/components/RowActions';

const noop = () => {};

const actions: RowAction[] = [
	{ label: 'Openzetten', pinned: true, variant: 'primary', onClick: noop },
	{ label: 'Link', icon: 'link', onClick: noop },
	{ label: 'Resultaten', onClick: noop },
	{ label: 'Bewerk', onClick: noop },
	{ label: 'Archiveren', onClick: noop },
	{ label: 'Verwijder', icon: 'trash', danger: true, onClick: noop },
];

const meta: Meta<typeof RowActions> = {
	title: 'Dashboard/Components/RowActions',
	component: RowActions,
	parameters: {
		docs: {
			description: {
				component:
					'The dashboard row-action pattern: `pinned` actions stay visible buttons, everything else folds into a "⋯" overflow menu, so a row of many actions reads as one primary plus an overflow. Pair it with DataTable’s `rowContextMenu` (which renders the same list via `RowActionItems`) so a right-click offers every action too.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof RowActions>;

export const Default: Story = {
	args: { actions },
};

export const OnlyOverflow: Story = {
	name: 'Alleen overflow',
	args: { actions: actions.filter((action) => !action.pinned) },
};

export const OnlyPinned: Story = {
	name: 'Alleen vastgezet',
	args: { actions: [{ label: 'Sluiten', pinned: true, onClick: noop }] },
};
