import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Button from '@/components/basics/Button';
import Popover from '@/components/components/Popover';
import { PopoverProps } from '@/lib/content/schema/components/popover';

const meta: Meta<typeof Popover> = {
	title: 'Components/Popover',
	component: Popover,
	parameters: {
		docs: { description: { component: 'Foundational anchored, dismissable floating panel over Base UI: collision-aware positioning, focus management and the Dialog ARIA pattern come free. Menu, Combobox and Select build on it.' } },
		jsonSchema: { schema: PopoverProps },
	},
	decorators: [
		(Story) => {
			return (
				<div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
					<Story />
				</div>
			);
		},
	],
	argTypes: {
		side: { control: 'inline-radio', options: ['top', 'bottom', 'left', 'right', 'inline-start', 'inline-end'] },
		align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
		sideOffset: { control: 'number' },
		alignOffset: { control: 'number' },
		showArrow: { control: 'boolean' },
		modal: { control: 'boolean' },
		title: { control: 'text' },
	},
};

export default meta;

type Story = StoryObj<typeof Popover>;

export const Default: Story = {
	args: {
		title: 'Quick actions',
		side: 'bottom',
		align: 'center',
		sideOffset: 8,
		showArrow: false,
		modal: false,
	},
	render: (args) => (
		<Popover {...args} trigger={<Button>Open</Button>}>
			<p style={{ margin: 0 }}>A short anchored panel. Press Escape or click outside to dismiss.</p>
		</Popover>
	),
};

export const Placements: Story = {
	...Default,
	render: (args) => (
		<Popover {...args} trigger={<Button variant="secondary">Placement</Button>}>
			<p style={{ margin: 0 }}>Use the controls to eyeball every side and alignment.</p>
		</Popover>
	),
};

export const WithArrow: Story = {
	...Default,
	args: { ...Default.args, showArrow: true },
	render: (args) => (
		<Popover {...args} trigger={<Button variant="ghost">With arrow</Button>}>
			<p style={{ margin: 0 }}>The pointer arrow is opt-in.</p>
		</Popover>
	),
};
