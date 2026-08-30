import { classNames } from '@/lib/shared/classNames';
import type { VisuallyHiddenProps as VisuallyHiddenSchemaProps } from '@/lib/site/content/schema/basics/visuallyHidden';

type VisuallyHiddenProps = VisuallyHiddenSchemaProps;

const VisuallyHidden = ({
	className,
	value,
	id,
}: VisuallyHiddenProps) => {
	return (
		<span className={classNames('sr-only', className)} id={id}>
			{value}
		</span>
	);
};

export default VisuallyHidden;
