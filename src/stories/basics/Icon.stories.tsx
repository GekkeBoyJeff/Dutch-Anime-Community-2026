import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Icon, { ICONS } from '@/components/basics/Icon';
import { IconProps } from '@/lib/site/content/schema/basics/icon';

const meta: Meta<typeof Icon> = {
	title: 'Basics/Icon',
	component: Icon,
	parameters: {
		docs: {
			description: {
				component:
					'A single lucide-react SVG glyph, picked by name from the ICONS map. Decorative (`aria-hidden`), so the accessible label belongs on the surrounding interactive component. It inherits the text colour (`currentColor`) and is sized in `em`, so it tracks the font-size. An unknown name renders nothing.',
			},
		},
		jsonSchema: { schema: IconProps },
	},
	argTypes: {
		name: {
			control: 'select',
			options: Object.keys(ICONS),
		},
	},
};

export default meta;

type Story = StoryObj<typeof Icon>;

export const Default: Story = {
	args: {
		name: 'search',
	},
};
