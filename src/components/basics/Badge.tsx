import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react';

import Icon from '@/components/basics/Icon';
import { classNames } from '@/lib/classNames';
import type { BadgeProps as BadgeSchemaProps } from '@/lib/content/schema/basics/badge';

type BadgeProps = BadgeSchemaProps &
	ComponentPropsWithoutRef<'span'> & {
		children?: ReactNode;
	};

// Static status/label chip — the non-interactive sibling of Pill. A plain <span>; wrap it in
// Interactive if it ever needs to be clickable. Colour comes entirely from the variant tokens.
const Badge = ({
	variant = 'neutral',
	icon,
	dot = false,
	className,
	children,
	ref,
	...rest
}: BadgeProps & { ref?: Ref<HTMLSpanElement> }) => {
	return (
		<span ref={ref} className={classNames('badge', `is-${variant}`, className)} {...rest}>
			{dot && <span className="dot" aria-hidden="true" />}
			{icon && <Icon name={icon} className='badge-icon' />}
			{children}
		</span>
	);
};

export default Badge;
