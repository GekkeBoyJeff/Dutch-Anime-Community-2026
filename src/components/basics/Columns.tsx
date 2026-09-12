import type { ComponentPropsWithoutRef } from 'react';

import { classNames } from '@/lib/shared/classNames';
import type { ColumnsProps as ColumnsSchemaProps } from '@/lib/site/content/schema/basics/columns';

import '@/styles/components/basics/Columns.scss';

type ColumnsProps = ColumnsSchemaProps;

const Columns = ({
	align,
	gap,
	className,
	children,
	...rest
}: ColumnsProps) => {
	return (
		<div className={classNames('columns', align && `is-${align}`, gap && `has-gap-${gap}`, className)} {...rest}>
			{children}
		</div>
	);
};

export default Columns;
