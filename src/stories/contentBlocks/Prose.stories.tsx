import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Prose from '@/components/contentBlocks/Prose';
import { ProseProps } from '@/lib/content/schema/blocks/prose';

const meta: Meta<typeof Prose> = {
	title: 'ContentBlocks/Prose',
	component: Prose,
	parameters: {
		docs: { description: { component: 'Long-form text (e.g. a blog body) as HTML, rendered via Content. The .prose class governs the rhythm between headings and paragraphs.' } },
		jsonSchema: { schema: ProseProps },
	},
	argTypes: {
		colorset: {
			control: 'inline-radio',
			options: ['light', 'dark'],
		},
	},
};

export default meta;

type Story = StoryObj<typeof Prose>;

export const Default: Story = {
	args: {
		value: `
			<h2>Getting started</h2>
			<p>Long-form text (e.g. a blog body) rendered via Content. The <code>.prose</code> class governs the vertical rhythm, so headings, paragraphs and lists all breathe without extra markup.</p>
			<p>Another paragraph with a <a href="/about">link</a> in it, so you can see how inline elements sit within the flow.</p>
			<h3>A subsection</h3>
			<p>Nested headings borrow a smaller type role while keeping the same spacing scale.</p>
			<blockquote><p>A blockquote to check the indent, border and muted tone against the surrounding copy.</p></blockquote>
			<h4>Things to try</h4>
			<ul>
				<li>An unordered list item</li>
				<li>A second item with a bit more text to force it onto two lines on narrow screens</li>
				<li>A third, shorter one</li>
			</ul>
			<h4>Steps in order</h4>
			<ol>
				<li>First, write the content as HTML</li>
				<li>Then pass it through Content</li>
				<li>Finally, let <code>.prose</code> handle the rhythm</li>
			</ol>
		`,
	},
};
