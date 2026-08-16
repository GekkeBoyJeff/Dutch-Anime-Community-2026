import type { ReactNode, Ref } from 'react';

import { classNames } from '@/lib/classNames';
import type { ColumnProps } from '@/lib/content/schema/basics/column';

type ColumnComponentProps = ColumnProps & {
	children?: ReactNode;
};

// A single cell of the 12-column grid. Each prop maps to a generated `is-{n}` / `is-{n}-{bp}` (span)
// or `is-offset-{n}` / `is-offset-{n}-{bp}` (offset) class; omit `span` for an equal-width auto cell.
const Column = ({
	span,
	spanM,
	spanL,
	spanXl,
	offset,
	offsetM,
	offsetL,
	offsetXl,
	className,
	children,
	ref,
}: ColumnComponentProps & { ref?: Ref<HTMLDivElement> }) => {
	return (
		<div
			ref={ref}
			className={classNames(
				'column',
				span && `is-${span}`,
				spanM && `is-${spanM}-m`,
				spanL && `is-${spanL}-l`,
				spanXl && `is-${spanXl}-xl`,
				offset && `is-offset-${offset}`,
				offsetM && `is-offset-${offsetM}-m`,
				offsetL && `is-offset-${offsetL}-l`,
				offsetXl && `is-offset-${offsetXl}-xl`,
				className,
			)}
		>
			{children}
		</div>
	);
};

export default Column;
