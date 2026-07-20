'use client';

import { useState } from 'react';
import { DayPicker, type DateRange, type Matcher } from 'react-day-picker';

import Icon from '@/components/basics/Icon';
import Popover from '@/components/components/Popover';
import { classNames } from '@/lib/classNames';

const nlLong = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
const nlShort = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
const nlMonth = new Intl.DateTimeFormat('nl-NL', { month: 'long', year: 'numeric' });
const nlWeekday = new Intl.DateTimeFormat('nl-NL', { weekday: 'short' });

// Dutch month/weekday labels via Intl, so no date-fns locale dependency is pulled in.
const FORMATTERS = {
	formatCaption: (date: Date) => nlMonth.format(date),
	formatWeekdayName: (date: Date) => nlWeekday.format(date).replace('.', ''),
};

export interface DateRangeValue {
	from?: Date;
	to?: Date;
}

export interface DateRangePreset {
	label: string;
	/** Returns the range to apply, computed at click time */
	range: () => DateRangeValue;
}

type CommonProps = {
	/** Placeholder shown on the trigger when nothing is chosen */
	placeholder?: string;
	/** Earliest selectable day */
	min?: Date;
	/** Latest selectable day */
	max?: Date;
	/** Accessible name for the trigger button */
	'aria-label'?: string;
	className?: string;
};

export type DatePickerProps =
	| (CommonProps & {
			mode?: 'single';
			value?: Date;
			onValueChange?: (value: Date | undefined) => void;
	  })
	| (CommonProps & {
			mode: 'range';
			value?: DateRangeValue;
			onValueChange?: (value: DateRangeValue | undefined) => void;
			/** Quick-range shortcuts shown beside the calendar */
			presets?: DateRangePreset[];
	  });

const startOfToday = () => {
	const d = new Date();
	d.setHours(0, 0, 0, 0);
	return d;
};

// Sensible default range shortcuts (Untitled UI date-range pattern): today, last 7 days, this month,
// this year. A page can pass its own via `presets`.
export const DEFAULT_RANGE_PRESETS: DateRangePreset[] = [
	{ label: 'Vandaag', range: () => ({ from: startOfToday(), to: startOfToday() }) },
	{
		label: '7 dagen',
		range: () => {
			const to = startOfToday();
			const from = new Date(to);
			from.setDate(from.getDate() - 6);
			return { from, to };
		},
	},
	{
		label: 'Deze maand',
		range: () => {
			const now = startOfToday();
			return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
		},
	},
	{
		label: 'Dit jaar',
		range: () => {
			const now = startOfToday();
			return { from: new Date(now.getFullYear(), 0, 1), to: now };
		},
	},
];

const rangeLabel = (value: DateRangeValue | undefined, placeholder: string) => {
	if (!value?.from) return placeholder;
	if (!value.to) return nlShort.format(value.from);
	return `${nlShort.format(value.from)} – ${nlShort.format(value.to)}`;
};

// A date / date-range picker (research-visual §3): react-day-picker mounted in the shared Base UI
// Popover, skinned entirely on the admin tokens — replacing the native mm/dd/yyyy inputs. Range mode
// adds a dual-highlight and quick-range presets. Controlled; the parent owns the value.
const DatePicker = (props: DatePickerProps) => {
	const { placeholder = 'Kies datum', min, max, className } = props;
	const mode = props.mode ?? 'single';
	const [open, setOpen] = useState(false);
	const ariaLabel = props['aria-label'];
	const disabled: Matcher[] = [];
	if (min) disabled.push({ before: min });
	if (max) disabled.push({ after: max });

	const label =
		mode === 'range'
			? rangeLabel((props as Extract<DatePickerProps, { mode: 'range' }>).value, placeholder)
			: (props as Extract<DatePickerProps, { mode?: 'single' }>).value
				? nlLong.format((props as Extract<DatePickerProps, { mode?: 'single' }>).value as Date)
				: placeholder;

	const hasValue = mode === 'range' ? !!(props as Extract<DatePickerProps, { mode: 'range' }>).value?.from : !!(props as Extract<DatePickerProps, { mode?: 'single' }>).value;

	const trigger = (
		<button type="button" className={classNames('date-trigger', hasValue && 'has-value', className)} aria-label={ariaLabel}>
			<Icon name="calendar" className="date-trigger-icon" />
			<span className="date-trigger-label">{label}</span>
			<Icon name="chevron-down" className="date-trigger-chevron" />
		</button>
	);

	return (
		<Popover trigger={trigger} open={open} onOpenChange={setOpen} label={ariaLabel ?? 'Datumkiezer'} className="date-popover" align="start">
			<div className="date-panel">
				{mode === 'range' && (
					<div className="date-presets" role="group" aria-label="Snelkeuze">
						{((props as Extract<DatePickerProps, { mode: 'range' }>).presets ?? DEFAULT_RANGE_PRESETS).map((preset) => (
							<button
								key={preset.label}
								type="button"
								className="date-preset"
								onClick={() => (props as Extract<DatePickerProps, { mode: 'range' }>).onValueChange?.(preset.range())}
							>
								{preset.label}
							</button>
						))}
					</div>
				)}

				{mode === 'range' ? (
					<DayPicker
						mode="range"
						className="date-calendar"
						formatters={FORMATTERS}
						disabled={disabled}
						numberOfMonths={1}
						selected={(props as Extract<DatePickerProps, { mode: 'range' }>).value as DateRange}
						onSelect={(next) => (props as Extract<DatePickerProps, { mode: 'range' }>).onValueChange?.(next ?? undefined)}
					/>
				) : (
					<DayPicker
						mode="single"
						className="date-calendar"
						formatters={FORMATTERS}
						disabled={disabled}
						selected={(props as Extract<DatePickerProps, { mode?: 'single' }>).value}
						onSelect={(next) => {
							(props as Extract<DatePickerProps, { mode?: 'single' }>).onValueChange?.(next);
							setOpen(false);
						}}
					/>
				)}
			</div>
		</Popover>
	);
};

export default DatePicker;
