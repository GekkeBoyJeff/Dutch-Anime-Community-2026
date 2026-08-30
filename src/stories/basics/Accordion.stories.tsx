import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Accordion from '@/components/basics/Accordion';
import { AccordionProps } from '@/lib/site/content/schema/basics/accordion';

const shipping = { id: 'shipping', title: 'How long does shipping take?', value: 'Most orders arrive within three to five working days.' };
const returns = { id: 'returns', title: 'What is the return policy?', value: 'Unworn items can be returned within thirty days for a full refund.' };
const support = { id: 'support', title: 'How do I contact support?', value: 'Reach the team any day of the week through the in-app chat.' };

const items = [shipping, returns, support];

const meta: Meta<typeof Accordion> = {
	title: 'Basics/Accordion',
	component: Accordion,
	parameters: {
		docs: {
			description: {
				component:
					'A collapsible disclosure group built from AccordionItem rows. Wraps Base UI Accordion for the keyboard, ARIA and height-measurement wiring.',
			},
		},
		jsonSchema: { schema: AccordionProps },
	},
	argTypes: {
		multiple: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
	args: {
		items,
		multiple: false,
		defaultOpen: ['shipping'],
	},
};

export const Multiple: Story = {
	args: {
		...Default.args,
		multiple: true,
		defaultOpen: ['shipping', 'returns'],
	},
};

export const WithDisabledItem: Story = {
	args: {
		...Default.args,
		items: [shipping, { ...returns, disabled: true }, support],
	},
};
