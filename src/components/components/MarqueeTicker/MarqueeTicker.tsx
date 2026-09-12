import type { CSSProperties } from 'react';

import Content from '@/components/basics/Content/Content';
import Icon from '@/components/basics/Icon/Icon';
import { classNames } from '@/lib/shared/classNames';

import type { MarqueeTickerProps as MarqueeTickerSchemaProps } from './MarqueeTicker.schema';

import './MarqueeTicker.scss';

type MarqueeTickerProps = MarqueeTickerSchemaProps;

// The duplicate copy is aria-hidden and the strip carries a single generic label, so a screen
// reader hears the items once.
const MarqueeTicker = ({
	items,
	speed = 30,
	direction = 'left',
	variant = 'primary',
	ariaLabel = 'Scrolling announcements',
	className,
}: MarqueeTickerProps) => {
	const style = {
		'--marquee-speed': `${speed}s`,
		'--marquee-direction': direction === 'right' ? 'reverse' : 'normal',
	} as CSSProperties;

	const track = items.map((item) => (
		<span className="marquee-ticker-item" key={item.label}>
			{item.icon && <Icon name={item.icon} className='marquee-ticker-icon' />}
			<Content element="span" className="marquee-ticker-label" value={item.label} />
		</span>
	));

	return (
		<div
			className={classNames('marquee-ticker', `is-${variant}`, className)}
			style={style}
			aria-label={ariaLabel}
		>
			<div className="marquee-ticker-viewport">
				<div className="marquee-ticker-track">{track}</div>
				<div className="marquee-ticker-track" aria-hidden="true">
					{track}
				</div>
			</div>
		</div>
	);
};

export default MarqueeTicker;
