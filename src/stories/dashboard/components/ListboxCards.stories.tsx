import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import ListboxCards, { type ListboxCardOption } from '@/components/dashboard/components/ListboxCards';

const meta: Meta<typeof ListboxCards> = {
	title: 'Dashboard/Components/ListboxCards',
	component: ListboxCards,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'A card-select (research-visual §3): each option is a clickable card with an icon, title, description and a check badge on selection — for choices that carry meaning beyond a bare label, like the role picker in Toegang. Built on Base UI RadioGroup + Radio, so it is a real single-choice radiogroup with roving focus and aria-checked.',
			},
		},
	},
	argTypes: {
		columns: { control: 'inline-radio', options: [1, 2] },
	},
};

export default meta;

type Story = StoryObj<typeof ListboxCards>;

const ROLES: ListboxCardOption[] = [
	{ value: 'user', label: 'Lid', description: 'Basis-toegang: eigen profiel, badges en enquêtes.', icon: 'user' },
	{ value: 'stand-staff', label: 'Standteam', description: 'Veld-taken: inventaris bekijken en declareren.', icon: 'users' },
	{ value: 'yakuza', label: 'Yakuza', description: 'Organisatie: events, team, moderatie en financiën.', icon: 'star' },
	{ value: 'admin', label: 'Beheerder', description: 'Volledige toegang inclusief toegangsbeheer en logs.', icon: 'settings' },
];

const Interactive = ({ options, columns }: { options: ListboxCardOption[]; columns?: 1 | 2 }) => {
	const [value, setValue] = useState(options[0]?.value);
	return <ListboxCards options={options} value={value} onValueChange={setValue} columns={columns} aria-label="Rol" />;
};

export const RolePicker: Story = {
	render: (args) => <Interactive options={ROLES} columns={args.columns} />,
};

export const TwoColumns: Story = {
	render: () => <Interactive options={ROLES} columns={2} />,
};

export const WithDisabled: Story = {
	render: () => (
		<Interactive
			options={ROLES.map((role) => (role.value === 'admin' ? { ...role, disabled: true } : role))}
		/>
	),
};
