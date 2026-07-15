'use client';

import { Switch as BaseSwitch } from '@base-ui/react/switch';
import type { Ref } from 'react';

import useHaptics from '@/hooks/useHaptics';
import { classNames } from '@/lib/classNames';
import type { SwitchProps as SwitchSchemaProps } from '@/lib/content/schema/components/switch';

export type SwitchProps = SwitchSchemaProps & {
	/** Fires on toggle with the new boolean (Base UI's two-arg event is re-narrowed for us) */
	onCheckedChange?: (checked: boolean) => void;
};

// A binary on/off control for settings and opt-ins. Wraps Base UI's Switch, so it carries
// role="switch" + aria-checked (distinct from Toggle's button + aria-pressed) and ships a hidden
// <input> for native forms. A small client island: it only re-narrows the change handler and adds
// haptics. The accessible name is required — pass aria-label, aria-labelledby, or an external label.
const Switch = ({
	checked,
	defaultChecked,
	onCheckedChange,
	readOnly,
	disabled,
	required,
	name,
	value,
	id,
	className,
	ref,
	...rest
}: SwitchProps & { ref?: Ref<HTMLButtonElement> }) => {
	const { haptic } = useHaptics();

	return (
		<BaseSwitch.Root
			ref={ref}
			className={classNames('switch', className)}
			checked={checked}
			defaultChecked={defaultChecked}
			onCheckedChange={(next) => {
				haptic();
				onCheckedChange?.(next);
			}}
			readOnly={readOnly}
			disabled={disabled}
			required={required}
			name={name}
			value={value}
			id={id}
			{...rest}
		>
			<BaseSwitch.Thumb className="thumb" />
		</BaseSwitch.Root>
	);
};

export default Switch;
