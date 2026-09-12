import Icon from '@/components/basics/Icon/Icon';
import { classNames } from '@/lib/shared/classNames';

import type { BadgeProps as BadgeSchemaProps } from './Badge.schema';

import './Badge.scss';

type BadgeProps = BadgeSchemaProps;

const Badge = ({
	variant = 'neutral',
	icon,
	dot = false,
	className,
	value,
}: BadgeProps) => {
	return (
		<span className={classNames('badge', `is-${variant}`, className)}>
			{dot && <span className="badge-dot" aria-hidden="true" />}
			{icon && <Icon name={icon} className="badge-icon" />}
			{value}
		</span>
	);
};

export default Badge;
