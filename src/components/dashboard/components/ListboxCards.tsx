'use client';

import type { Ref } from 'react';

import Icon from '@/components/basics/Icon';
import Radio from '@/components/forms/Radio';
import { classNames } from '@/lib/classNames';

export interface ListboxCardOption {
	/** The value reported when this card is chosen */
	value: string;
	/** Card title */
	label: string;
	/** Optional supporting line under the title */
	description?: string;
	/** Optional leading icon (a name from the icon set) */
	icon?: string;
	/** Renders the card but blocks selection */
	disabled?: boolean;
}

export interface ListboxCardsProps {
	/** The choosable cards; exactly one may be selected */
	options: ListboxCardOption[];
	/** The selected value (controlled) */
	value?: string;
	/** Uncontrolled initial value */
	defaultValue?: string;
	/** Fires with the newly selected value */
	onValueChange?: (value: string) => void;
	/** Disable the whole group */
	disabled?: boolean;
	/** Accessible name for the group */
	'aria-label'?: string;
	/** Column count for the card grid (default 1) */
	columns?: 1 | 2;
	className?: string;
	ref?: Ref<HTMLDivElement>;
}

// A card-select (research-visual §3 "listbox-cards"): each option is a clickable card with an icon,
// a title, a description and a check badge on selection — for choices that carry meaning beyond a
// bare label (a role, a plan). Composes the shared forms/Radio primitive, so it is a real
// single-choice radiogroup with roving focus and aria-checked. Controlled or uncontrolled; the group
// needs an accessible name.
const ListboxCards = ({ options, value, defaultValue, onValueChange, disabled, columns = 1, className, ref, ...rest }: ListboxCardsProps) => (
	<Radio.Group
		ref={ref}
		aria-label={rest['aria-label']}
		value={value}
		defaultValue={defaultValue}
		disabled={disabled}
		onValueChange={(next) => onValueChange?.(next as string)}
		className={classNames('listbox-cards', columns === 2 && 'is-cols-2', className)}
	>
		{options.map((option) => (
			<Radio.Option key={option.value} value={option.value} disabled={option.disabled} className="listbox-card">
				{option.icon && (
					<span className="listbox-card-icon" aria-hidden="true">
						<Icon name={option.icon} />
					</span>
				)}
				<span className="listbox-card-text">
					<span className="listbox-card-label">{option.label}</span>
					{option.description && <span className="listbox-card-desc">{option.description}</span>}
				</span>
				<Radio.Indicator className="listbox-card-check" keepMounted>
					<span className="listbox-card-check-mark" aria-hidden="true" />
				</Radio.Indicator>
			</Radio.Option>
		))}
	</Radio.Group>
);

export default ListboxCards;
