import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Field from '@/components/forms/Field';
import Select from '@/components/forms/Select';
import { SelectProps } from '@/lib/content/schema/forms/select';

const flat = [
	{ value: 'nl', label: 'Netherlands' },
	{ value: 'be', label: 'Belgium' },
	{ value: 'de', label: 'Germany' },
	{ value: 'fr', label: 'France' },
	{ value: 'es', label: 'Spain' },
	{ value: 'it', label: 'Italy', disabled: true },
];

const grouped = [
	{
		label: 'Europe',
		options: [
			{ value: 'nl', label: 'Netherlands' },
			{ value: 'be', label: 'Belgium' },
			{ value: 'de', label: 'Germany' },
		],
	},
	{
		label: 'Asia',
		options: [
			{ value: 'jp', label: 'Japan' },
			{ value: 'kr', label: 'South Korea' },
		],
	},
];

const meta: Meta<typeof Select> = {
	title: 'Forms/Select',
	component: Select,
	parameters: {
		docs: {
			description: {
				component:
					'A single- or multi-select with two modes behind one prop: a custom listbox (Base UI Select — typeahead, arrow-key navigation, aria-activedescendant, floating positioning) and a native `<select>` for very long lists and bulletproof mobile UX.',
			},
		},
		jsonSchema: { schema: SelectProps },
	},
	argTypes: {
		placeholder: { control: 'text' },
		disabled: { control: 'boolean' },
		required: { control: 'boolean' },
		multiple: { control: 'boolean' },
		native: { control: 'boolean' },
		side: { control: 'inline-radio', options: ['top', 'bottom', 'left', 'right'] },
	},
};

export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {
	args: {
		options: flat,
		placeholder: 'Choose a country',
		'aria-label': 'Country',
	},
};

export const WithGroups: Story = {
	...Default,
	args: {
		...Default.args,
		options: grouped
	}
};

export const Multiple: Story = {
	...Default,
	args: {
		...Default.args,
		multiple: true,
		placeholder: 'Choose countries'
	}
};

export const Native: Story = {
	...Default,
	args: {
		...Default.args,
		native: true
	}
};

export const InsideField: Story = {
	...Default,
	render: (args) => (
		<Field name="country">
			<Field.Label>Country</Field.Label>
			<Select {...args} aria-label={undefined} />
			<Field.Description>Where the order ships to.</Field.Description>
		</Field>
	),
};
