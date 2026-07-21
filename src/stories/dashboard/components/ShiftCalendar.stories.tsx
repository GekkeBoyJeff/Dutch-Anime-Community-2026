import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import ShiftCalendar, { type ShiftBlock } from '@/components/dashboard/components/ShiftCalendar';

// A fixed Saturday so every story renders the same grid regardless of the real date.
const BASE = new Date(2026, 6, 18);
const at = (day: number, hour: number, minute = 0) => {
	const d = new Date(BASE);
	d.setDate(BASE.getDate() + day);
	d.setHours(hour, minute, 0, 0);
	return d;
};

const shift = (id: string, day: number, from: number, to: number, title: string, station: string, extra: Partial<ShiftBlock> = {}): ShiftBlock => ({
	id,
	start: at(day, from),
	end: at(day, to),
	title,
	station,
	...extra,
});

const FILLED: ShiftBlock[] = [
	shift('1', 0, 9, 13, 'Yuki', 'Kassa'),
	shift('2', 0, 13, 17, 'Milan', 'Kassa'),
	shift('3', 0, 10, 14, 'Sanne', 'Garderobe'),
	shift('4', 1, 9, 12, 'Tom', 'Entree'),
	shift('5', 1, 12, 16, '', 'Entree'),
];

const meta: Meta<typeof ShiftCalendar> = {
	title: 'Dashboard/Components/ShiftCalendar',
	component: ShiftCalendar,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'The single dashboard wrap around react-big-calendar (+ withDragAndDrop): a Google-Calendar-style day/week grid for event shifts. Drag empty grid to create, drag a block to move, drag a block edge to resize. Fully skinned onto the H2a admin tokens — the flat `.rbc-*` classes are overridden inside the component root. `editable={false}` is a read-only grid with the viewer\'s own shifts marked.',
			},
		},
	},
	args: {
		defaultDate: BASE,
		editable: true,
	},
};

export default meta;

type Story = StoryObj<typeof ShiftCalendar>;

// Live template: the route owns the data, so the stories keep the shifts in state and let the three
// gestures (create / move / resize) actually mutate them — this is the drag-create/moved/resized proof.
const Interactive = (args: React.ComponentProps<typeof ShiftCalendar>) => {
	const [shifts, setShifts] = useState<ShiftBlock[]>(args.shifts ?? []);
	return (
		<ShiftCalendar
			{...args}
			shifts={shifts}
			onCreate={(range) => setShifts((prev) => [...prev, { id: `new-${prev.length}`, start: range.start, end: range.end, title: 'Nieuw', station: 'Kassa' }])}
			onMove={(id, range) => setShifts((prev) => prev.map((s) => (s.id === id ? { ...s, start: range.start, end: range.end } : s)))}
			onResize={(id, range) => setShifts((prev) => prev.map((s) => (s.id === id ? { ...s, start: range.start, end: range.end } : s)))}
			onSelect={(id) => console.log('select', id)}
		/>
	);
};

export const Week: Story = {
	name: 'Week — gevuld',
	render: (args) => <Interactive {...args} />,
	args: { shifts: FILLED, defaultView: 'week' },
};

export const Dag: Story = {
	name: 'Dag',
	render: (args) => <Interactive {...args} />,
	args: { shifts: FILLED, defaultView: 'day' },
};

export const Leeg: Story = {
	name: 'Leeg',
	render: (args) => <Interactive {...args} />,
	args: { shifts: [], defaultView: 'week' },
};

export const Bewerkbaar: Story = {
	name: 'Bewerkbaar — sleep om te maken/verplaatsen/verlengen',
	render: (args) => <Interactive {...args} />,
	args: { shifts: FILLED.slice(0, 2), defaultView: 'day' },
};

export const Overlappend: Story = {
	name: 'Overlappende shifts',
	render: (args) => <Interactive {...args} />,
	args: {
		defaultView: 'day',
		shifts: [shift('a', 0, 10, 14, 'Yuki', 'Kassa'), shift('b', 0, 11, 15, 'Milan', 'Kassa'), shift('c', 0, 12, 16, 'Sanne', 'Garderobe')],
	},
};

export const MijnShiftsReadonly: Story = {
	name: 'Mijn shifts — read-only (lid)',
	render: (args) => <ShiftCalendar {...args} />,
	args: {
		editable: false,
		defaultView: 'week',
		shifts: [
			shift('1', 0, 9, 13, 'Yuki', 'Kassa'),
			shift('2', 0, 13, 17, 'Jij', 'Entree', { isMine: true }),
			shift('3', 1, 10, 14, 'Sanne', 'Garderobe', { isLocked: true }),
		],
	},
};

export const MobielSmal: Story = {
	name: 'Mobiel — smal',
	render: (args) => <Interactive {...args} />,
	args: { shifts: FILLED, defaultView: 'day' },
	parameters: { viewport: { defaultViewport: 'mobile1' } },
};

export const Laden: Story = {
	name: 'Laden',
	render: (args) => <ShiftCalendar {...args} />,
	args: { shifts: [], loading: true },
};
