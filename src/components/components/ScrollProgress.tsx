import type { CSSProperties, Ref } from 'react';

import { classNames } from '@/lib/classNames';
import type { ScrollProgressProps as ScrollProgressSchemaProps } from '@/lib/content/schema/components/scrollProgress';

// A reading-progress bar that scales from 0→1 as the page scrolls, using a pure CSS scroll-driven
// animation (animation-timeline: scroll()). No JS, no IntersectionObserver — so it stays a Server
// Component. Where scroll-driven timelines aren't supported (Safari still lags in 2026) the bar is
// hidden via the @supports guard in the SCSS rather than sitting stuck at the start.
const ScrollProgress = ({
	target,
	position = 'top',
	color = 'primary',
	height = '3px',
	ref,
}: ScrollProgressSchemaProps & { ref?: Ref<HTMLDivElement> }) => {
	// The target selector is passed through as a data attribute purely for styling hooks; the scroll
	// timeline itself reads the nearest scroll container, so most pages need no target at all.
	const style = { '--scroll-progress-height': height } as CSSProperties;

	return (
		<div
			ref={ref}
			className={classNames('scroll-progress', `is-${position}`, `is-${color}`)}
			data-target={target}
			style={style}
			aria-hidden="true"
		>
			<span className="bar" />
		</div>
	);
};

export default ScrollProgress;
