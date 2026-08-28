'use client';

import { useEffect, useRef, useState } from 'react';

import type { CountUpProps as CountUpSchemaProps } from '@/lib/site/content/schema/basics/countUp';

type CountUpProps = CountUpSchemaProps;

const formatValue = (value: number, decimals: number, prefix: string, suffix: string) => {
	return `${prefix}${value.toLocaleString('nl-NL', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
};

// The initial state is the final value on purpose: it is what the server renders, so crawlers and
// no-JS visitors read real data. Only the client resets to 0 to animate.
const CountUp = ({
	value,
	prefix = '',
	suffix = '',
	decimals = 0,
	duration = 1800,
}: CountUpProps) => {
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
