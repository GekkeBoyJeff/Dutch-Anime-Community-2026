import type { ReactNode, Ref } from 'react';

import { classNames } from '@/lib/classNames';
import type { ColumnProps } from '@/lib/content/schema/basics/column';

type ColumnComponentProps = ColumnProps & {
	children?: ReactNode;
};

// A single cell of the 12-column grid. Each prop maps to a generated `is-{n}` / `is-{n}-{bp}` (span)
// or `offset-{n}` / `offset-{n}-{bp}` (offset) class; omit `span` for an equal-width auto cell.
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
				offset && `offset-${offset}`,
				offsetM && `offset-${offsetM}-m`,
				offsetL && `offset-${offsetL}-l`,
				offsetXl && `offset-${offsetXl}-xl`,
				className,
			)}
		>
			{children}
		</div>
	);
};

export default Column;
