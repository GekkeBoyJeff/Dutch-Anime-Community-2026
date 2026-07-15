import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import Button from '@/components/basics/Button';
import Drawer from '@/components/components/Drawer';
import { DrawerProps } from '@/lib/content/schema/components/drawer';

const meta: Meta<typeof Drawer> = {
	title: 'Components/Drawer',
	component: Drawer,
	parameters: {
		docs: { description: { component: 'Side or bottom slide-in panel over Base UI Dialog: focus trap, scroll lock and Escape come free. `position` picks the edge, `size` sets the panel extent.' } },
		jsonSchema: { schema: DrawerProps },
	},
	args: {
		title: 'Filters',
		description: 'Narrow the results below.',
		position: 'right',
		size: '22rem',
		dismissible: true,
	},
	argTypes: {
		position: { control: 'inline-radio', options: ['left', 'right', 'bottom'] },
		size: { control: 'text' },
		dismissible: { control: 'boolean' },
		title: { control: 'text' },
		description: { control: 'text' },
	},
};

export default meta;

type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
	render: function Render(args) {
		const [open, setOpen] = useState(false);

		return (
			<>
				<Button onClick={() => setOpen(true)}>Open drawer</Button>
				<Drawer
					{...args}
					open={open}
					onOpenChange={setOpen}
					footer={
						<>
							<Button variant="ghost" onClick={() => setOpen(false)}>
								Reset
							</Button>
							<Button variant="primary" onClick={() => setOpen(false)}>
								Apply
							</Button>
						</>
					}
				>
					Panel content scrolls independently while the page behind it stays locked.
				</Drawer>
			</>
		);
	},
};

export const Left: Story = {
	args: { position: 'left', title: 'Navigation' },
	render: (args) => <Drawer {...args} trigger={<Button>Open left</Button>}>Menu items go here.</Drawer>,
};

export const Bottom: Story = {
	args: { position: 'bottom', size: '50dvh', title: 'Details' },
	render: (args) => <Drawer {...args} trigger={<Button>Open bottom sheet</Button>}>A bottom sheet on small screens.</Drawer>,
};
