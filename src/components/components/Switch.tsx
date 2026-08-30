'use client';

import { Switch as BaseSwitch } from '@base-ui/react/switch';

import useHaptics from '@/hooks/useHaptics';
import { classNames } from '@/lib/shared/classNames';
import type { SwitchProps as SwitchSchemaProps } from '@/lib/site/content/schema/components/switch';

export type SwitchProps = SwitchSchemaProps;

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
	ariaLabel,
	className,
	...rest
}: SwitchProps) => {
	const { haptic } = useHaptics();

	return (
		<BaseSwitch.Root
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
			aria-label={ariaLabel}
		>
			<BaseSwitch.Thumb className="switch-thumb" />
		</BaseSwitch.Root>
	);
};

export default Switch;
