import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import PersonPicker, { type PersonValue } from '@/components/dashboard/forms/PersonPicker';

const users = [
	{ id: 'u1', username: 'Jasmijn' },
	{ id: 'u2', username: 'Kevin' },
	{ id: 'u3', username: null },
];

const meta: Meta<typeof PersonPicker> = {
	title: 'Dashboard/Forms/PersonPicker',
	component: PersonPicker,
	parameters: {
		docs: {
			description: {
				component:
					'Owner / assigned-to picker: link a DB user (Discord account) when possible, else fall back to a free-text name. Emits both userId and label so callers can store either.',
			},
		},
	},
	decorators: [(Story) => <div style={{ display: 'grid', gap: '1rem', maxWidth: '20rem' }}><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof PersonPicker>;

const Controlled = (props: { users: typeof users; initial: PersonValue; labelText?: string }) => {
	const [value, setValue] = useState<PersonValue>(props.initial);
	return <PersonPicker users={props.users} value={value} onChange={setValue} labelText={props.labelText} />;
};

export const Default: Story = {
	render: () => <Controlled users={users} initial={{ userId: 'u1', label: null }} />,
};

export const Empty: Story = {
	name: 'Leeg (alleen vrije tekst)',
	render: () => <Controlled users={users} initial={{ userId: null, label: null }} />,
};

export const AccountSelected: Story = {
	name: 'Account geselecteerd',
	render: () => <Controlled users={users} initial={{ userId: 'u2', label: null }} />,
};

export const FreeTextMode: Story = {
	name: 'Vrije-tekst-modus',
	render: () => <Controlled users={users} initial={{ userId: null, label: 'Externe leverancier' }} />,
};

export const CustomLabel: Story = {
	name: 'Custom label',
	render: () => <Controlled users={users} initial={{ userId: null, label: null }} labelText="Toegewezen aan" />,
};
