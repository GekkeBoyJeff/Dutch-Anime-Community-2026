import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, screen, userEvent, waitFor } from 'storybook/test';

import Combobox from '@/components/components/Combobox';
import { ComboboxProps } from '@/lib/content/schema/components/combobox';

const FRUITS = ['Apple', 'Apricot', 'Banana', 'Blueberry', 'Cherry', 'Grape', 'Mango', 'Orange', 'Peach', 'Pear'];

const meta: Meta<typeof Combobox<string>> = {
	title: 'Components/Combobox',
	component: Combobox,
	parameters: {
		docs: {
			description: {
				component:
					'A text input plus a filtered listbox popup (role="combobox" + aria-activedescendant). A thin client-side wrapper over Base UI Combobox — it solves the hard a11y surface; we only map our props and style the data-attributes.',
			},
		},
		jsonSchema: { schema: ComboboxProps },
	},
	argTypes: {
		autoHighlight: { control: 'boolean' },
		disabled: { control: 'boolean' },
		readOnly: { control: 'boolean' },
		required: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof Combobox<string>>;

// Empty and searchable: click to open the full list, type to filter.
export const Default: Story = {
	args: {
		items: FRUITS,
		label: 'Search fruit',
		placeholder: 'Search fruit…',
	},
	play: async () => {
		const input = await screen.findByRole('combobox', { name: 'Search fruit' });
		await userEvent.click(input);
		// Opening reveals all options with their visible label text (guards the portal-surface and
		// auto-action regressions that previously hid the option text).
		await waitFor(() => expect(screen.getByRole('option', { name: 'Apple' })).toBeVisible());
		const options = screen.getAllByRole('option');
		expect(options).toHaveLength(10);
		expect(options[0]).toHaveTextContent('Apple');
	},
};

export const Disabled: Story = {
	args: {
		...Default.args,
		disabled: true
	}
};

export const ReadOnly: Story = {
	args: {
		...Default.args,
		readOnly: true,
		defaultValue: 'Banana'
	}
};

// Object items with a custom option layout (emoji + name) via `renderItem` + `itemToStringLabel`.
export const CustomOptions: StoryObj<typeof Combobox> = {
	render: () => {
		type Fruit = { name: string; emoji: string };
		const fruits: Fruit[] = [
			{ name: 'Apple', emoji: '🍎' },
			{ name: 'Banana', emoji: '🍌' },
			{ name: 'Cherry', emoji: '🍒' },
			{ name: 'Grape', emoji: '🍇' },
			{ name: 'Peach', emoji: '🍑' },
		];

		return (
			<Combobox<Fruit>
				items={fruits}
				label="Search fruit"
				placeholder="Search fruit…"
				itemToStringLabel={(fruit) => fruit.name}
				renderItem={(fruit) => (
					<>
						<span aria-hidden="true">{fruit.emoji}</span> {fruit.name}
					</>
				)}
			/>
		);
	},
};
