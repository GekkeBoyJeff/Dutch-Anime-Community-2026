'use client';

import { Toggle as BaseToggle } from '@base-ui/react/toggle';
import { ToggleGroup as BaseToggleGroup } from '@base-ui/react/toggle-group';
import { useCallback } from 'react';

import Icon from '@/components/basics/Icon';
import useHaptics from '@/hooks/useHaptics';
import { classNames } from '@/lib/shared/classNames';
import type { ToggleGroupProps as ToggleGroupSchemaProps } from '@/lib/site/content/schema/components/toggleGroup';

export type ToggleGroupProps = ToggleGroupSchemaProps;

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
	ariaLabel,
	className,
}: ToggleGroupProps) => {
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
			className={classNames('toggle-group', segmented && 'is-segmented', className)}
			value={value}
			defaultValue={defaultValue}
			onValueChange={handleValueChange}
			multiple={multiple}
			disabled={disabled}
			orientation={orientation}
			loopFocus={loop}
			aria-label={ariaLabel}
		>
			{items.map((item) => (
				<BaseToggle
					key={item.value}
					className="toggle-group-item"
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
