import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import FaqAccordion from '@/components/contentBlocks/FaqAccordion';
import { FaqAccordionProps } from '@/lib/site/content/schema/blocks/faqAccordion';

const meta: Meta<typeof FaqAccordion> = {
	title: 'ContentBlocks/FaqAccordion',
	component: FaqAccordion,
	parameters: {
		docs: { description: { component: 'FAQ section built on the native `<details>` element: open/close needs zero JavaScript. Numbering runs continuously across category groups.' } },
		jsonSchema: { schema: FaqAccordionProps },
	},
	argTypes: {
		colorset: { control: 'inline-radio', options: ['light', 'dark'] },
	},
};

export default meta;

type Story = StoryObj<typeof FaqAccordion>;

export const Default: Story = {
	args: {
		heading: { title: 'Frequently asked questions', tagline: 'Help', intro: 'Everything you might want to know before you start.' },
		items: [
			{ id: 'q1', title: 'What is this starter?', value: 'A typed, content-as-data Next.js starter you compose pages from.' },
			{ id: 'q2', title: 'Do I need a CMS?', value: 'No. Content is validated data, so a CMS is optional and easy to add later.' },
			{ id: 'q3', title: 'Does it work without JavaScript?', value: 'The accordion does — it is a native `<details>`, so it opens before hydration.' },
		],
	},
};

export const Numbered: Story = {
	...Default,
	args: {
		...Default.args,
		numbered: true,
	},
};

export const SingleOpen: Story = {
	...Default,
	args: {
		...Default.args,
		singleOpen: true,
	},
};

export const Grouped: Story = {
	...Default,
	args: {
		...Default.args,
		groupByCategory: true,
		numbered: true,
		items: [
			{ id: 'b1', category: 'Billing', title: 'How do I update my card?', value: 'From the billing page in your account settings.' },
			{ id: 'b2', category: 'Billing', title: 'Can I get an invoice?', value: 'Yes, invoices are emailed and downloadable any time.' },
			{ id: 'a1', category: 'Account', title: 'How do I reset my password?', value: 'Use the reset link on the sign-in screen.' },
			{ id: 'u1', title: 'Something else?', value: 'Uncategorised questions fall under a single fallback heading.' },
		],
	},
};
