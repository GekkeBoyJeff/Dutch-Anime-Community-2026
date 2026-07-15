import type { ReactNode, Ref } from 'react';

import { classNames } from '@/lib/classNames';

interface FieldGroupProps {
	className?: string;
	/** Stacked Field rows */
	children?: ReactNode;
}

// A non-semantic layout wrapper that stacks Fields with a consistent gap and opens a container
// query context, so a child Field with orientation="horizontal" can switch from stacked to
// side-by-side based on the group's own width rather than the viewport. Stays a Server Component.
const FieldGroup = ({ className, children, ref }: FieldGroupProps & { ref?: Ref<HTMLDivElement> }) => {
	return (
		<div ref={ref} className={classNames('field-group', className)}>
			{children}
		</div>
	);
};

export default FieldGroup;
