import type { ComponentPropsWithoutRef } from 'react';

import { classNames } from '@/lib/shared/classNames';

import type { ColumnProps as ColumnSchemaProps, ResponsiveSpan } from './Column.schema';

import './Column.scss';

type ColumnProps = ColumnSchemaProps;

// `is-6` for a number; `is-6 is-12-l` for `{ default: 6, l: 12 }`, each breakpoint value holding from that width up.
const spanClasses = (prefix: string, value: ResponsiveSpan | undefined) => {
	if (value === undefined) return '';
	const perBreakpoint = typeof value === 'number' ? { default: value } : value;

	return Object.entries(perBreakpoint)
		.filter(([, span]) => span !== undefined)
		.map(([name, span]) => (name === 'default' ? `${prefix}-${span}` : `${prefix}-${span}-${name}`))
		.join(' ');
};

const Column = ({
	span,
	offset,
	className,
	children,
	...rest
}: ColumnProps) => {
	return (
		<div
			className={classNames(
				'column',
				spanClasses('is', span),
				spanClasses('is-offset', offset),
				className,
			)}
			{...rest}
		>
			{children}
		</div>
	);
};

export default Column;
