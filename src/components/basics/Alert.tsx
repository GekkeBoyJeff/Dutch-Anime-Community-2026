import Content from '@/components/basics/Content';
import Icon from '@/components/basics/Icon';
import { classNames } from '@/lib/shared/classNames';
import type { AlertProps as AlertSchemaProps } from '@/lib/site/content/schema/basics/alert';

type AlertProps = AlertSchemaProps;

const Alert = ({
	variant = 'info',
	title,
	icon,
	className,
	value,
}: AlertProps) => {
	const role = variant === 'warning' || variant === 'error' ? 'alert' : 'status';

	return (
		<div role={role} className={classNames('alert', `is-${variant}`, className)}>
			{icon && <Icon name={icon} className="alert-icon" />}
			<div className="alert-body">
				{title && <Content element="p" className="alert-title" value={title} />}
				{value}
			</div>
		</div>
	);
};

export default Alert;
