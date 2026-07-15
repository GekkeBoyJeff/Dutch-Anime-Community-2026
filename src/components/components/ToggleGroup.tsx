'use client';

import { Toggle as BaseToggle } from '@base-ui/react/toggle';
import { ToggleGroup as BaseToggleGroup } from '@base-ui/react/toggle-group';
import { useCallback, type ReactNode, type Ref } from 'react';

import Icon from '@/components/basics/Icon';
import useHaptics from '@/hooks/useHaptics';
import { classNames } from '@/lib/classNames';
import type { ToggleGroupItem as ToggleGroupItemSchema, ToggleGroupProps as ToggleGroupSchemaProps } from '@/lib/content/schema/components/toggleGroup';

// `label` is ReactNode here (icon-only items render children directly) — the schema's string
// version is for serializable content authoring only.
export type ToggleGroupItem = Omit<ToggleGroupItemSchema, 'label'> & {
	label?: ReactNode;
};

export type ToggleGroupProps = Omit<ToggleGroupSchemaProps, 'items'> & {
	items?: ToggleGroupItem[];
	/** Fires on press change with the new pressed array */
	onValueChange?: (value: string[]) => void;
	/** Custom Toggle items instead of the `items` prop; takes precedence */
	children?: ReactNode;
};

// A set of pressed-button toggles: a segmented control, view switcher or filter-chip row. Wraps Base
// UI's ToggleGroup, which owns roving tabindex, Arrow/Home/End focus (loops by default), RTL and the
// controlled/uncontrolled array state. Each item is a real <button> exposing aria-pressed — a set of
// toggle buttons, not a radiogroup (reach for RadioGroup when one option must always carry radio
// semantics). `required` emulates react-aria's disallowEmptySelection for a single-select segmented
// control. A small client island; keep it a leaf so server pages can drop it in.
const ToggleGroup = ({
	items = [],
	value,
	defaultValue,
	onValueChange,
	multiple = false,
	required = false,
	loop = true,
	disabled,
	orientation = 'horizontal',
	segmented = false,
	className,
	children,
	ref,
	...rest
}: ToggleGroupProps & { ref?: Ref<HTMLDivElement> }) => {
	const { haptic } = useHaptics();

	// In single mode with `required`, ignore an empty next value so the active item can't be cleared
	// by clicking it again — keeps a segmented control always filled (react-aria's disallowEmptySelection).
	const handleValueChange = useCallback(
		(next: string[]) => {
			haptic();

			if (required && !multiple && next.length === 0) {
				return;
			}

			onValueChange?.(next);
		},
		[haptic, required, multiple, onValueChange],
	);

	return (
		<BaseToggleGroup
			ref={ref}
			className={classNames('toggle-group', segmented && 'is-segmented', className)}
			value={value}
			defaultValue={defaultValue}
			onValueChange={handleValueChange}
			multiple={multiple}
			disabled={disabled}
			orientation={orientation}
			loopFocus={loop}
			{...rest}
		>
			{children
				? children
				: items.map((item) => (
						<BaseToggle
							key={item.value}
							className="item"
							value={item.value}
							disabled={item.disabled}
							aria-label={item.ariaLabel}
						>
							{item.icon && <Icon name={item.icon} className='toggle-group-icon' />}
							{item.label}
						</BaseToggle>
					))}
		</BaseToggleGroup>
	);
};

export default ToggleGroup;
