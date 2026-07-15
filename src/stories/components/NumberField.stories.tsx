import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import NumberField from '@/components/components/NumberField';
import { NumberFieldProps } from '@/lib/content/schema/components/numberField';

const meta: Meta<typeof NumberField> = {
	title: 'Components/NumberField',
	component: NumberField,
	parameters: {
		docs: {
			description: {
				component:
					'A locale-aware stepper input for quantities, bookings and donations. The inner input carries role="spinbutton" with aria-value*/aria-valuetext (the formatted string), Arrow/Page/Home/End stepping (Alt → small, Shift → large), press-and-hold auto-repeat and optional wheel/drag scrubbing. A small client island.',
			},
		},
		jsonSchema: { schema: NumberFieldProps },
	},
	argTypes: {
		step: { control: 'number' },
		min: { control: 'number' },
		max: { control: 'number' },
		disabled: { control: 'boolean' },
		readOnly: { control: 'boolean' },
		required: { control: 'boolean' },
		scrub: { control: 'boolean' },
		allowWheelScrub: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof NumberField>;

export const Default: Story = {
	args: {
		label: 'Quantity',
		defaultValue: 1,
		min: 1,
	},
};

export const WithMinMax: Story = {
	...Default,
	args: { ...Default.args, label: 'Tickets', defaultValue: 2, min: 0, max: 6, description: 'Up to 6 per order.' },
};

export const Currency: Story = {
	...Default,
	args: {
		...Default.args,
		label: 'Donation',
		defaultValue: 25,
		step: 5,
		min: 0,
		locale: 'nl-NL',
		format: { style: 'currency', currency: 'EUR' },
	},
};

export const Percent: Story = {
	...Default,
	args: {
		...Default.args,
		label: 'Discount',
		defaultValue: 0.1,
		step: 0.05,
		min: 0,
		max: 1,
		format: { style: 'percent' },
	},
};

export const WithError: Story = {
	...Default,
	args: { ...Default.args, label: 'Guests', defaultValue: 0, min: 1, error: 'At least one guest is required.' },
};

export const Scrub: Story = {
	...Default,
	args: { ...Default.args, label: 'Volume', defaultValue: 50, min: 0, max: 100, scrub: true },
};

export const Disabled: Story = {
	...Default,
	args: {
		...Default.args,
		disabled: true
	}
};

export const Controlled: Story = {
	...Default,
	render: function Render(args) {
		const [value, setValue] = useState<number | null>(3);

		return <NumberField {...args} value={value} onValueChange={setValue} />;
	},
	args: { ...Default.args, label: 'Seats', min: 0, max: 10 },
};
