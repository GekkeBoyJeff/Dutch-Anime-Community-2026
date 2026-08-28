'use client';

import { useEffect, useRef } from 'react';

import { classNames } from '@/lib/shared/classNames';
import type { CustomCursorProps as CustomCursorSchemaProps } from '@/lib/site/content/schema/components/customCursor';

type CustomCursorProps = CustomCursorSchemaProps;

const CustomCursor = ({
	lerp = 0.15,
	className,
}: CustomCursorProps) => {
	const dotRef = useRef<HTMLSpanElement>(null);
	const circleRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
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
		<div className={classNames('custom-cursor', className)} aria-hidden="true">
			<span ref={circleRef} className="custom-cursor-circle" />
			<span ref={dotRef} className="custom-cursor-dot" />
		</div>
	);
};

export default CustomCursor;
