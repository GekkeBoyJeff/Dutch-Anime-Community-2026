import type { CSSProperties } from 'react';

import { classNames } from '@/lib/shared/classNames';
import type { ScrollProgressProps as ScrollProgressSchemaProps } from '@/lib/site/content/schema/components/scrollProgress';

type ScrollProgressProps = ScrollProgressSchemaProps;

// Where scroll-driven timelines aren't supported (Safari still lags in 2026) the bar is hidden via
// the @supports guard in the SCSS rather than sitting stuck at the start.
const ScrollProgress = ({
	target,
	position = 'top',
	color = 'primary',
	height = '3px',
}: ScrollProgressProps) => {
	const style = { '--scroll-progress-height': height } as CSSProperties;

	return (
		<div
			className={classNames('scroll-progress', `is-${position}`, `is-${color}`)}
			data-target={target}
			style={style}
			aria-hidden="true"
		>
			<span className="scroll-progress-bar" />
		</div>
	);
};

export default ScrollProgress;
