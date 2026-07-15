import type { ReactNode, Ref } from 'react';

import Content from '@/components/basics/Content';
import Icon from '@/components/basics/Icon';
import { classNames } from '@/lib/classNames';
import type { AlertProps } from '@/lib/content/schema/basics/alert';

// Static, inline status callout — distinct from the transient Notification (toast) and the
// site-wide AnnouncementBar. Assertive variants (warning/error) announce via role="alert".
const Alert = ({
	variant = 'info',
	title,
	icon,
	className,
	children,
	ref,
}: AlertProps & { children?: ReactNode; ref?: Ref<HTMLDivElement> }) => {
	const role = variant === 'warning' || variant === 'error' ? 'alert' : 'status';

	return (
		<div ref={ref} role={role} className={classNames('alert', `is-${variant}`, className)}>
			{icon && <Icon name={icon} className="alert-icon" />}
			<div className="body">
				{title && <Content element="p" className="alert-title" value={title} />}
				{children}
			</div>
		</div>
	);
};

export default Alert;
