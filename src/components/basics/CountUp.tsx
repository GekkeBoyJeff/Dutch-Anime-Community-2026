'use client';

import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
	/** The value the counter animates towards */
	value: number;
	/** Text rendered before the number */
	prefix?: string;
	/** Text rendered after the number */
	suffix?: string;
	/** Number of decimals shown */
	decimals?: number;
	/** Animation duration in milliseconds */
	duration?: number;
}

const formatValue = (value: number, decimals: number, prefix: string, suffix: string) => {
	return `${prefix}${value.toLocaleString('nl-NL', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
};

// Counts up to `value` once the number scrolls into view. Server-rendered at its FINAL value, so
// crawlers and no-JS visitors read real data; the client resets to 0 on mount and animates with an
// easeOutExpo curve (https://easings.net/#easeOutExpo). Reduced motion keeps the final value untouched.
const CountUp = ({ value, prefix = '', suffix = '', decimals = 0, duration = 1800 }: CountUpProps) => {
	const ref = useRef<HTMLSpanElement | null>(null);
	const [display, setDisplay] = useState(() => formatValue(value, decimals, prefix, suffix));

	useEffect(() => {
		const element = ref.current;
		if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			return;
		}

		setDisplay(formatValue(0, decimals, prefix, suffix));

		let frame = 0;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry?.isIntersecting) {
					return;
				}
				observer.disconnect();

				const start = performance.now();
				const tick = (now: number) => {
					const t = Math.min((now - start) / duration, 1);
					const eased = t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
					setDisplay(formatValue(Math.round(value * eased * 10 ** decimals) / 10 ** decimals, decimals, prefix, suffix));
					if (t < 1) {
						frame = requestAnimationFrame(tick);
					}
				};
				frame = requestAnimationFrame(tick);
			},
			{ threshold: 0.4 },
		);

		observer.observe(element);
		return () => {
			observer.disconnect();
			cancelAnimationFrame(frame);
		};
	}, [value, decimals, prefix, suffix, duration]);

	return (
		<span ref={ref} className="count-up">
			{display}
		</span>
	);
};

export default CountUp;
