import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Button from '@/components/basics/Button';
import Menu from '@/components/components/Menu';
import { MenuProps } from '@/lib/site/content/schema/components/menu';

const meta: Meta<typeof Menu> = {
	title: 'Components/Menu',
	component: Menu,
	parameters: {
		docs: {
			description: {
				component:
					'Action / dropdown / kebab menu with roving focus, typeahead, checkbox and radio items. Wraps Base UI Menu so the a11y-hard focus management and collision positioning are handled. A client island; the page around it stays server.',
			},
		},
		jsonSchema: { schema: MenuProps },
	},
	argTypes: {
		side: { control: 'inline-radio', options: ['top', 'bottom', 'left', 'right', 'inline-start', 'inline-end'] },
		align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
		modal: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof Menu>;

export const Default: Story = {
	args: {
		side: 'bottom',
		align: 'start',
		modal: true,
	},
	render: (args) => (
		<Menu {...args} trigger={<Button variant="secondary" value="Opties" />}>
			<Menu.Item icon="edit" label="Bewerken" />
			<Menu.Item icon="copy" label="Dupliceren" />
			<Menu.Separator />
			<Menu.Item icon="trash" label="Verwijderen" />
		</Menu>
	),
};

export const WithGroupsAndSeparator: Story = {
	args: { ...Default.args },
	render: (args) => (
		<Menu {...args} trigger={<Button variant="secondary" value="Account" />}>
			<Menu.Group>
				<Menu.GroupLabel>Profiel</Menu.GroupLabel>
				<Menu.Item icon="user" label="Profiel bekijken" />
				<Menu.Item icon="settings" label="Instellingen" />
			</Menu.Group>
			<Menu.Separator />
			<Menu.Group>
				<Menu.GroupLabel>Sessie</Menu.GroupLabel>
				<Menu.Item icon="logout" label="Uitloggen" />
			</Menu.Group>
		</Menu>
	),
};

export const WithCheckboxes: Story = {
	args: { ...Default.args },
	render: (args) => (
		<Menu {...args} trigger={<Button variant="secondary" value="Kolommen" />}>
			<Menu.GroupLabel>Toon kolommen</Menu.GroupLabel>
			<Menu.CheckboxItem label="Titel" defaultChecked />
			<Menu.CheckboxItem label="Studio" defaultChecked />
			<Menu.CheckboxItem label="Score" />
		</Menu>
	),
};

export const WithRadioGroup: Story = {
	args: { ...Default.args },
	render: (args) => (
		<Menu {...args} trigger={<Button variant="secondary" value="Sorteer op" />}>
			<Menu.RadioGroup defaultValue="newest">
				<Menu.RadioItem value="newest" label="Nieuwste eerst" />
				<Menu.RadioItem value="oldest" label="Oudste eerst" />
				<Menu.RadioItem value="top" label="Best beoordeeld" />
			</Menu.RadioGroup>
		</Menu>
	),
};

// Right-click (or long-press) the surface to open the same styled menu. Used to give table rows and
// cards the same actions as their "⋯" overflow menu. Destructive items carry the danger idiom.
export const Context: Story = {
	render: () => (
		<Menu.Context
			ariaLabel="Rij-acties"
			trigger={
				<div
					style={{
						display: 'grid',
						placeItems: 'center',
						blockSize: '8rem',
						borderRadius: '0.75rem',
						boxShadow: 'inset 0 0 0 0.0625rem var(--border)',
						color: 'var(--color-secondary)',
					}}
				>
					Rechtsklik hier
				</div>
			}
		>
			<Menu.Item icon="copy" label="Dupliceren" />
			<Menu.Item icon="edit" label="Bewerken" />
			<Menu.Separator />
			<Menu.Item icon="trash" label="Verwijderen" danger />
		</Menu.Context>
	),
};

export const WithLinkItems: Story = {
	args: { ...Default.args },
	render: (args) => (
		<Menu {...args} trigger={<Button variant="secondary" value="Meer" />}>
			<Menu.Item url="/community" label="Community" />
			<Menu.Item url="https://discord.gg/dutchanimecommunity" target="_blank" label="Discord" />
		</Menu>
	),
};
