'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode, Ref } from 'react';

import { classNames } from '@/lib/classNames';

export interface RouteRevealProps {
	/** The routed content */
	children?: ReactNode;
	className?: string;
}

// Page-entrance fade-rise: keyed on the pathname so the App Router's remount restarts a pure-CSS
// animation on every navigation. No View Transitions API (it blocks pointer input); nothing is
// snapshotted, so this never blocks input and — being opacity/translate only — never shifts layout.
// Motion is gated by prefers-reduced-motion in the mirrored stylesheet.
const RouteReveal = ({ children, className, ref }: RouteRevealProps & { ref?: Ref<HTMLDivElement> }) => {
	const pathname = usePathname();
	return (
		<div ref={ref} key={pathname} className={classNames('route-reveal', className)}>
			{children}
		</div>
	);
};

export default RouteReveal;
