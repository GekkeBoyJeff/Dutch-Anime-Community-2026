import { classNames } from '@/lib/shared/classNames';
import type { DividerProps as DividerSchemaProps } from '@/lib/site/content/schema/basics/divider';

type DividerProps = DividerSchemaProps;

const Divider = ({
	orientation = 'horizontal',
	label,
	className,
}: DividerProps) => {
	const hasLabel = Boolean(label) && orientation === 'horizontal';

	return (
		<div
			role="separator"
			aria-orientation={orientation}
			aria-label={hasLabel ? label : undefined}
			className={classNames('divider', `is-${orientation}`, hasLabel && 'has-label', className)}
		>
			{hasLabel && (
				<span className="divider-label" aria-hidden="true">
					{label}
				</span>
			)}
		</div>
	);
};

export default Divider;
