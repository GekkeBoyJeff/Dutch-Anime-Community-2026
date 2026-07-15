import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Checkbox from '@/components/forms/Checkbox';
import { CheckboxProps } from '@/lib/content/schema/forms/checkbox';

const meta: Meta<typeof Checkbox> = {
	title: 'Forms/Checkbox',
	component: Checkbox,
	parameters: {
		docs: {
			description: {
				component:
					'A single tick-box. Wraps Base UI Checkbox — role="checkbox" + aria-checked (including "mixed" for indeterminate) plus a hidden input for native forms. With a label it renders a clickable row; without one it is just the box.',
			},
		},
		jsonSchema: { schema: CheckboxProps },
	},
	argTypes: {
		disabled: { control: 'boolean' },
		required: { control: 'boolean' },
		defaultChecked: { control: 'boolean' },
		indeterminate: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
	args: {
		label: 'I agree to the terms'
	}
};

export const Checked: Story = {
	...Default,
	args: {
		...Default.args,
		defaultChecked: true
	}
};

export const Indeterminate: Story = {
	...Default,
	args: {
		...Default.args,
		indeterminate: true,
		label: 'Select all'
	}
};

export const Disabled: Story = {
	...Default,
	args: {
		...Default.args,
		disabled: true,
		defaultChecked: true
	}
};

export const NoLabel: Story = {
	...Default,
	args: {
		...Default.args,
		label: undefined,
		'aria-label': 'Accept'
	}
};
