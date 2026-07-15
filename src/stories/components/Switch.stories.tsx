import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import Switch from '@/components/components/Switch';
import { SwitchProps } from '@/lib/content/schema/components/switch';

const meta: Meta<typeof Switch> = {
	title: 'Components/Switch',
	component: Switch,
	parameters: {
		docs: {
			description: {
				component:
					'A binary on/off control for settings and opt-ins. role="switch" + aria-checked (distinct from Toggle\'s button + aria-pressed). Needs an accessible name via aria-label, aria-labelledby, or an associated label.',
			},
		},
		jsonSchema: { schema: SwitchProps },
	},
	argTypes: {
		checked: { control: 'boolean' },
		defaultChecked: { control: 'boolean' },
		disabled: { control: 'boolean' },
		readOnly: { control: 'boolean' },
		required: { control: 'boolean' },
		'aria-label': { control: 'text' },
	},
};

export default meta;

type Story = StoryObj<typeof Switch>;

export const Default: Story = {
	args: {
		'aria-label': 'Enable notifications',
	},
};

export const On: Story = {
	...Default,
	args: {
		...Default.args,
		defaultChecked: true
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

export const ReadOnly: Story = {
	...Default,
	args: {
		...Default.args,
		readOnly: true,
		defaultChecked: true
	}
};

export const WithLabel: Story = {
	...Default,
	render: (args) => {
		return (
			<label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
				<Switch {...args} aria-label={undefined} id="notify" />
				Email notifications
			</label>
		);
	},
};

export const Controlled: Story = {
	...Default,
	render: function Render(args) {
		const [on, setOn] = useState(false);

		return <Switch {...args} checked={on} onCheckedChange={setOn} />;
	},
};
