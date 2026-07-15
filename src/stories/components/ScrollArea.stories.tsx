import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ScrollArea from '@/components/components/ScrollArea';
import { ScrollAreaProps } from '@/lib/content/schema/components/scrollArea';

const lines = Array.from({ length: 30 }, (_, index) => `Regel ${index + 1} met wat tekst om te scrollen.`);

const meta: Meta<typeof ScrollArea> = {
	title: 'Components/ScrollArea',
	component: ScrollArea,
	parameters: {
		docs: {
			description: {
				component:
					'A styled, cross-browser scrollbar for an overflow region (menu, dialog, code block, sidebar). The viewport stays natively scrollable and keyboard-accessible — this only replaces the cosmetic scrollbar. Add it only where styled scrollbars are actually wanted.',
			},
		},
		jsonSchema: { schema: ScrollAreaProps },
	},
	argTypes: {
		orientation: { control: 'inline-radio', options: ['vertical', 'horizontal', 'both'] },
	},
	decorators: [
		(Story) => (
			<div style={{ height: '14rem', maxWidth: '24rem', border: '1px solid #8884', borderRadius: '0.5rem' }}>
				<Story />
			</div>
		),
	],
};

export default meta;

type Story = StoryObj<typeof ScrollArea>;

export const Default: Story = {
	args: { orientation: 'vertical' },
	render: (args) => (
		<ScrollArea {...args}>
			<div style={{ height: '14rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
				{lines.map((line) => (
					<p key={line} style={{ margin: 0 }}>
						{line}
					</p>
				))}
			</div>
		</ScrollArea>
	),
};

export const Both: Story = {
	...Default,
	args: { ...Default.args, orientation: 'both' },
	render: (args) => (
		<ScrollArea {...args}>
			<div style={{ width: '40rem', height: '14rem', padding: '0.75rem' }}>
				<p style={{ margin: 0 }}>Scrollt in beide richtingen.</p>
				{lines.map((line) => (
					<p key={line} style={{ margin: '0.5rem 0', whiteSpace: 'nowrap' }}>
						{line} — en nog wat extra breedte om horizontaal te scrollen.
					</p>
				))}
			</div>
		</ScrollArea>
	),
};
