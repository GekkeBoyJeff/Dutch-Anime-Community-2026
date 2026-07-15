import type { ReactNode, Ref } from 'react';

import { classNames } from '@/lib/classNames';
import type { ColumnsProps } from '@/lib/content/schema/basics/columns';

// The row half of the grid pair: a 12-column CSS grid that Column children span into. Columns that
// overflow 12 wrap to the next row automatically.
const Columns = ({
	align,
	gap,
	className,
	children,
	ref,
}: ColumnsProps & { children?: ReactNode; ref?: Ref<HTMLDivElement> }) => {
	return (
		<div ref={ref} className={classNames('columns', align && `is-${align}`, gap && `gap-${gap}`, className)}>
			{children}
		</div>
	);
};

export default Columns;
