import type { ComponentPropsWithoutRef } from 'react';

import { classNames } from '@/lib/shared/classNames';
import type { ColumnProps as ColumnSchemaProps } from '@/lib/site/content/schema/basics/column';

type ColumnProps = ColumnSchemaProps;

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
	...rest
}: ColumnProps) => {
	return (
		<div
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
			{...rest}
		>
			{children}
		</div>
	);
};

export default Column;
