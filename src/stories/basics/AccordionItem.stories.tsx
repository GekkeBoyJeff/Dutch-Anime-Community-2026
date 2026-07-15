import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Accordion from '@/components/basics/Accordion';
import AccordionItem from '@/components/basics/AccordionItem';
import { AccordionItemProps } from '@/lib/content/schema/basics/accordionItem';

// AccordionItem uses Base UI's per-set open context, so it must render inside an <Accordion>. The
// decorator wraps each story in one (opened by default) so a single item can be shown on its own.
const meta: Meta<typeof AccordionItem> = {
	title: 'Basics/AccordionItem',
	component: AccordionItem,
	parameters: {
		docs: {
			description: {
				component:
					'One collapsible row — header, trigger and panel in a single piece. Render it inside `<Accordion>` (which provides the open context), either directly as a child or via Accordion’s `items` prop.',
			},
		},
		jsonSchema: { schema: AccordionItemProps },
	},
	argTypes: {
		headingLevel: { control: { type: 'range', min: 2, max: 6, step: 1 } },
		disabled: { control: 'boolean' },
	},
	decorators: [
		(Story) => (
			<Accordion defaultValue={['item']}>
				<Story />
			</Accordion>
		),
	],
};

export default meta;

type Story = StoryObj<typeof AccordionItem>;

export const Default: Story = {
	args: {
		value: 'item',
		title: 'How long does shipping take?',
		content: 'Most orders arrive within three to five working days.',
		headingLevel: 3,
	},
};

export const Disabled: Story = {
	...Default,
	args: {
		...Default.args,
		disabled: true,
	},
};
