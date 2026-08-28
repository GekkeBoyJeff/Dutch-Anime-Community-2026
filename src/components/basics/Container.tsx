import type { ComponentPropsWithoutRef } from 'react';

import { classNames } from '@/lib/shared/classNames';
import type { ContainerProps as ContainerSchemaProps } from '@/lib/site/content/schema/basics/container';

type ContainerProps = ContainerSchemaProps;

const Container = ({
	element = 'div',
	full = false,
	gutter,
	className,
	children,
	...rest
}: ContainerProps) => {
	const Tag = element as React.ElementType;

	return (
		<Tag className={classNames('container', full && 'is-full', gutter && `has-gutter-${gutter}`, className)} {...rest}>
			{children}
		</Tag>
	);
};

export default Container;
