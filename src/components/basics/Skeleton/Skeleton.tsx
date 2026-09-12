import type { CSSProperties } from 'react';

import { classNames } from '@/lib/shared/classNames';

import type { SkeletonProps as SkeletonSchemaProps } from './Skeleton.schema';

import './Skeleton.scss';

type SkeletonProps = SkeletonSchemaProps;

const Skeleton = ({
	width,
	height,
	radius = 'm',
	circle = false,
	className,
}: SkeletonProps) => {
	const style: CSSProperties = { inlineSize: width, blockSize: height };

	return (
		<span
			aria-hidden="true"
			className={classNames('skeleton', `is-rounded-${radius}`, circle && 'is-circle', className)}
			style={style}
		/>
	);
};

export default Skeleton;
