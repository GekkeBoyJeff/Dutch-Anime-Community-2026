import VisuallyHidden from '@/components/basics/VisuallyHidden/VisuallyHidden';
import { classNames } from '@/lib/shared/classNames';

import type { SpinnerProps as SpinnerSchemaProps } from './Spinner.schema';

import './Spinner.scss';

type SpinnerProps = SpinnerSchemaProps;

const Spinner = ({
	size = 'm',
	ariaLabel = 'Loading',
	className,
}: SpinnerProps) => {
	return (
		<span role="status" className={classNames('spinner', `is-${size}`, className)}>
			<span className="spinner-ring" aria-hidden="true" />
			<VisuallyHidden value={ariaLabel} />
		</span>
	);
};

export default Spinner;
