import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Badge from '@/components/basics/Badge';
import Person from '@/components/components/Person';

const meta: Meta<typeof Person> = {
	title: 'Components/Person',
	component: Person,
	parameters: {
		docs: { description: { component: 'A human, shown as a human: avatar with an optional presence dot, name over role, and a trailing slot.' } },
	},
	argTypes: {
		status: { control: 'inline-radio', options: [undefined, 'online', 'busy', 'away', 'offline'] },
		loading: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof Person>;

export const Default: Story = {
	args: { name: 'Jeffrey de Vries', role: 'Yakuza' },
};

export const WithStatus: Story = {
	args: { name: 'Sanne Bakker', role: 'Stand-staff', status: 'online' },
};

export const Interactive: Story = {
	args: { name: 'Milan Jansen', role: 'Auteur', href: '/dashboard/moderation', chevron: true },
};

export const WithTrailing: Story = {
	args: { name: 'Eva Smit', role: 'Beheerder', trailing: <Badge variant="primary">3 shifts</Badge> },
};

export const Loading: Story = {
	args: { name: 'Jeffrey de Vries', role: 'Yakuza', loading: true },
};

export const Roster: Story = {
	render: () => (
		<div>
			<Person name="Jeffrey de Vries" role="Yakuza" status="online" trailing={<Badge variant="primary">4</Badge>} />
			<Person name="Sanne Bakker" role="Stand-staff" status="away" />
			<Person name="Milan Jansen" role="Auteur" status="offline" />
		</div>
	),
};
