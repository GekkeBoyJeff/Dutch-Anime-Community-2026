import type { ComponentPropsWithoutRef } from 'react';

import { classNames } from '@/lib/shared/classNames';

import type { ColumnsProps as ColumnsSchemaProps } from './Columns.schema';

import './Columns.scss';

type ColumnsProps = ColumnsSchemaProps;

const Columns = ({
	gap,
	className,
	children,
	...rest
}: ColumnsProps) => {
	return (
		<div
			className={classNames(
				'columns',
				gap && `has-gap-${gap}`,
				className,
			)}
			{...rest}
		>
			{children}
		</div>
	);
};

export default Columns;
