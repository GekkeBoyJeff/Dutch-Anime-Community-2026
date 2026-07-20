import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import DatePicker, { type DateRangeValue } from '@/components/dashboard/components/DatePicker';

const meta: Meta<typeof DatePicker> = {
	title: 'Dashboard/Components/DatePicker',
	component: DatePicker,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'A date / date-range picker (research-visual §3): react-day-picker mounted in the shared Base UI Popover and skinned entirely on the admin tokens — the replacement for native mm/dd/yyyy inputs. Range mode adds a dual-highlight and quick-range presets (Vandaag, 7 dagen, Deze maand, Dit jaar). Controlled; the parent owns the value. Month and weekday names come from Intl (nl-NL), so no date-fns locale is pulled in.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof DatePicker>;

export const Single: Story = {
	render: () => {
		const Demo = () => {
			const [value, setValue] = useState<Date | undefined>(undefined);
			return <div style={{ maxWidth: '18rem' }}><DatePicker value={value} onValueChange={setValue} aria-label="Datum" placeholder="Kies datum" /></div>;
		};
		return <Demo />;
	},
};

export const Range: Story = {
	render: () => {
		const Demo = () => {
			const [value, setValue] = useState<DateRangeValue | undefined>(undefined);
			return <div style={{ maxWidth: '22rem' }}><DatePicker mode="range" value={value} onValueChange={setValue} aria-label="Periode" placeholder="Kies periode" /></div>;
		};
		return <Demo />;
	},
};

export const RangePreselected: Story = {
	render: () => {
		const Demo = () => {
			const today = new Date();
			const start = new Date(today);
			start.setDate(start.getDate() - 6);
			const [value, setValue] = useState<DateRangeValue | undefined>({ from: start, to: today });
			return <div style={{ maxWidth: '22rem' }}><DatePicker mode="range" value={value} onValueChange={setValue} aria-label="Periode" /></div>;
		};
		return <Demo />;
	},
};
