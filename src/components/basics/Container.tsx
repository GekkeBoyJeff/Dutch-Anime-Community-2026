import type { ElementType, ReactNode, Ref } from 'react';

import { classNames } from '@/lib/classNames';
import type { ContainerProps as ContainerSchemaProps } from '@/lib/content/schema/basics/container';

type ContainerProps = ContainerSchemaProps & {
	element?: ElementType;
	children?: ReactNode;
};

// Centres content at a readable max-width with a responsive horizontal gutter. `full` removes the
// max-width for full-bleed sections; `gutter` overrides the inherited section gutter; `element` makes
// it polymorphic (defaults to a plain <div>, pass e.g. 'section' or 'main' to change the tag).
const Container = ({
	full = false,
	gutter,
	element: Tag = 'div',
	className,
	children,
	ref,
}: ContainerProps & { ref?: Ref<HTMLElement> }) => {
	return (
		<Tag ref={ref} className={classNames('container', full && 'is-full', gutter && `gutter-${gutter}`, className)}>
			{children}
		</Tag>
	);
};

export default Container;
