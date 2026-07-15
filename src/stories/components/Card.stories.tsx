import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Badge from '@/components/basics/Badge';
import Button from '@/components/basics/Button';
import Content from '@/components/basics/Content';
import Media from '@/components/basics/Media';
import Title from '@/components/basics/Title';
import Card from '@/components/components/Card';
import { CardProps } from '@/lib/content/schema/components/card';
import { demoImage } from '@/stories/basics/Media.stories';

const meta: Meta<typeof Card> = {
	title: 'Components/Card',
	component: Card,
	parameters: {
		docs: {
			description: {
				component:
					'Generic surface container every card grid composes — a grid never hand-rolls its own card markup, it puts a block-specific body inside this shell. Renders an `<article>`, or adds an Interactive stretched link when href is set (the whole card one click target, `:focus-within` ring for keyboard users). Surfaces: standard, `flat`, `panel`, `polaroid` (padded media frame, floating shadow) and `bare` (structure without chrome). Stays a Server Component.',
			},
		},
		jsonSchema: { schema: CardProps },
	},
	argTypes: {
		variant: {
			control: 'inline-radio',
			options: [undefined, 'flat', 'panel', 'polaroid', 'bare'],
		},
		href: { control: 'text' },
	},
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
	args: {
		tagline: 'Guide',
		meta: 'Updated today',
		header: <Title element="h3" size={4} value="A reusable surface" />,
		children: <Content size="small" value="The base all card grids build on: image, header, body, meta and footer slots." />,
	},
};

export const WithMedia: Story = {
	...Default,
	args: {
		...Default.args,
		image: <Media {...demoImage} alt="" ratio="16/9" />,
		tagline: undefined,
	},
};

export const WithFooter: Story = {
	...Default,
	args: {
		...Default.args,
		footer: <Button variant="secondary" url="https://example.com/">Lees meer</Button>,
	},
};

export const Flat: Story = {
	...Default,
	args: {
		...Default.args,
		variant: 'flat',
	},
};

export const Panel: Story = {
	...Default,
	args: {
		...Default.args,
		variant: 'panel',
	},
};

// The HighlightCards shape: a padded frame around the media with a floating shadow. Block-specific
// overlays (an index chip, badges) go inside the image slot; the shell stays generic.
export const Polaroid: Story = {
	args: {
		variant: 'polaroid',
		image: <Media {...demoImage} alt="" ratio="5 / 4" />,
		tagline: 'Community',
		header: <Title element="h3" size={4} value="Samen naar DCC" />,
		children: <Content size="small" value="Met z'n allen naar Dutch Comic Con — cosplay, foto's en veel te veel merch." />,
	},
};

// The ProfileCards shape: card structure (slots, stretched link, hover contract) without any
// surface chrome — for compositions that carry no card surface of their own.
export const Bare: Story = {
	args: {
		variant: 'bare',
		image: <Media {...demoImage} alt="" ratio="4 / 5" />,
		header: <Title element="h3" size={5} value="Amelia" />,
		children: <Content size="small" value="Mascotte en officieel gezicht van de community." />,
	},
};

export const Clickable: Story = {
	...Default,
	args: {
		...Default.args,
		href: 'https://example.com/',
		linkLabel: 'Clickable card',
		meta: 'Whole card is one click target',
		header: <Title element="h3" size={4} value="Clickable card" />,
	},
};

export const WithBadges: Story = {
	...Default,
	args: {
		...Default.args,
		header: (
			<>
				<Badge variant="primary">New</Badge>
				<Title element="h3" size={4} value="Card with a badge header" />
			</>
		),
	},
};
