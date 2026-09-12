import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { structures } from '@/content/structures';
import { SiteStructures } from '@/lib/site/content/document';

import SiteChrome from './SiteChrome';

const meta: Meta<typeof SiteChrome> = {
	title: 'Structures/SiteChrome',
	component: SiteChrome,
	parameters: {
		layout: 'fullscreen',
		docs: { description: { component: 'Composes the site-wide chrome (announcement bar, navigation, footer) around the page content. The (website) layout and the visual builder preview both render through this component, fed by the validated data in src/content/structures.ts.' } },
		jsonSchema: { schema: SiteStructures },
	},
};

export default meta;

type Story = StoryObj<typeof SiteChrome>;

export const Default: Story = {
	args: {
		structures,
		children: (
			<main style={{
				minBlockSize: '70vh',
				display: 'grid',
				placeContent: 'center',
				textAlign: 'center',
				padding: '6rem 2rem 4rem',
			}}>
				<p>Hier rendert de pagina-inhoud — tussen de navigatie en de footer.</p>
			</main>
		),
	},
};
