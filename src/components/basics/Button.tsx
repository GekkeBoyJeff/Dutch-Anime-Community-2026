import type { HTMLAttributes } from 'react';

import Icon from '@/components/basics/Icon';
import Interactive from '@/components/basics/Interactive';
import { classNames } from '@/lib/shared/classNames';
import type { ButtonProps as ButtonSchemaProps } from '@/lib/site/content/schema/basics/button';

// Base UI clones this through `render=` when a Button is a Menu/Popover/Modal/Drawer/Tooltip trigger and
// merges its own props in — id, type, aria-haspopup/expanded/controls and the pointer/keyboard handlers —
// so the HTML attribute set stays open here; narrowing it drops those props without a type error.
type ButtonProps = ButtonSchemaProps & HTMLAttributes<HTMLElement> & { children?: never };

const Button = ({
	variant = 'primary',
	icon,
	className,
	value,
	...rest
}: ButtonProps) => {
	return (
		<Interactive
			className={classNames('button', `is-${variant}`, icon && 'has-icon', className)}
			{...rest}
		>
			{value}
			{icon && <Icon name={icon} />}
		</Interactive>
	);
};

export default Button;
