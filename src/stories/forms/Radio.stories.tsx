import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Radio from '@/components/forms/Radio';
import RadioGroup from '@/components/forms/RadioGroup';
import { RadioProps } from '@/lib/content/schema/forms/radio';

const meta: Meta<typeof Radio> = {
	title: 'Forms/Radio',
	component: Radio,
	parameters: {
		docs: {
			description: {
				component:
					'A single choice. Wraps Base UI Radio — role="radio" + aria-checked plus a hidden input for native forms. With a label it renders a clickable row; without one it is just the dot. It always lives inside a RadioGroup, which owns the selected value and the arrow-key navigation, so every story below supplies one.',
			},
		},
		jsonSchema: { schema: RadioProps },
	},
	argTypes: {
		disabled: { control: 'boolean' },
		required: { control: 'boolean' },
	},
	decorators: [
		(Story) => (
			<RadioGroup aria-label="Shipping method" defaultValue="standard">
				<Story />
			</RadioGroup>
		),
	],
};

export default meta;

type Story = StoryObj<typeof Radio>;

export const Default: Story = {
	args: {
		value: 'express',
		label: 'Express — next business day',
	},
};

// The enclosing group starts on `standard`, so this is the selected one.
export const Selected: Story = {
	args: {
		value: 'standard',
		label: 'Standard — 3–5 business days',
	},
};

export const Disabled: Story = {
	args: {
		value: 'freight',
		label: 'Freight (over 30kg)',
		disabled: true,
	},
};

// Without a label it is just the dot — give it its own accessible name.
export const WithoutLabel: Story = {
	args: {
		value: 'pickup',
		'aria-label': 'Pick up in store',
	},
};
