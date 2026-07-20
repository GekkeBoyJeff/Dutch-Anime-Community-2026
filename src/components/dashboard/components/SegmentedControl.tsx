'use client';

import type { Ref } from 'react';

import Icon from '@/components/basics/Icon';
import Radio from '@/components/forms/Radio';
import { classNames } from '@/lib/classNames';

export interface SegmentedOption {
	/** The value reported when this segment is chosen */
	value: string;
	/** Visible segment label */
	label: string;
	/** Optional count badge trailing the label (filter tallies) */
	count?: number;
	/** Optional leading icon (a name from the icon set) */
	icon?: string;
	/** Renders the segment but blocks selection */
	disabled?: boolean;
}

export interface SegmentedControlProps {
	/** 2–5 segments; a sliding thumb tracks the active one */
	options: SegmentedOption[];
	/** The selected value (controlled) */
	value: string;
	/** Fires with the next value on click or arrow-key move */
	onValueChange?: (value: string) => void;
	/** Accessible name for the group */
	'aria-label'?: string;
	/** Denser padding/height for toolbar rows */
	size?: 'default' | 'small';
	className?: string;
	ref?: Ref<HTMLDivElement>;
}

// A segmented control (research-visual §3): a grouped pill where one background thumb springs between
// 2–5 options, replacing small selects and filter-pill rows. Composes the shared forms/Radio
// primitive, so roving tabindex, arrow-key navigation and aria-checked are handled for us. The thumb
// is CSS-driven (grid columns keep segments equal-width; the active index translates the thumb), so
// there is no measuring and no layout shift. Controlled: the parent owns `value`.
const SegmentedControl = ({ options, value, onValueChange, size = 'default', className, ref, ...rest }: SegmentedControlProps) => {
	const activeIndex = Math.max(0, options.findIndex((option) => option.value === value));

	return (
		<Radio.Group
			ref={ref}
			aria-label={rest['aria-label']}
			value={value}
			onValueChange={(next) => onValueChange?.(next as string)}
			className={classNames('segmented', size !== 'default' && `is-${size}`, className)}
			style={{ '--seg-count': options.length, '--seg-index': activeIndex } as React.CSSProperties}
		>
			<span className="segmented-thumb" aria-hidden="true" />
			{options.map((option) => (
				<Radio.Option
					key={option.value}
					value={option.value}
					disabled={option.disabled}
					className={classNames('segmented-option', option.value === value && 'is-active')}
				>
					{option.icon && <Icon name={option.icon} className="segmented-option-icon" />}
					<span className="segmented-option-label">{option.label}</span>
					{option.count !== undefined && <span className="segmented-option-count">{option.count}</span>}
				</Radio.Option>
			))}
		</Radio.Group>
	);
};

export default SegmentedControl;
