import type { CSSProperties, Ref } from 'react';

import { classNames } from '@/lib/classNames';
import type { SkeletonProps } from '@/lib/content/schema/basics/skeleton';

type SkeletonComponentProps = SkeletonProps;

// Token-driven loading placeholder with a CSS-only shimmer (gated by prefers-reduced-motion).
// aria-hidden, because the surrounding region carries the loading semantics.
const Skeleton = ({
	width,
	height,
	radius = 'm',
	circle = false,
	className,
	ref,
}: SkeletonComponentProps & { ref?: Ref<HTMLSpanElement> }) => {
	const style: CSSProperties = {};
	if (width) style.inlineSize = width;
	if (height) style.blockSize = height;

	return (
		<span
			ref={ref}
			aria-hidden="true"
			className={classNames('skeleton', `radius-${radius}`, circle && 'is-circle', className)}
			style={style}
		/>
	);
};

export default Skeleton;
