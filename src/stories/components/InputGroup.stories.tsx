import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Icon from '@/components/basics/Icon';
import Interactive from '@/components/basics/Interactive';
import InputGroup from '@/components/components/InputGroup';
import { InputGroupProps } from '@/lib/content/schema/components/inputGroup';

const meta: Meta<typeof InputGroup> = {
	title: 'Components/InputGroup',
	component: InputGroup,
	parameters: {
		docs: {
			description: {
				component:
					'Wraps a single control with leading and/or trailing addons (icon, prefix, inline button) in one bordered shell that shares the focus ring. The composition pattern behind search fields, password reveal toggles and currency inputs. Stays a Server Component; any interactive addon is its own island.',
			},
		},
		jsonSchema: { schema: InputGroupProps },
	},
	argTypes: {
		disabled: { control: 'boolean' },
		invalid: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof InputGroup>;

export const Default: Story = {
	args: {
		leading: <Icon name="search" />,
		children: <input placeholder="Search events" aria-label="Search events" />,
	},
};

export const Currency: Story = {
	...Default,
	args: {
		...Default.args,
		leading: '€',
		children: <input type="text" inputMode="decimal" placeholder="0,00" aria-label="Amount" />,
	},
};

export const UnitSuffix: Story = {
	...Default,
	args: {
		...Default.args,
		leading: undefined,
		trailing: 'kg',
		children: <input type="text" inputMode="numeric" placeholder="0" aria-label="Weight" />,
	},
};

export const TrailingButton: Story = {
	...Default,
	args: {
		...Default.args,
		leading: <Icon name="search" />,
		trailing: <Interactive aria-label="Clear search">Clear</Interactive>,
		children: <input defaultValue="anime" aria-label="Search events" />,
	},
};

export const Invalid: Story = {
	...Default,
	args: { ...Default.args, leading: '@', invalid: true, children: <input aria-label="Username" /> },
};

export const Disabled: Story = {
	...Default,
	args: { ...Default.args, leading: <Icon name="search" />, disabled: true },
};
