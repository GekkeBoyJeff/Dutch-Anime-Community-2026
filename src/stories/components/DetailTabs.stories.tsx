import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import DetailTabs from '@/components/components/DetailTabs';

const meta: Meta<typeof DetailTabs> = {
	title: 'Components/DetailTabs',
	component: DetailTabs,
	parameters: {
		docs: {
			description: {
				component:
					'Wraps Tabs to collapse its two index-matched arrays (items + panels) into one list of {...item, panel} entries — removing the item[i] ↔ panel[i] mismatch footgun while keeping Base UI\'s numeric-index model. Ideal for a beheer detail view (Info / Aanwezigheid / Agenda …).',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof DetailTabs>;

export const Default: Story = {
	render: () => (
		<DetailTabs
			label="Conventiedetail"
			defaultValue={0}
			tabs={[
				{ label: 'Info', panel: <p>Algemene informatie over de conventie.</p> },
				{ label: 'Aanwezigheid', icon: 'users', panel: <p>Wie is aangemeld en aanwezig.</p> },
				{ label: 'Agenda', icon: 'calendar', panel: <p>Shifts en tijden.</p> },
				{ label: 'Logs', disabled: true, panel: <p>Nog niet beschikbaar.</p> },
			]}
		/>
	),
};
