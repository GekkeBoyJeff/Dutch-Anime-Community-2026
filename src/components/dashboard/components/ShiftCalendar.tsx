'use client';

import { format, getDay, parse, startOfWeek } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { Calendar, dateFnsLocalizer, Views, type Components, type EventProps, type SlotInfo, type ToolbarProps } from 'react-big-calendar';
import withDragAndDropImport, { type EventInteractionArgs } from 'react-big-calendar/lib/addons/dragAndDrop';

// The library ships the structural grid layout (flex time-columns, absolute-positioned events) as
// plain CSS with flat `.rbc-*` classes; we import that skeleton once and paint the entire visual
// layer on top in ShiftCalendar.scss, scoped to `.shift-calendar`. No library colour survives the skin.
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

import Button from '@/components/basics/Button';
import Skeleton from '@/components/basics/Skeleton';
import SegmentedControl from '@/components/dashboard/components/SegmentedControl';
import { classNames } from '@/lib/classNames';

/** One shift rendered as a calendar block. Carries its own label so no lookup table is needed. */
export interface ShiftBlock {
	id: string;
	/** Wall-clock start of the shift. */
	start: Date;
	/** Wall-clock end of the shift. */
	end: Date;
	/** Primary label — the assigned person (or a placeholder like "Onbezet"). */
	title?: string;
	/** Secondary label — the post/station. */
	station?: string | null;
	/** Marks the viewer's own shift (`.is-mine` accent) — used in read-only member view. */
	isMine?: boolean;
	/** Locked shifts render `.is-locked` and are never draggable/resizable. */
	isLocked?: boolean;
}

/** A time window reported by a create/move/resize gesture. */
export interface ShiftRange {
	start: Date;
	end: Date;
}

export interface ShiftCalendarProps {
	/** The shifts to render. */
	shifts: ShiftBlock[];
	/** Master switch: `false` disables every drag gesture and turns the grid read-only. */
	editable: boolean;
	/** Which grid to open on; on a narrow viewport the default falls back to `'day'`. */
	defaultView?: 'day' | 'week';
	/** Fires when the viewer switches grid. */
	onViewChange?: (view: 'day' | 'week') => void;
	/** Date to open on (uncontrolled seed; toolbar nav takes over afterwards). */
	defaultDate?: Date;
	/** First hour shown on the time axis (0–23). Default 7. */
	minHour?: number;
	/** Last hour shown on the time axis (1–24). Default 23. */
	maxHour?: number;
	/** Drag on empty grid → new shift over the swept range. Only fired when `editable`. */
	onCreate?: (range: ShiftRange) => void;
	/** Drag a block → move it. Only fired when `editable` and the block is unlocked. */
	onMove?: (id: string, range: ShiftRange) => void;
	/** Drag a block edge → change its duration. Only fired when `editable` and unlocked. */
	onResize?: (id: string, range: ShiftRange) => void;
	/** Click a block → open its detail. */
	onSelect?: (id: string) => void;
	/** Override the block's inner markup (name/station/time by default). */
	renderBlock?: (shift: ShiftBlock) => ReactNode;
	/** Reserves the grid height and shows a skeleton (zero CLS). */
	loading?: boolean;
	/** Height reserved for the grid; fixed so async data never shifts the page. */
	height?: string;
	className?: string;
}

const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales: { nl } });

// The addon ships as CommonJS: under Vite/Storybook the default import lands on a namespace object,
// under webpack/Next it is the function itself — unwrap whichever arrived.
const withDragAndDrop = ((withDragAndDropImport as unknown as { default?: typeof withDragAndDropImport }).default ??
	withDragAndDropImport) as typeof withDragAndDropImport;

// Wrap once, at module scope, so the HOC identity is stable across renders (remounting it would drop
// any in-flight drag). This is the single place react-big-calendar is adopted in the codebase.
const DragCalendar = withDragAndDrop<ShiftBlock>(Calendar);

const MESSAGES = { week: 'Week', day: 'Dag', today: 'Vandaag', previous: 'Vorige', next: 'Volgende', noEventsInRange: 'Geen shifts in deze periode.' };

const FORMATS = {
	timeGutterFormat: 'HH:mm',
	dayFormat: 'EEEEEE d/M',
	weekdayFormat: 'EEEE',
	eventTimeRangeFormat: () => '',
} as const;

const atHour = (base: Date, hour: number) => {
	const d = new Date(base);
	d.setHours(hour, 0, 0, 0);
	return d;
};

const toRange = (args: EventInteractionArgs<ShiftBlock>): ShiftRange => ({ start: new Date(args.start), end: new Date(args.end) });

// A shift block: person on top, station + time beneath. Kept compact so short blocks stay legible.
const ShiftEvent = ({ event }: EventProps<ShiftBlock>) => {
	const time = `${format(event.start, 'HH:mm')}–${format(event.end, 'HH:mm')}`;
	return (
		<span className="shift-event">
			<span className="shift-event-title">{event.title || 'Onbezet'}</span>
			{event.station && <span className="shift-event-station">{event.station}</span>}
			<span className="shift-event-time">{time}</span>
		</span>
	);
};

// Our own toolbar in the H2a language: prev/today/next on the left, the date label centred, and the
// H2a SegmentedControl switching day/week — replacing react-big-calendar's default button row.
const ShiftToolbar = ({ label, view, onNavigate, onView }: ToolbarProps<ShiftBlock>) => (
	<div className="shift-calendar-toolbar">
		<div className="shift-calendar-nav">
			<Button variant="ghost" icon="chevron-left" aria-label="Vorige" onClick={() => onNavigate('PREV')} />
			<Button variant="secondary" onClick={() => onNavigate('TODAY')}>
				Vandaag
			</Button>
			<Button variant="ghost" icon="chevron-right" aria-label="Volgende" onClick={() => onNavigate('NEXT')} />
		</div>
		<span className="shift-calendar-label">{label}</span>
		<SegmentedControl
			size="small"
			aria-label="Weergave"
			options={[
				{ value: Views.WEEK, label: 'Week' },
				{ value: Views.DAY, label: 'Dag' },
			]}
			value={view}
			onValueChange={(v) => onView(v as typeof Views.WEEK)}
		/>
	</div>
);

/**
 * ShiftCalendar — the single dashboard wrap around react-big-calendar (+ withDragAndDrop): a
 * Google-Calendar-style day/week grid where staff **drag empty grid to create**, **drag a block to
 * move**, and **drag a block edge to resize** shifts. Fully skinned onto the H2a admin tokens; the
 * route stays the data owner and receives gestures through `onCreate` / `onMove` / `onResize`.
 *
 * `editable={false}` yields a read-only grid (no gestures) with the viewer's own shifts marked
 * `.is-mine`; a click still fires `onSelect`. Locked blocks are never draggable.
 */
const ShiftCalendar = ({
	shifts,
	editable,
	defaultView,
	onViewChange,
	defaultDate,
	minHour = 7,
	maxHour = 23,
	onCreate,
	onMove,
	onResize,
	onSelect,
	renderBlock,
	loading = false,
	height = '40rem',
	className,
}: ShiftCalendarProps) => {
	// Narrow viewports open on the day grid unless the caller pinned a view. Read once at mount — the
	// dashboard mounts this client-side after data loads, so there is no server render to mismatch.
	const [view, setView] = useState<'day' | 'week'>(() => {
		if (defaultView) return defaultView;
		if (typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches) return Views.DAY;
		return Views.WEEK;
	});
	const [date, setDate] = useState<Date>(defaultDate ?? new Date());

	const changeView = useCallback(
		(next: 'day' | 'week') => {
			setView(next);
			onViewChange?.(next);
		},
		[onViewChange],
	);

	const min = useMemo(() => atHour(date, minHour), [date, minHour]);
	const max = useMemo(() => atHour(date, maxHour), [date, maxHour]);

	const components = useMemo<Components<ShiftBlock>>(
		() => ({
			toolbar: ShiftToolbar,
			event: renderBlock ? ({ event }: EventProps<ShiftBlock>) => <>{renderBlock(event)}</> : ShiftEvent,
		}),
		[renderBlock],
	);

	const eventPropGetter = useCallback(
		(event: ShiftBlock) => ({ className: classNames(event.isMine && 'is-mine', event.isLocked && 'is-locked') }),
		[],
	);

	const canDrag = useCallback((event: ShiftBlock) => editable && !event.isLocked, [editable]);

	if (loading) {
		return (
			<div className={classNames('shift-calendar', 'is-loading', className)} style={{ '--shift-calendar-height': height } as React.CSSProperties} aria-busy="true">
				<Skeleton width="100%" height="100%" />
			</div>
		);
	}

	return (
		<div className={classNames('shift-calendar', !editable && 'is-readonly', className)} style={{ '--shift-calendar-height': height } as React.CSSProperties}>
			<DragCalendar
				localizer={localizer}
				culture="nl"
				events={shifts}
				startAccessor="start"
				endAccessor="end"
				titleAccessor={(event) => event.title ?? ''}
				views={[Views.WEEK, Views.DAY]}
				view={view}
				onView={(next) => changeView(next as 'day' | 'week')}
				date={date}
				onNavigate={setDate}
				min={min}
				max={max}
				scrollToTime={min}
				step={30}
				timeslots={2}
				components={components}
				formats={FORMATS}
				messages={MESSAGES}
				eventPropGetter={eventPropGetter}
				selectable={editable ? true : false}
				resizable={editable}
				draggableAccessor={canDrag}
				resizableAccessor={canDrag}
				onSelectSlot={(slot: SlotInfo) => {
					if (editable && slot.action !== 'click') onCreate?.({ start: slot.start, end: slot.end });
				}}
				onSelectEvent={(event) => onSelect?.(event.id)}
				onEventDrop={(args) => onMove?.(args.event.id, toRange(args))}
				onEventResize={(args) => onResize?.(args.event.id, toRange(args))}
			/>
		</div>
	);
};

export default ShiftCalendar;
