import type { Ref } from 'react';

import Skeleton from '@/components/basics/Skeleton';
import { classNames } from '@/lib/classNames';
import type { SkeletonTextProps } from '@/lib/content/schema/basics/skeletonText';

// A stack of Skeleton lines for paragraph/heading placeholders; the last line is shortened so the
// block reads like real copy.
const SkeletonText = ({
	lines = 3,
	lastWidth = '60%',
	className,
	ref,
}: SkeletonTextProps & { ref?: Ref<HTMLSpanElement> }) => {
	return (
		<span ref={ref} aria-hidden="true" className={classNames('skeleton-text', className)}>
			{Array.from({ length: lines }, (_, index) => (
				<Skeleton key={index} width={index === lines - 1 && lines > 1 ? lastWidth : undefined} />
			))}
		</span>
	);
};

export default SkeletonText;
