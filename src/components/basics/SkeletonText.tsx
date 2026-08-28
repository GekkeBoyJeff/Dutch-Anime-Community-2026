import Skeleton from '@/components/basics/Skeleton';
import { classNames } from '@/lib/shared/classNames';
import type { SkeletonTextProps as SkeletonTextSchemaProps } from '@/lib/site/content/schema/basics/skeletonText';

type SkeletonTextProps = SkeletonTextSchemaProps;

const SkeletonText = ({
	lines = 3,
	lastWidth = '60%',
	className,
}: SkeletonTextProps) => {
	return (
		<span aria-hidden="true" className={classNames('skeleton-text', className)}>
			{Array.from({ length: lines }, (_, index) => (
				<Skeleton key={index} width={index === lines - 1 && lines > 1 ? lastWidth : undefined} />
			))}
		</span>
	);
};

export default SkeletonText;
