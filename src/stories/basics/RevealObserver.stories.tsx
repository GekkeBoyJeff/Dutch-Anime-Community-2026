import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Content from '@/components/basics/Content';
import RevealObserver from '@/components/basics/RevealObserver';
import Section from '@/components/basics/Section';
import Title from '@/components/basics/Title';

const meta: Meta<typeof RevealObserver> = {
	title: 'Basics/RevealObserver',
	component: RevealObserver,
	parameters: {
		docs: { description: { component: 'The one reveal-on-scroll mechanism: mounted once in the site layout, it marks every `[data-reveal]` element (each `Section` emits that attribute) as revealed when it scrolls into view. The `html[data-motion]` attribute gates the hidden initial state, so content stays fully visible without JavaScript and for crawlers; reduced motion is handled in CSS. Blocks never implement their own reveal logic — they get it by rendering inside a Section.' } },
		layout: 'fullscreen',
	},
};

export default meta;

type Story = StoryObj<typeof RevealObserver>;

// Scroll the canvas: each Section below carries data-reveal and fades in as it enters the viewport.
// Render-only demo (the component itself renders nothing and takes no props).
export const Default: Story = {
	render: function Render() {
		return (
			<div>
				<RevealObserver />
				{['Watch parties', 'Game nights', 'Meetups & cons', 'Art & cosplay'].map((title) => (
					<Section key={title}>
						<div style={{ minBlockSize: '60vh', display: 'grid', alignContent: 'center', gap: '0.5rem', padding: '2rem' }}>
							<Title size={3} value={title} />
							<Content value="Scroll verder — elke sectie meldt zich zodra hij in beeld komt." />
						</div>
					</Section>
				))}
			</div>
		);
	},
};
