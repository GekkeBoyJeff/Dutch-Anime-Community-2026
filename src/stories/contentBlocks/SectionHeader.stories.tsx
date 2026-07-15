import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import SectionHeader from '@/components/contentBlocks/SectionHeader';

// Not a registry block (no Puck preset is generated) — the shared "section intro" helper that
// FeatureCards and Reviews compose.
const meta: Meta<typeof SectionHeader> = {
	title: 'ContentBlocks/SectionHeader',
	component: SectionHeader,
	parameters: {
		docs: { description: { component: 'The shared heading group (title + intro) that opens a content block. Renders nothing when both fields are absent, so a block passes its optional fields straight through. One definition, composed by the blocks that share this shape (FeatureCards, Reviews).' } },
	},
};

export default meta;

type Story = StoryObj<typeof SectionHeader>;

export const Default: Story = {
	args: {
		title: 'Wat leden zeggen',
		intro: 'Echte reviews van echte leden — zo voelt DAC van binnen.',
	},
};

export const TitleOnly: Story = {
	args: {
		title: 'Wat leden zeggen',
	},
};
