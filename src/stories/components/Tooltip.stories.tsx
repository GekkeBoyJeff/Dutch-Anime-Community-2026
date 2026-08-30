import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Button from '@/components/basics/Button';
import Tooltip, { TooltipProvider } from '@/components/components/Tooltip';
import { TooltipProps } from '@/lib/site/content/schema/components/tooltip';

const meta: Meta<typeof Tooltip> = {
	title: 'Components/Tooltip',
	component: Tooltip,
	parameters: {
		docs: { description: { component: 'Accessible hover/focus tooltip wrapping Base UI. The trigger keeps focus and gets aria-describedby; the bubble holds only non-interactive text. Mount one TooltipProvider near the app root.' } },
		jsonSchema: { schema: TooltipProps },
	},
	decorators: [
		(Story) => {
			return (
				<TooltipProvider>
					<div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
						<Story />
					</div>
				</TooltipProvider>
			);
		},
	],
	argTypes: {
		side: { control: 'inline-radio', options: ['top', 'bottom', 'left', 'right'] },
		align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
		sideOffset: { control: 'number' },
		arrow: { control: 'boolean' },
		delay: { control: 'number' },
		disabled: { control: 'boolean' },
		label: { control: 'text' },
	},
};

export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
	args: {
		label: 'Save changes',
		side: 'top',
		align: 'center',
		arrow: true,
		disabled: false,
	},
	render: (args) => (
		<Tooltip {...args}>
			<Button variant="primary" value="Hover or focus me" />
		</Tooltip>
	),
};

export const Bottom: Story = {
	...Default,
	args: { ...Default.args, side: 'bottom' },
	render: (args) => (
		<Tooltip {...args}>
			<Button variant="secondary" value="Bottom side" />
		</Tooltip>
	),
};

export const NoArrow: Story = {
	...Default,
	args: { ...Default.args, arrow: false },
	render: (args) => (
		<Tooltip {...args}>
			<Button variant="ghost" value="No arrow" />
		</Tooltip>
	),
};

export const RichLabel: Story = {
	...Default,
	args: { ...Default.args, label: 'Press <strong>S</strong> to save' },
	render: (args) => (
		<Tooltip {...args}>
			<Button variant="primary" value="Rich label" />
		</Tooltip>
	),
};
