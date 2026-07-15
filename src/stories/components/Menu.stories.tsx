import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Button from '@/components/basics/Button';
import Menu from '@/components/components/Menu';
import { MenuProps } from '@/lib/content/schema/components/menu';

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
		<Menu {...args} trigger={<Button variant="secondary">Opties</Button>}>
			<Menu.Item icon="edit">Bewerken</Menu.Item>
			<Menu.Item icon="copy">Dupliceren</Menu.Item>
			<Menu.Separator />
			<Menu.Item icon="trash">Verwijderen</Menu.Item>
		</Menu>
	),
};

export const WithGroupsAndSeparator: Story = {
	args: { ...Default.args },
	render: (args) => (
		<Menu {...args} trigger={<Button variant="secondary">Account</Button>}>
			<Menu.Group>
				<Menu.GroupLabel>Profiel</Menu.GroupLabel>
				<Menu.Item icon="user">Profiel bekijken</Menu.Item>
				<Menu.Item icon="settings">Instellingen</Menu.Item>
			</Menu.Group>
			<Menu.Separator />
			<Menu.Group>
				<Menu.GroupLabel>Sessie</Menu.GroupLabel>
				<Menu.Item icon="logout">Uitloggen</Menu.Item>
			</Menu.Group>
		</Menu>
	),
};

export const WithCheckboxes: Story = {
	args: { ...Default.args },
	render: (args) => (
		<Menu {...args} trigger={<Button variant="secondary">Kolommen</Button>}>
			<Menu.GroupLabel>Toon kolommen</Menu.GroupLabel>
			<Menu.CheckboxItem defaultChecked>Titel</Menu.CheckboxItem>
			<Menu.CheckboxItem defaultChecked>Studio</Menu.CheckboxItem>
			<Menu.CheckboxItem>Score</Menu.CheckboxItem>
		</Menu>
	),
};

export const WithRadioGroup: Story = {
	args: { ...Default.args },
	render: (args) => (
		<Menu {...args} trigger={<Button variant="secondary">Sorteer op</Button>}>
			<Menu.RadioGroup defaultValue="newest">
				<Menu.RadioItem value="newest">Nieuwste eerst</Menu.RadioItem>
				<Menu.RadioItem value="oldest">Oudste eerst</Menu.RadioItem>
				<Menu.RadioItem value="top">Best beoordeeld</Menu.RadioItem>
			</Menu.RadioGroup>
		</Menu>
	),
};

export const WithLinkItems: Story = {
	args: { ...Default.args },
	render: (args) => (
		<Menu {...args} trigger={<Button variant="secondary">Meer</Button>}>
			<Menu.Item url="/community">Community</Menu.Item>
			<Menu.Item url="https://discord.gg/dutchanimecommunity" target="_blank">
				Discord
			</Menu.Item>
		</Menu>
	),
};
