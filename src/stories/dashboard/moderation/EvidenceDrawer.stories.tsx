import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import EvidenceDrawer from '@/components/dashboard/moderation/EvidenceDrawer';

const meta: Meta<typeof EvidenceDrawer> = {
	title: 'Dashboard/Moderation/EvidenceDrawer',
	component: EvidenceDrawer,
	parameters: {
		docs: {
			description: {
				component:
					'One drawer for both kinds of evidence — the warning table and the link table — picked by `table`/`fkColumn`. Each item is an `Entry` whose marker glyph says what it is: a file for an uploaded image or PDF, a chain for a link, a pencil for a free note. `fkValue` doubles as the open state (`null` = closed) and switching it resets the list and the composer, so evidence never bleeds from one record into the next. Uploads go to the private mod-evidence bucket and open through a signed URL.',
			},
		},
	},
	args: {
		table: 'mod_evidence',
		fkColumn: 'warning_id',
		fkValue: 'wrn-2',
		title: 'Bewijs bij warning',
		canManage: true,
		canDelete: true,
	},
};

export default meta;

type Story = StoryObj<typeof EvidenceDrawer>;

export const Default: Story = {
	name: 'Bij een warning',
};

export const BijEenLink: Story = {
	name: 'Bij een link',
	args: { table: 'mod_link_evidence', fkColumn: 'link_id', fkValue: 'lnk-1', title: 'Bewijs bij link' },
};

export const AlleenLezen: Story = {
	name: 'Alleen-lezen',
	args: { canManage: false, canDelete: false },
};
