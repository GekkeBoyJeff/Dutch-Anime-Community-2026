'use client';

import { useEffect, useRef } from 'react';
import type { Ref } from 'react';

import { classNames } from '@/lib/classNames';
import type { CustomCursorProps as CustomCursorSchemaProps } from '@/lib/content/schema/components/customCursor';

type CustomCursorProps = CustomCursorSchemaProps;

// A decorative dot plus a larger circle that lerp-trails the pointer. The position is written
// straight to the elements' `translate` style inside a requestAnimationFrame loop — never through
// React state — so the page never re-renders as the cursor moves. It disables itself entirely on
// coarse pointers (touch) and under prefers-reduced-motion, and grows over hover targets
// (a/button, anything marked .hover-target or [data-cursor]). Mount once near the app root.
const CustomCursor = ({
	lerp = 0.15,
	className,
	ref,
}: CustomCursorProps & { ref?: Ref<HTMLDivElement> }) => {
	const dotRef = useRef<HTMLSpanElement>(null);
	const circleRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		// A fine pointer + motion is the only case worth drawing a custom cursor for.
		const finePointer = window.matchMedia('(pointer: fine)').matches;
		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (!finePointer || reducedMotion) {
			return;
		}

		const dot = dotRef.current;
		const circle = circleRef.current;
		if (!dot || !circle) {
			return;
		}

		// Pointer target vs. the eased circle position, kept in refs (not state) so the loop mutates
		// them without re-rendering. The circle trails via a lerp (exponential smoothing) each frame:
		// https://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/
		const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
		const eased = { ...pointer };
		let frame = 0;
		let visible = false;

		const onMove = (event: PointerEvent) => {
			pointer.x = event.clientX;
			pointer.y = event.clientY;

			if (!visible) {
				visible = true;
				dot.style.opacity = '1';
				circle.style.opacity = '1';
			}

			// The dot pins to the pointer exactly; the circle eases toward it in the loop.
			dot.style.translate = `${pointer.x}px ${pointer.y}px`;

			const target = (event.target as HTMLElement | null)?.closest(
				'a, button, [data-cursor], .hover-target',
			);
			circle.classList.toggle('is-hovering', Boolean(target));
		};

		const onLeave = () => {
			visible = false;
			dot.style.opacity = '0';
			circle.style.opacity = '0';
		};

		const tick = () => {
			eased.x += (pointer.x - eased.x) * lerp;
			eased.y += (pointer.y - eased.y) * lerp;
			circle.style.translate = `${eased.x}px ${eased.y}px`;
			frame = requestAnimationFrame(tick);
		};

		window.addEventListener('pointermove', onMove);
		document.addEventListener('pointerleave', onLeave);
		frame = requestAnimationFrame(tick);

		return () => {
			window.removeEventListener('pointermove', onMove);
			document.removeEventListener('pointerleave', onLeave);
			cancelAnimationFrame(frame);
		};
	}, [lerp]);

	return (
		<div ref={ref} className={classNames('custom-cursor', className)} aria-hidden="true">
			<span ref={circleRef} className="circle" />
			<span ref={dotRef} className="dot" />
		</div>
	);
};

export default CustomCursor;
