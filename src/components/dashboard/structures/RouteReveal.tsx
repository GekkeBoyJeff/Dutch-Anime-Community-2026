'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

interface RouteRevealProps {
	children?: ReactNode;
}

// Keyed on the pathname so the App Router's remount restarts a pure-CSS animation on every navigation.
const RouteReveal = ({ children }: RouteRevealProps) => {
	const pathname = usePathname();
	return (
		<div key={pathname} className="route-reveal">
			{children}
		</div>
	);
};

export default RouteReveal;
