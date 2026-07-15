import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Accordion from '@/components/basics/Accordion';
import AccordionItem from '@/components/basics/AccordionItem';
import { AccordionProps } from '@/lib/content/schema/basics/accordion';

const items = [
	{ value: 'shipping', title: 'How long does shipping take?', content: 'Most orders arrive within three to five working days.' },
	{ value: 'returns', title: 'What is the return policy?', content: 'Unworn items can be returned within thirty days for a full refund.' },
	{ value: 'support', title: 'How do I contact support?', content: 'Reach the team any day of the week through the in-app chat.' },
];

const meta: Meta<typeof Accordion> = {
	title: 'Basics/Accordion',
	component: Accordion,
	parameters: {
		docs: {
			description: {
				component:
					'A collapsible disclosure group built from AccordionItem. Pass `items` for the data-driven case (a Server page can render from validated content) or compose <AccordionItem> children by hand. Wraps Base UI Accordion for the keyboard, ARIA and height-measurement wiring.',
			},
		},
		jsonSchema: { schema: AccordionProps },
	},
	argTypes: {
		multiple: { control: 'boolean' },
		orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
	},
};

export default meta;

type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
	args: {
		items,
		multiple: false,
		orientation: 'vertical',
		defaultValue: ['shipping'],
	},
};

export const Multiple: Story = {
	...Default,
	args: {
		...Default.args,
		multiple: true,
		defaultValue: ['shipping', 'returns'],
	},
};

export const WithDisabledItem: Story = {
	...Default,
	args: {
		...Default.args,
		items: [items[0]!, { ...items[1]!, disabled: true }, items[2]!],
	},
};

// Composed from AccordionItem children instead of the `items` array — for full control over content.
export const Composed: Story = {
	...Default,
	args: {
		...Default.args,
		items: undefined,
	},
	render: (args) => (
		<Accordion {...args} defaultValue={['a']}>
			<AccordionItem value="a" title="Composed item one">
				Built from AccordionItem children directly, so the panel can hold any JSX.
			</AccordionItem>
			<AccordionItem value="b" title="Composed item two">
				Each item takes its own title and children.
			</AccordionItem>
		</Accordion>
	),
};
