import Content from '@/components/basics/Content';
import { classNames } from '@/lib/shared/classNames';
import type { AlertProps as AlertSchemaProps } from '@/lib/site/content/schema/basics/alert';

type AlertProps = AlertSchemaProps;

const Alert = ({
	variant = 'info',
	title,
	className,
	value,
}: AlertProps) => {
	const role = variant === 'warning' || variant === 'error' ? 'alert' : 'status';

	return (
		<div role={role} className={classNames('alert', `is-${variant}`, className)}>
			<div className="alert-body">
				{title && <Content element="p" className="alert-title" value={title} />}
				{value}
			</div>
		</div>
	);
};

export default Alert;
