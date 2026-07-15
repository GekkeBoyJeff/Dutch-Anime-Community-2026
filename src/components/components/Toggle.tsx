'use client';

import { Toggle as BaseToggle } from '@base-ui/react/toggle';
import type { ReactNode, Ref } from 'react';

import Icon from '@/components/basics/Icon';
import useHaptics from '@/hooks/useHaptics';
import { classNames } from '@/lib/classNames';
import type { ToggleProps as ToggleSchemaProps } from '@/lib/content/schema/components/toggle';

export type ToggleProps = ToggleSchemaProps & {
	/** Fires with the new pressed boolean on toggle */
	onPressedChange?: (pressed: boolean) => void;
	/** Button label; omit for an icon-only toggle (then set aria-label) */
	children?: ReactNode;
};

// A single two-state toggle button (e.g. bold on/off, mute on/off). Wraps Base UI's standalone
// Toggle, which renders a real <button> exposing aria-pressed plus the controlled/uncontrolled
// pressed state — distinct from Switch's role="switch". For a set of related toggles (segmented
// control, view switcher, filter chips) reach for ToggleGroup instead. A small client island; keep
// it a leaf so server pages can drop it in.
const Toggle = ({
	pressed,
	defaultPressed,
	onPressedChange,
	icon,
	disabled,
	className,
	children,
	ref,
	...rest
}: ToggleProps & { ref?: Ref<HTMLButtonElement> }) => {
	const { haptic } = useHaptics();

	return (
		<BaseToggle
			ref={ref}
			className={classNames('toggle', className)}
			pressed={pressed}
			defaultPressed={defaultPressed}
			onPressedChange={(next) => {
				haptic();
				onPressedChange?.(next);
			}}
			disabled={disabled}
			{...rest}
		>
			{icon && <Icon name={icon} className='toggle-icon' />}
			{children}
		</BaseToggle>
	);
};

export default Toggle;
