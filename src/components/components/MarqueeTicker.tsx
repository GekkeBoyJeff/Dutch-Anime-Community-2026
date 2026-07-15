import type { CSSProperties, Ref } from 'react';

import Content from '@/components/basics/Content';
import Icon from '@/components/basics/Icon';
import { classNames } from '@/lib/classNames';
import type { MarqueeTickerProps as MarqueeTickerSchemaProps } from '@/lib/content/schema/components/marqueeTicker';

type MarqueeTickerProps = MarqueeTickerSchemaProps;

// An infinite horizontal ticker. The track is rendered twice and translated by exactly -50%, so the
// second copy slides in seamlessly as the first leaves — no JS animation loop. Speed and direction
// are CSS vars, so the same keyframes serve every instance. The duplicate copy is aria-hidden and
// the strip carries a single generic label, so a screen reader hears the items once. Motion pauses
// under prefers-reduced-motion.
const MarqueeTicker = ({
	items,
	speed = 30,
	direction = 'left',
	variant = 'primary',
	'aria-label': ariaLabel = 'Scrolling announcements',
	className,
	ref,
}: MarqueeTickerProps & { ref?: Ref<HTMLDivElement> }) => {
	const style = {
		'--marquee-speed': `${speed}s`,
		'--marquee-direction': direction === 'right' ? 'reverse' : 'normal',
	} as CSSProperties;

	// One track of items; rendered twice below for the seamless wrap.
	const track = items.map((item) => (
		<span className="item" key={item.label}>
			{item.icon && <Icon name={item.icon} className='marquee-ticker-icon' />}
			<Content element="span" className="label" value={item.label} />
		</span>
	));

	return (
		<div
			ref={ref}
			className={classNames('marquee-ticker', `is-${variant}`, className)}
			style={style}
			aria-label={ariaLabel}
		>
			<div className="viewport">
				<div className="track">{track}</div>
				<div className="track" aria-hidden="true">
					{track}
				</div>
			</div>
		</div>
	);
};

export default MarqueeTicker;
